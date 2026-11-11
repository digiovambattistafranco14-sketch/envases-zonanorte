import { Component } from 'react'
import { site } from '../config/site.js'
import { contactUrl } from '../lib/whatsapp.js'

// Si algo falla al mostrar la web (un celular viejo, datos guardados dañados...),
// en vez de una pantalla en blanco se ve este aviso con el WhatsApp.
function clearSavedData() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('efzn-'))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // Sin almacenamiento: no hay nada que borrar.
  }
}

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('[web] Error al mostrar la página:', error)
  }

  retry = () => {
    clearSavedData()
    window.location.reload()
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f4f4f5', fontFamily: 'system-ui, sans-serif', color: '#111113' }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>{site.fullName}</h1>
          <p style={{ marginTop: 12, lineHeight: 1.5, color: '#55555c' }}>
            No pudimos mostrar la página en este dispositivo. Probá de nuevo o escribinos por WhatsApp y te atendemos.
          </p>
          <button
            type="button"
            onClick={this.retry}
            style={{ marginTop: 20, width: '100%', minHeight: 48, borderRadius: 12, border: 0, background: '#111113', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          >
            Volver a intentar
          </button>
          <a
            href={contactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: 12, background: '#25d366', color: '#fff', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}
          >
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    )
  }
}
