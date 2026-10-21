import { useEffect, useLayoutEffect, useRef } from 'react'
import CartDrawer from './components/CartDrawer.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'
import { site } from './config/site.js'
import { useCart } from './context/CartContext.jsx'
import { getProduct } from './data/products.js'
import { getStateBeforeChange, useRoute } from './lib/router.js'
import { initSmoothScroll, jumpTo } from './lib/smoothScroll.js'
import Home from './pages/Home.jsx'
import ProductPage from './pages/ProductPage.jsx'

const HOME_TITLE = `${site.fullName} | Envases y frascos por unidad y por mayor`

// Profundidad de cada página: inicio > producto.
const DEPTH = { home: 0, product: 1 }
const routeKey = (route) => (route.page === 'product' ? `p:${route.productId}` : 'home')

export default function App() {
  const { isOpen } = useCart()
  const route = useRoute()
  const key = routeKey(route)
  const product = route.page === 'product' ? getProduct(route.productId) : null

  const previous = useRef({ key, page: route.page })
  const savedScroll = useRef({}) // posición en la que se dejó cada página
  const homeHashWhenLeft = useRef('')

  useEffect(() => {
    // La posición de scroll entre páginas la maneja la app, no el navegador.
    window.history.scrollRestoration = 'manual'
    return initSmoothScroll()
  }, [])

  // Al entrar a un producto se arranca arriba. Al volver
  // se retoma donde estaba el usuario, salvo que pida otra sección del inicio.
  useLayoutEffect(() => {
    const prev = previous.current
    previous.current = { key, page: route.page }
    if (prev.key === key) return

    const left = getStateBeforeChange()
    savedScroll.current[prev.key] = left.scrollY
    if (prev.page === 'home') homeHashWhenLeft.current = left.hash

    if (route.page === 'home') {
      const otherSection = route.anchor && route.anchor !== homeHashWhenLeft.current
      const target = otherSection ? document.querySelector(route.anchor) : null
      jumpTo(target ?? savedScroll.current.home ?? 0)
    } else if (DEPTH[route.page] < DEPTH[prev.page]) {
      jumpTo(savedScroll.current[key] ?? 0)
    } else {
      jumpTo(0)
    }
  }, [key, route.page, route.anchor])

  useEffect(() => {
    let title = HOME_TITLE
    if (product) title = `${product.name} | ${site.fullName}`
    document.title = title
  }, [product])

  return (
    <>
      <div inert={isOpen}>
        <a
          href="#rubros"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-on-gold"
        >
          Ir a los rubros
        </a>
        <Header />
        <main>
          {/* El inicio queda montado (oculto) para no recargar fotos al volver. */}
          <div hidden={route.page !== 'home'}>
            <Home />
          </div>
          {route.page === 'product' && <ProductPage product={product} />}
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
      <CartDrawer />
    </>
  )
}
