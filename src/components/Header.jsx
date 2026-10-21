import { useEffect, useRef, useState } from 'react'
import { ShoppingCartSimple, WhatsappLogo } from './icons.jsx'
import { navLinks, site } from '../config/site.js'
import { useCart } from '../context/CartContext.jsx'
import { categories } from '../data/products.js'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useHeaderVisibility } from '../hooks/useHeaderVisibility.js'
import { setCatalogCategory } from '../lib/catalogFilter.js'
import { useRoute } from '../lib/router.js'
import { contactUrl } from '../lib/whatsapp.js'
import LogoSeal from './LogoSeal.jsx'

const NAV_HREFS = navLinks.map((link) => link.href)

function CartButton() {
  const { count, openCart } = useCart()
  const [pop, setPop] = useState(false)
  const previous = useRef(count)

  // Rebote del contador cuando se suma un producto.
  useEffect(() => {
    if (count > previous.current) setPop(true)
    previous.current = count
  }, [count])

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Abrir carrito, ${count} ${count === 1 ? 'unidad' : 'unidades'}`}
      className="relative grid size-11 cursor-pointer place-items-center text-on-panel transition-colors duration-300 hover:text-gold-light"
    >
      <ShoppingCartSimple size={24} />
      <span
        onAnimationEnd={() => setPop(false)}
        className={`absolute top-0.5 right-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-on-gold tabular-nums ${
          pop ? 'badge-pop' : ''
        }`}
      >
        {count > 999 ? '999+' : count}
      </span>
    </button>
  )
}

// Dos líneas que giran hasta formar una X.
function MenuToggle({ open, onClick }) {
  const line = 'absolute h-[1.5px] w-6 bg-on-panel transition-transform duration-500 ease-out-soft'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="menu-movil"
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      className="relative grid size-11 cursor-pointer place-items-center lg:hidden"
    >
      <span className={`${line} ${open ? 'rotate-45' : '-translate-y-[5px]'}`} />
      <span className={`${line} ${open ? '-rotate-45' : 'translate-y-[5px]'}`} />
    </button>
  )
}

// Cabecera: bloque negro flotante con borde dorado. Menú a la izquierda,
// logo rectangular al centro, WhatsApp y carrito a la derecha.
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  // No se oculta con el menú abierto ni mientras se navega con teclado dentro.
  const { hidden, scrolled } = useHeaderVisibility(menuOpen || focused)
  const route = useRoute()
  const onHome = route.page === 'home'
  const activeSection = useActiveSection(NAV_HREFS, onHome)
  // Fuera del inicio (rubros y productos) la sección activa es Rubros.
  const active = onHome ? activeSection : '#rubros'

  // Cerrar el menú móvil con Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
      className={`sticky top-0 z-40 px-2 pt-2 transition-transform duration-500 ease-out-soft sm:px-4 sm:pt-3 ${
        hidden ? '-translate-y-[calc(100%+0.5rem)]' : 'translate-y-0'
      }`}
    >
      <div
        className={`relative mx-auto max-w-[110rem] rounded-[1.25rem] bg-panel text-on-panel ring-1 ring-gold/40 transition-shadow duration-500 sm:rounded-[1.6rem] ${
          scrolled ? 'shadow-[0_18px_40px_-16px_rgb(0_0_0/0.6)]' : ''
        }`}
      >
      <div className="grid h-[4.25rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-3 sm:h-[4.75rem] sm:px-6 lg:px-8">
        <div className="flex items-center">
          <MenuToggle open={menuOpen} onClick={() => setMenuOpen((open) => !open)} />
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const current = link.href === active
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={current ? 'true' : undefined}
                      className={`px-3 py-2 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors duration-300 xl:px-4 ${
                        current ? 'text-gold-light' : 'text-on-panel/75 hover:text-on-panel'
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* El sello es más alto que la barra y sobresale por abajo, como una
            insignia. Va posicionado aparte para no estirar la fila. */}
        <a
          href="#inicio"
          className="relative block h-full w-[4.4rem] sm:w-[6rem]"
          aria-label={`${site.fullName}, ir al inicio`}
        >
          <LogoSeal
            alt=""
            eager
            sizes="104px"
            className="absolute top-1.5 left-1/2 h-[4.7rem] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_12px_20px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-out-soft hover:scale-[1.04] sm:top-2 sm:h-[6.4rem]"
          />
        </a>

        <div className="flex items-center justify-end gap-1">
          <a
            href={contactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hablar por WhatsApp"
            className="hidden size-11 place-items-center text-on-panel transition-colors duration-300 hover:text-gold-light sm:grid"
          >
            <WhatsappLogo size={23} />
          </a>
          <CartButton />
        </div>
      </div>

      <nav
        id="menu-movil"
        aria-label="Principal"
        inert={!menuOpen}
        className={`absolute inset-x-0 top-full mt-2 origin-top rounded-[1.25rem] bg-panel/98 px-5 pt-2 pb-5 ring-1 ring-gold/40 backdrop-blur-xl transition-[opacity,transform] duration-500 ease-out-soft lg:hidden ${
          menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <ul>
          {navLinks.map((link, i) => (
            <li key={link.href} className="border-b border-white/10">
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: menuOpen ? `${60 + i * 50}ms` : '0ms' }}
                className={`flex min-h-14 items-center text-[14px] font-semibold tracking-[0.18em] uppercase transition-[opacity,transform] duration-500 ease-out-soft ${
                  link.href === active ? 'text-gold-light' : 'text-on-panel'
                } ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[11px] font-bold tracking-[0.22em] text-gold-light uppercase">Rubros</p>
        <ul className="mt-2 grid grid-cols-2 gap-x-4">
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href="#rubros"
                onClick={() => {
                  setCatalogCategory(category.id)
                  setMenuOpen(false)
                }}
                className="flex min-h-11 items-center text-[15px] text-on-panel/80 hover:text-gold-light"
              >
                {category.short ?? category.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={contactUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-gold mt-5 w-full">
          <WhatsappLogo size={20} />
          Hablar por WhatsApp
        </a>
      </nav>
      </div>
    </header>
  )
}
