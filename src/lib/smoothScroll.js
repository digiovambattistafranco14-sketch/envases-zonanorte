import Lenis from 'lenis'

let lenis = null

// Suscriptores a la posición de scroll (la emite Lenis en cada frame de scroll).
const scrollListeners = new Set()
export function onScroll(listener) {
  scrollListeners.add(listener)
  return () => scrollListeners.delete(listener)
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const anchorOffset = () =>
  -parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop || '0')

// Clic en un ancla (#rubros, #contacto...) cuya sección está visible: scroll
// suave hasta ella. Las rutas (#/producto/...) y las anclas de una página
// oculta siguen su curso normal y las resuelve el router.
function onAnchorClick(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return
  const link = event.target.closest?.('a[href^="#"]')
  const hash = link?.getAttribute('href')
  if (!hash || hash.length < 2 || hash.startsWith('#/')) return
  const target = document.getElementById(hash.slice(1))
  if (!target || target.offsetParent === null) return

  event.preventDefault()
  if (window.location.hash !== hash) window.history.pushState(null, '', hash)
  lenis.scrollTo(target, { duration: 1.1 }) // Lenis ya descuenta el scroll-padding-top
}

// Scroll suave con inercia. Con "reducir movimiento" activo queda el scroll nativo.
export function initSmoothScroll() {
  if (prefersReducedMotion()) return () => {}
  lenis = new Lenis({ autoRaf: true, lerp: 0.09 })
  lenis.on('scroll', ({ scroll }) => scrollListeners.forEach((listener) => listener(scroll)))
  document.addEventListener('click', onAnchorClick)
  return () => {
    document.removeEventListener('click', onAnchorClick)
    lenis?.destroy()
    lenis = null
  }
}

// Bloquea el scroll de la página mientras hay un panel abierto.
export function lockScroll(locked) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  if (locked) lenis?.stop()
  else lenis?.start()
}

// Salto instantáneo (cambio de página): a una posición en px o a un elemento.
export function jumpTo(target) {
  const top =
    typeof target === 'number'
      ? target
      : target.getBoundingClientRect().top + window.scrollY + anchorOffset()
  if (lenis) {
    lenis.resize() // la altura cambió al cambiar de página
    lenis.scrollTo(top, { immediate: true, force: true })
  } else {
    window.scrollTo(0, top)
  }
}

