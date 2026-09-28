import { PANEL_WORLD, PANEL_Z } from '../lib/hooks'

/**
 * The hero title, carried on into the flight as a ribbon of type.
 *
 * At rest the DOM <h1> is what you read. The ribbon's head is built to sit on
 * exactly the same pixels as its first line — same font, size, tracking and
 * position, measured from the live element — so when scrolling starts the DOM
 * title fades out over a copy of itself and nothing visibly changes. From
 * there the rest of the name unspools along a path that winds back through
 * the next few panels, turning from solid to outline, and runs out before
 * the work section.
 *
 * It is drawn in the point field's WebGL scene with the same camera, so the
 * two share one space. That only holds if the WebGL camera matches the CSS
 * one the panels use; `stageOptics` derives it from the stage's own
 * perspective so the two cannot drift apart.
 */

/** Camera position on Z. Must match the point field's vertex shader. */
export const CAM_Z = 14
export const FOV_Y = (55 * Math.PI) / 180

/**
 * The WebGL equivalent of the CSS camera. A panel at the focal plane is
 * `focal` units from the camera: CSS scales an element by P / (P - z), and the
 * flight moves PANEL_Z px of CSS for every PANEL_WORLD units of travel, so
 * matching the two gives focal = PANEL_WORLD * P / PANEL_Z. The shift is the
 * CSS perspective-origin expressed as a lens shift in NDC.
 */
export function stageOptics(width: number, height: number) {
  const stage = document.querySelector('.stage')
  const cs = stage ? getComputedStyle(stage) : null
  const persp = cs ? parseFloat(cs.perspective) : NaN
  const [ox, oy] = cs ? cs.perspectiveOrigin.split(' ').map(parseFloat) : [NaN, NaN]
  return {
    focal: (PANEL_WORLD * (Number.isFinite(persp) ? persp : 1100)) / PANEL_Z,
    shiftX: Number.isFinite(ox) ? (2 * ox) / width - 1 : 0,
    shiftY: Number.isFinite(oy) ? 1 - (2 * oy) / height : 0,
  }
}

const VERT = /* glsl */ `
  precision highp float;

  attribute vec3 aPosition;
  /** u along the text, v across it, and s: 0 at the head, 1 at the tail. */
  attribute vec3 aData;

  uniform mat4 uProj;
  uniform float uTravel;

  varying vec2 vUv;
  varying float vS;
  varying float vDist;

  void main() {
    vec3 p = aPosition;
    p.z += uTravel;
    vec4 mv = vec4(p.xy, p.z - ${CAM_Z.toFixed(1)}, 1.0);
    vDist = -mv.z;
    vUv = aData.xy;
    vS = aData.z;
    gl_Position = uProj * mv;
  }
`

const FRAG = /* glsl */ `
  precision mediump float;

  // r: solid text, g: outlined text, b: the accent star
  uniform sampler2D uTex;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uHead;        // s where the hero's first word ends
  uniform float uOutlineEnd;  // s by which the solid fill has become outline
  uniform float uReveal;      // s of the unspooling front
  uniform float uHeadAlpha;
  uniform float uHeadFade;    // the solid head, fading as it rushes past the camera
  uniform float uDim;

  varying vec2 vUv;
  varying float vS;
  varying float vDist;

  void main() {
    // Slight negative bias: at the handoff the head is shown near 1:1 and has
    // to match crisp DOM text, which plain trilinear filtering softens.
    vec3 m = texture2D(uTex, vUv, -0.4).rgb;

    float k = smoothstep(uHead, uOutlineEnd, vS);
    float textA = mix(m.r, m.g, k);
    float a = max(textA, m.b);
    if (a < 0.004) discard;
    vec3 col = mix(uColor, uAccent, m.b / a);

    float front = 1.0 - smoothstep(uReveal - 0.025, uReveal, vS);
    float gate = uHeadAlpha * (vS < uHead ? 1.0 : front);
    float tail = 1.0 - smoothstep(0.6, 0.95, vS);
    // The head stays full strength so it matches the DOM title it replaces;
    // everything after it is scenery and steps back while a panel is parked.
    float body = mix(uHeadFade, 0.72 * uDim, k);
    // Gone before it can fill the lens, and faded in from the far end.
    float depth = smoothstep(1.2, 4.5, vDist) * smoothstep(85.0, 55.0, vDist);

    gl_FragColor = vec4(col, a * gate * tail * body * depth);
  }
`

/** Width the ribbon narrows to once it has left the hero, relative to the head. */
const TAPER = 0.62
const SAMPLES_PER_SEGMENT = 48

type Vec3 = [number, number, number]

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

function catmullRom(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t
  const t3 = t2 * t
  const out: Vec3 = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    out[i] =
      0.5 *
      (2 * p1[i] +
        (-p0[i] + p2[i]) * t +
        (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 +
        (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3)
  }
  return out
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`ribbon shader compile failed: ${log}`)
  }
  return shader
}

/** Everything about the title's type that the texture and mesh need. */
type Type = {
  font: string
  size: number
  tracking: number
  word: string
  head: string
}

function readTitle(h1: HTMLElement): Type | null {
  const lines = Array.from(h1.children) as HTMLElement[]
  if (!lines.length) return null
  const cs = getComputedStyle(lines[0])
  const size = parseFloat(cs.fontSize)
  const upper = cs.textTransform === 'uppercase'
  const text = lines.map((l) => (l.textContent ?? '').trim())
  const word = text.join(' ')
  return {
    font: `${cs.fontWeight} {SIZE}px ${cs.fontFamily}`,
    size,
    tracking: (parseFloat(cs.letterSpacing) || 0) / size,
    word: upper ? word.toUpperCase() : word,
    head: upper ? text[0].toUpperCase() : text[0],
  }
}

/**
 * Paints one repeat of the ribbon — "NAME ✦ " — into a power-of-two texture so
 * it can wrap and mipmap. Layout is done at a nominal 100px font and scaled
 * into the texture; the returned metrics are in those nominal units.
 */
function paintTile(type: Type, maxSize: number) {
  const FS = 100
  const font = type.font.replace('{SIZE}', String(FS))

  const probe = document.createElement('canvas').getContext('2d')!
  probe.font = font
  // Canvas tracking is newer than the rest of the API; without it the head is
  // ~2% narrower than the DOM title, which the crossfade hides.
  if ('letterSpacing' in probe) probe.letterSpacing = `${type.tracking * FS}px`
  const wordM = probe.measureText(type.word)
  const asc = wordM.fontBoundingBoxAscent
  const desc = wordM.fontBoundingBoxDescent
  const cap = probe.measureText('H').actualBoundingBoxAscent
  const headW = probe.measureText(type.head).width

  const pad = 0.14 * FS
  const band = asc + desc + 2 * pad
  const gap = 0.42 * FS
  const starR = 0.2 * FS
  const tileW = wordM.width + gap + 2 * starR + gap

  const texW = Math.min(4096, maxSize)
  const texH = texW / 8
  const canvas = document.createElement('canvas')
  canvas.width = texW
  canvas.height = texH
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, texW, texH)
  ctx.setTransform(texW / tileW, 0, 0, texH / band, 0, 0)
  ctx.globalCompositeOperation = 'lighter'
  ctx.font = font
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${type.tracking * FS}px`

  const baseline = pad + asc
  ctx.fillStyle = '#f00'
  ctx.fillText(type.word, 0, baseline)
  ctx.strokeStyle = '#0f0'
  // Heavier than looks necessary: the outline is mostly seen far off and at
  // a slant, where a hairline breaks up into dashes.
  ctx.lineWidth = 0.026 * FS
  ctx.lineJoin = 'round'
  ctx.strokeText(type.word, 0, baseline)

  // Four-point star, drawn rather than typed: the display face has no glyph for it.
  const cx = wordM.width + gap + starR
  const cy = baseline - cap / 2
  const inner = starR * 0.28
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const r = i % 2 ? inner : starR
    const a = (i * Math.PI) / 4 - Math.PI / 2
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
  }
  ctx.closePath()
  ctx.fillStyle = '#00f'
  ctx.fill()

  return { canvas, asc, desc, band, tileW, headW }
}

export function createRibbon(gl: WebGLRenderingContext) {
  const h1 = document.querySelector<HTMLElement>('.p-intro h1')
  if (!h1) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  const program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'ribbon link failed')
  }

  const aPosition = gl.getAttribLocation(program, 'aPosition')
  const aData = gl.getAttribLocation(program, 'aData')
  const u = {
    proj: gl.getUniformLocation(program, 'uProj'),
    travel: gl.getUniformLocation(program, 'uTravel'),
    tex: gl.getUniformLocation(program, 'uTex'),
    color: gl.getUniformLocation(program, 'uColor'),
    accent: gl.getUniformLocation(program, 'uAccent'),
    head: gl.getUniformLocation(program, 'uHead'),
    outlineEnd: gl.getUniformLocation(program, 'uOutlineEnd'),
    reveal: gl.getUniformLocation(program, 'uReveal'),
    headAlpha: gl.getUniformLocation(program, 'uHeadAlpha'),
    headFade: gl.getUniformLocation(program, 'uHeadFade'),
    dim: gl.getUniformLocation(program, 'uDim'),
  }

  const buffer = gl.createBuffer()!
  const texture = gl.createTexture()!
  const aniso =
    gl.getExtension('EXT_texture_filter_anisotropic') ??
    gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')

  let vertexCount = 0
  let head01 = 0
  let outlineEnd01 = 0
  let type: Type | null = null
  let tile: ReturnType<typeof paintTile> | null = null
  let size = { w: 0, h: 0 }
  let disposed = false

  const uploadTexture = () => {
    if (!type) return
    tile = paintTile(type, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tile.canvas)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // The ribbon is mostly seen at a slant, which is exactly where plain
    // mipmapping smears type into mush.
    if (aniso) {
      const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max))
    }
  }

  /** Where the title's first line sits on screen, with the flight's transform removed. */
  const measureHead = () => {
    const panel = h1.closest<HTMLElement>('.panel')
    const line = h1.firstElementChild
    if (!panel || !line) return null
    const { transform, display } = panel.style
    panel.style.transform = 'none'
    panel.style.display = ''
    const range = document.createRange()
    range.selectNodeContents(line)
    const rect = range.getBoundingClientRect()
    panel.style.transform = transform
    panel.style.display = display
    return rect.height > 0 ? rect : null
  }

  const buildMesh = () => {
    if (!tile || !size.w) return
    const rect = measureHead()
    if (!rect) return

    const { w: W, h: H } = size
    const optics = stageOptics(W, H)
    const D = optics.focal
    const tanHalf = Math.tan(FOV_Y / 2)
    const worldPerPx = (2 * D * tanHalf) / H
    const toWorld = (x: number, y: number): [number, number] => {
      const nx = (2 * x) / W - 1
      const ny = 1 - (2 * y) / H
      return [(nx - optics.shiftX) * D * tanHalf * (W / H), (ny - optics.shiftY) * D * tanHalf]
    }

    // Nominal type units → world units, via the DOM title's rendered size.
    const k = (rect.height / (tile.asc + tile.desc)) * worldPerPx
    const width0 = tile.band * k
    const tileLen = tile.tileW * k
    const headLen = tile.headW * k

    const zHero = CAM_Z - D
    const [x0, yC] = toWorld(rect.left, rect.top + rect.height / 2)

    // Half-extent of the view at the focal plane, which the loops are sized
    // against so they read the same on a phone as on a wide monitor.
    const rx = clamp(D * tanHalf * (W / H), 2, 8.5) * 0.95
    const ry = D * tanHalf * 0.78
    const zAt = (n: number) => zHero - n

    // The first four points are collinear, so the head is a dead straight run
    // exactly as long as the title's first line. After that the path loops
    // clockwise through the corridor — clockwise so the type is upright on the
    // top passes — and each loop sits between panels so the camera threads it.
    const pts: Vec3[] = [
      [x0 - headLen * 0.5, yC, zHero],
      [x0, yC, zHero],
      [x0 + headLen * 0.5, yC, zHero],
      [x0 + headLen, yC, zHero],
      [x0 + headLen * 1.25, yC, zHero],
      // A long, shallow first bend, mostly off the right edge, so the text
      // leaving the hero turns away rather than folding up on screen.
      [Math.max(rx * 1.25, x0 + headLen * 1.6), yC - ry * 0.2, zAt(5)],
      [rx * 0.9, -ry * 0.8, zAt(9)],
      [0, -ry, zAt(12.5)],
      [-rx * 0.85, -ry * 0.55, zAt(15.5)],
      [-rx * 0.95, ry * 0.45, zAt(19.5)],
      [0, ry, zAt(23.5)],
      [rx * 0.85, ry * 0.5, zAt(27.5)],
      [rx * 0.95, -ry * 0.5, zAt(31.5)],
      [rx * 0.2, -ry, zAt(35.5)],
      [-rx * 0.7, -ry * 0.8, zAt(39.5)],
      [-rx * 1.2, -ry * 0.2, zAt(43.5)],
    ]

    const centers: Vec3[] = []
    for (let i = 1; i < pts.length - 2; i++) {
      for (let j = 0; j < SAMPLES_PER_SEGMENT; j++) {
        centers.push(catmullRom(pts[i - 1], pts[i], pts[i + 1], pts[i + 2], j / SAMPLES_PER_SEGMENT))
      }
    }
    centers.push(pts[pts.length - 2])

    const lengths = [0]
    for (let i = 1; i < centers.length; i++) {
      const a = centers[i - 1]
      const b = centers[i]
      lengths.push(lengths[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))
    }
    const total = lengths[lengths.length - 1]

    const data = new Float32Array(centers.length * 2 * 6)
    let across: [number, number] = [0, 1]
    let uAcc = 0
    for (let i = 0; i < centers.length; i++) {
      const s = lengths[i]
      const prev = centers[Math.max(0, i - 1)]
      const next = centers[Math.min(centers.length - 1, i + 1)]
      const tx = next[0] - prev[0]
      const ty = next[1] - prev[1]
      const len = Math.hypot(tx, ty)
      // The text's "up" is the path's direction turned 90° in the view plane,
      // so the band always stands facing down the corridor. Only undefined if
      // the path ever heads straight at the camera; hold the last one then.
      if (len > 1e-4) across = [-ty / len, tx / len]

      const taper = 1 - (1 - TAPER) * smoothstep(headLen, headLen + tileLen * 1.2, s)
      const half = (width0 * taper) / 2
      // Advance u by true arc length over the *local* tile length, so the
      // letters keep their proportions as the band narrows.
      if (i > 0) uAcc += (s - lengths[i - 1]) / (tileLen * taper)

      const c = centers[i]
      const o = i * 12
      data.set([c[0] + across[0] * half, c[1] + across[1] * half, c[2], uAcc, 0, s / total], o)
      data.set([c[0] - across[0] * half, c[1] - across[1] * half, c[2], uAcc, 1, s / total], o + 6)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    vertexCount = centers.length * 2
    head01 = headLen / total
    outlineEnd01 = (headLen + tileLen * 0.9) / total
  }

  // The texture needs the display face actually loaded, or it would bake in
  // the fallback font and the handoff would visibly jump.
  const fonts = document.fonts as FontFaceSet | undefined
  const fontReady = fonts
    ? Promise.race([
        fonts.load(`900 100px ${getComputedStyle(h1).fontFamily}`).then(() => fonts.ready),
        new Promise((r) => window.setTimeout(r, 3000)),
      ])
    : Promise.resolve()
  fontReady.then(() => {
    if (disposed) return
    type = readTitle(h1)
    uploadTexture()
    buildMesh()
  })

  return {
    resize(w: number, h: number) {
      size = { w, h }
      buildMesh()
    },

    /**
     * @param travel world units of camera travel — the raw value, not the
     *   point field's smoothed one, so the ribbon stays locked to the panels.
     */
    draw(proj: Float32Array, travel: number) {
      const t = travel / PANEL_WORLD

      // The handoff: the ribbon's head appears under the DOM title, then the
      // title fades off the top of it. Written here so it cannot fire when
      // the ribbon failed to build and there is nothing underneath.
      const ready = vertexCount > 0
      h1.style.opacity = ready ? (1 - smoothstep(0.05, 0.13, t)).toFixed(3) : ''
      if (!ready) return

      const headAlpha = smoothstep(0.0, 0.05, t)
      if (headAlpha <= 0) return

      // Unspools faster than the camera flies, so the front is always out
      // ahead of you rather than being drawn in your face.
      const reveal = head01 + (1.05 - head01) * (1 - Math.pow(1 - smoothstep(0.04, 1.4, t), 2))
      // Steps back while a panel is parked at the focal plane, comes forward
      // in the crossings between them.
      const between = Math.sin((((t % 1) + 1) % 1) * Math.PI)
      const dim = 1 - smoothstep(0.35, 0.8, t) * (1 - (0.3 + 0.7 * between))

      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(aPosition)
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0)
      gl.enableVertexAttribArray(aData)
      gl.vertexAttribPointer(aData, 3, gl.FLOAT, false, 24, 12)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(u.tex, 0)
      gl.uniformMatrix4fv(u.proj, false, proj)
      gl.uniform1f(u.travel, travel)
      gl.uniform3f(u.color, 0.957, 0.949, 0.941) // #f4f2f0
      gl.uniform3f(u.accent, 1.0, 0.365, 0.18) // #ff5d2e
      gl.uniform1f(u.head, head01)
      gl.uniform1f(u.outlineEnd, outlineEnd01)
      gl.uniform1f(u.reveal, reveal)
      gl.uniform1f(u.headAlpha, headAlpha)
      // The solid head follows the hero panel out — it is the title, after
      // all — so it never sits huge and opaque behind the pitch.
      gl.uniform1f(u.headFade, 1 - smoothstep(0.2, 0.55, t))
      gl.uniform1f(u.dim, dim)

      // Ordinary "over" blending, unlike the additive points: the head has to
      // come out exactly the title's colour, not brighter where stars sit.
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount)

      gl.disableVertexAttribArray(aPosition)
      gl.disableVertexAttribArray(aData)
    },

    dispose() {
      disposed = true
      h1.style.opacity = ''
      gl.deleteBuffer(buffer)
      gl.deleteTexture(texture)
      gl.deleteProgram(program)
    },
  }
}
