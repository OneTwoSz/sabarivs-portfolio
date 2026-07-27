import { useEffect, useRef, type MutableRefObject } from 'react'
import { prefersReducedMotion, usePointer } from '../lib/hooks'

/**
 * A slow-drifting field of points warped by value noise. It reacts to the
 * pointer and to scroll depth, and is the only WebGL on the page — it sits
 * behind the whole document and recedes as you scroll into the reading.
 *
 * Written against the raw WebGL API on purpose: the whole effect is one draw
 * call, so pulling in a 3D library would cost ~220 kB gzipped for nothing.
 */

const VERT = /* glsl */ `
  precision highp float;

  attribute vec3 aPosition;
  attribute float aScale;

  uniform mat4 uProj;
  uniform float uTime;
  uniform float uTravel;
  uniform float uRoll;
  uniform vec2 uPointer;
  uniform float uSize;

  varying float vFade;

  // Length of the corridor. Points that pass the camera wrap back to the far
  // end, so the field is effectively infinite in the direction of travel.
  const float LEN = 78.0;

  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(dot(hash3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
              dot(hash3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
          mix(dot(hash3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
              dot(hash3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
      mix(mix(dot(hash3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
              dot(hash3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
          mix(dot(hash3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
              dot(hash3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y),
      u.z);
  }

  void main() {
    vec3 p = aPosition;

    // Noise is sampled from the point's home position, so its drift travels
    // with it and the wrap seam never shows.
    float t = uTime * 0.08;
    float n = noise(p * 0.28 + vec3(0.0, 0.0, t));
    float n2 = noise(p * 0.55 + vec3(t * 1.4, 0.0, 0.0));

    p.x += n2 * 0.65;
    p.y += n * 0.5;

    // Scroll flies the camera forward: every point marches toward it and
    // recycles to the far end of the corridor on the way past.
    p.z = mod(p.z + uTravel, LEN) - LEN;

    // pointer parallax, strongest on the points nearest the camera
    p.xy += uPointer * 1.35 * (0.35 + (p.z + LEN) * 0.02);

    // a very slow roll so the field never looks locked to the viewport
    float c = cos(uRoll);
    float s = sin(uRoll);
    p.xy = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

    // camera sits at z = 14 looking down -z
    vec4 mv = vec4(p.x, p.y, p.z - 14.0, 1.0);
    float dist = -mv.z;

    gl_Position = uProj * mv;
    // Inverse-distance sizing across a 78-unit corridor: points arrive as
    // specks and swell as they pass, which is what sells the forward motion.
    gl_PointSize = uSize * aScale * (100.0 / dist);

    // Fade in at the far end and back out just before the camera, so points
    // arrive and leave rather than popping.
    float far = smoothstep(LEN + 14.0, LEN - 16.0, dist);
    float near = smoothstep(14.0, 27.0, dist);
    vFade = far * near * (0.35 + n * 0.65);
  }
`

const FRAG = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;

  varying float vFade;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float alpha = smoothstep(0.25, 0.0, d) * vFade * uOpacity;
    vec3 col = mix(uColor, uAccent, smoothstep(0.55, 1.0, vFade));
    gl_FragColor = vec4(col, alpha);
  }
`

const COUNT = 9000

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`shader compile failed: ${log}`)
  }
  return shader
}

/** Column-major perspective matrix, matching the classic gluPerspective. */
function perspective(out: Float32Array, fovYRad: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovYRad / 2)
  const nf = 1 / (near - far)
  out.fill(0)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) * nf
  out[11] = -1
  out[14] = 2 * far * near * nf
  return out
}

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

export default function HeroCanvas({ travel }: { travel: MutableRefObject<number> }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = usePointer()

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const gl = (canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: false }) ??
      canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false })) as
      | WebGLRenderingContext
      | null

    if (!gl) return // no WebGL: the site is fully readable without it

    let program: WebGLProgram
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT)
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
      program = gl.createProgram()!
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? 'link failed')
      }
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    } catch (err) {
      console.warn('[hero] WebGL unavailable:', err)
      return
    }

    gl.useProgram(program)

    // ---------------------------------------------------------- geometry ---
    const positions = new Float32Array(COUNT * 3)
    const scales = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      // a wide, shallow slab that reads as a horizon rather than a cube
      positions[i * 3 + 0] = (Math.random() - 0.5) * 46
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26
      // spread down the full corridor; the shader wraps within the same range
      positions[i * 3 + 2] = -Math.random() * 78
      scales[i] = 0.35 + Math.random() * 1.15
    }

    const posBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)

    const scaleBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, scaleBuf)
    gl.bufferData(gl.ARRAY_BUFFER, scales, gl.STATIC_DRAW)
    const aScale = gl.getAttribLocation(program, 'aScale')
    gl.enableVertexAttribArray(aScale)
    gl.vertexAttribPointer(aScale, 1, gl.FLOAT, false, 0, 0)

    // ---------------------------------------------------------- uniforms ---
    const u = {
      proj: gl.getUniformLocation(program, 'uProj'),
      time: gl.getUniformLocation(program, 'uTime'),
      travel: gl.getUniformLocation(program, 'uTravel'),
      roll: gl.getUniformLocation(program, 'uRoll'),
      pointer: gl.getUniformLocation(program, 'uPointer'),
      size: gl.getUniformLocation(program, 'uSize'),
      opacity: gl.getUniformLocation(program, 'uOpacity'),
      color: gl.getUniformLocation(program, 'uColor'),
      accent: gl.getUniformLocation(program, 'uAccent'),
    }

    gl.uniform3f(u.color, 0.957, 0.949, 0.941) // #f4f2f0
    gl.uniform3f(u.accent, 1.0, 0.365, 0.18) // #ff5d2e

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE) // additive

    // ------------------------------------------------------------ resize ---
    const proj = new Float32Array(16)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = Math.max(1, Math.floor(window.innerWidth * dpr))
      const h = Math.max(1, Math.floor(window.innerHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
      perspective(proj, (55 * Math.PI) / 180, w / h, 0.1, 120)
      gl.uniformMatrix4fv(u.proj, false, proj)
    }
    resize()
    window.addEventListener('resize', resize)

    // ------------------------------------------------------------- frame ---
    const reduced = prefersReducedMotion()
    const state = { opacity: 0, travel: travel.current, px: 0, py: 0, time: 0 }
    let last = performance.now()
    let frame = 0
    let running = true

    const render = (now: number) => {
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!reduced) state.time += dt

      state.opacity = damp(state.opacity, 0.78, 1.4, dt)
      // A touch of lag behind the scroll so the field carries momentum.
      state.travel = damp(state.travel, travel.current, 6, dt)
      state.px = damp(state.px, reduced ? 0 : pointer.current.x, 2.5, dt)
      state.py = damp(state.py, reduced ? 0 : -pointer.current.y, 2.5, dt)

      gl.uniform1f(u.time, state.time)
      gl.uniform1f(u.travel, state.travel)
      gl.uniform1f(u.roll, Math.sin(state.time * 0.05) * 0.04)
      gl.uniform2f(u.pointer, state.px, state.py)
      gl.uniform1f(u.size, window.innerWidth < 720 ? 1.7 : 2.4)
      gl.uniform1f(u.opacity, state.opacity)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.POINTS, 0, COUNT)

      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    // pause when the tab is hidden so we are not burning a GPU in the background
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frame)
      } else if (!running) {
        running = true
        last = performance.now()
        frame = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onLost = (e: Event) => {
      e.preventDefault()
      running = false
      cancelAnimationFrame(frame)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onLost)
      gl.deleteBuffer(posBuf)
      gl.deleteBuffer(scaleBuf)
      gl.deleteProgram(program)
    }
  }, [travel, pointer])

  return (
    <div className="hero-canvas" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
