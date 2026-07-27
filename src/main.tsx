import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// Scroll position is the camera position. Restoring it on reload would drop the
// visitor mid-flight, behind the loader, so always take off from the start.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
