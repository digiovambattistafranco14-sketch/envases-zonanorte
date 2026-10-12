import { useEffect, useRef, useState } from 'react'
import { ShoppingCartSimple, WhatsappLogo } from './icons.jsx'
import { navLinks, site } from '../config/site.js'
import { useCart } from '../context/CartContext.jsx'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useHeaderVisibility } from '../hooks/useHeaderVisibility.js'
import { useRoute } from '../lib/router.js'
import { contactUrl } from '../lib/whatsapp.js'
import Logo from './Logo.jsx'

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
      className="relative grid size-11 cursor-pointer place-items-center rounded-full bg-ink text-surface transition-transform duration-300 ease-out-soft hover:scale-105 active:scale-95"
    >
      <ShoppingCartSimple size={19} />
      {count > 0 && (
        <span
          onAnimationEnd={() => setPop(false)}
          className={`absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-on-gold tabular-nums ring-2 ring-surface ${
            pop ? 'badge-pop' : ''
          }`}
        >
          {count > 999 ? '999+' : count}
        </span>
      )}
    </button>
  )
}

// Dos líneas que giran hasta formar una X.
function MenuToggle({ open, onClick }) {
  const line = 'absolute h-[1.5px] w-5 rounded-full bg-ink transition-transform duration-500 ease-out-soft'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="menu-movil"
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      className="relative grid size-11 cursor-pointer place-items-center rounded-full ring-1 ring-black/10 lg:hidden"
    >
      <span className={`${line} ${open ? 'rotate-45' : '-translate-y-[4px]'}`} />
      <span className={`${line} ${open ? '-rotate-45' : 'translate-y-[4px]'}`} />
    </button>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  // No se oculta con el menú abierto ni mientras se navega con teclado dentro.
  const { hidden, scrolled } = useHeaderVisibility(menuOpen || focused)
  const route = useRoute()
  const onHome = route.page === 'home'
  const activeSection = useActiveSection(NAV_HREFS, onHome)
  // En la página de un producto, la sección activa es el catálogo.
  const active = onHome ? activeSection : '#catalogo'

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
      className={`header-in sticky top-3 z-40 mt-3 px-3 transition-transform duration-500 ease-out-soft sm:px-6 lg:px-8 ${
        hidden ? '-translate-y-[calc(100%+1.25rem)]' : 'translate-y-0'
      }`}
    >
      <div className="relative mx-auto max-w-7xl">
        <div
          className={`flex h-16 items-center justify-between gap-3 rounded-full pr-2.5 pl-2.5 ring-1 backdrop-blur-xl transition-[background-color,box-shadow] duration-500 ease-out-soft ${
            scrolled
              ? 'bg-surface/90 shadow-[0_16px_40px_-18px_rgb(19_19_21/0.45)] ring-black/10'
              : 'bg-surface/60 shadow-none ring-black/5'
          }`}
        >
          <a href="#inicio" className="rounded-full pr-3">
            <Logo compact />
            <span className="sr-only">, ir al inicio</span>
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const current = link.href === active
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={current ? 'true' : undefined}
                      className={`relative block rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors duration-300 ease-out-soft hover:bg-black/5 ${
                        current ? 'text-ink' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {link.label}
                      {/* Marca dorada bajo la sección actual */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-4 bottom-1 h-[2px] origin-left rounded-full bg-gold transition-transform duration-500 ease-out-soft ${
                          current ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <MenuToggle open={menuOpen} onClick={() => setMenuOpen((open) => !open)} />
            <CartButton />
          </div>
        </div>

        <nav
          id="menu-movil"
          aria-label="Principal"
          inert={!menuOpen}
          className={`absolute inset-x-0 top-full mt-2 origin-top rounded-[1.75rem] bg-surface/95 p-3 shadow-card ring-1 ring-black/5 backdrop-blur-xl transition-[opacity,transform] duration-500 ease-out-soft lg:hidden ${
            menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
        >
          <ul>
            {navLinks.map((link, i) => {
              const current = link.href === active
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={current ? 'true' : undefined}
                    style={{ transitionDelay: menuOpen ? `${80 + i * 50}ms` : '0ms' }}
                    className={`flex min-h-13 items-center justify-between rounded-2xl px-4 font-display text-2xl transition-[opacity,transform] duration-500 ease-out-soft hover:bg-black/5 ${
                      current ? 'text-gold-ink' : 'text-ink'
                    } ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
          <a
            href={contactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-2 w-full"
          >
            <WhatsappLogo size={20} />
            Hablar por WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
