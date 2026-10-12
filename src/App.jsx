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

const HOME_TITLE = `${site.fullName} | Potes, botellas y difusores`

export default function App() {
  const { isOpen } = useCart()
  const route = useRoute()
  const onProduct = route.page === 'product'
  const product = onProduct ? getProduct(route.productId) : null

  const homeState = useRef({ scrollY: 0, hash: '' })
  const previousPage = useRef(route.page)

  useEffect(() => {
    // La posición de scroll entre páginas la maneja la app, no el navegador.
    window.history.scrollRestoration = 'manual'
    return initSmoothScroll()
  }, [])

  // Al entrar a un producto se sube al tope. Al volver al inicio se retoma el
  // lugar donde estaba el usuario, salvo que pida otra sección (otra ancla).
  useLayoutEffect(() => {
    const cameFrom = previousPage.current
    previousPage.current = route.page
    if (onProduct) {
      if (cameFrom === 'home') homeState.current = getStateBeforeChange()
      jumpTo(0)
    } else if (cameFrom === 'product') {
      const left = homeState.current
      const sameSection = (route.anchor ?? '') === left.hash || route.anchor === '#catalogo'
      const target = !sameSection && route.anchor ? document.querySelector(route.anchor) : null
      jumpTo(target ?? left.scrollY)
    }
  }, [onProduct, route.page, route.productId, route.anchor])

  useEffect(() => {
    document.title = product ? `${product.name} | ${site.fullName}` : HOME_TITLE
  }, [product])

  return (
    <>
      <div inert={isOpen}>
        <a
          href="#catalogo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-on-gold"
        >
          Ir al catálogo
        </a>
        <Header />
        <main>
          {/* El inicio queda montado (oculto) para conservar filtros y búsqueda. */}
          <div hidden={onProduct}>
            <Home />
          </div>
          {onProduct && <ProductPage product={product} />}
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
      <CartDrawer />
    </>
  )
}
