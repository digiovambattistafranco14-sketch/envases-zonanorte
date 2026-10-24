import { useEffect, useRef, useState } from 'react'
import { ShoppingCartSimple, WhatsappLogo } from './icons.jsx'
import { navLinks, site } from '../config/site.js'
import { useCart } from '../context/CartContext.jsx'
import { categories } from '../data/products.js'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useHeaderVisibility } from '../hooks/useHeaderVisibility.js'
import { ALL, setCatalogCategory, useCatalogCategory } from '../lib/catalogFilter.js'
import { useRoute } from '../lib/router.js'
import { contactUrl } from '../lib/whatsapp.js'
import LogoSeal from './LogoSeal.jsx'
import SearchDialog, { SearchButton } from './SearchDialog.jsx'
import { WhatsAppGlyph } from './WhatsAppButton.jsx'

const NAV_HREFS = navLinks.map((link) => link.href)

// Rubros en la barra (como pidió el cliente), repartidos a los dos lados del
// logo: 4 a la izquierda y 3 a la derecha (que además tiene los botones), así
// las dos mitades pesan parecido. Tocar uno lo elige en "Elegí tu rubro".
const LEFT_CATEGORIES = categories.slice(0, 4)
const RIGHT_CATEGORIES = categories.slice(4)

function HeaderCategory({ category, active }) {
  return (
    <a
      href="#rubros"
      onClick={() => setCatalogCategory(category.id)}
      title={category.detail}
      aria-current={active ? 'true' : undefined}
      className={`relative px-2 py-2 text-[13px] font-semibold tracking-[0.05em] whitespace-nowrap uppercase transition-colors duration-300 min-[1400px]:px-2.5 min-[1400px]:text-[14px] min-[1400px]:tracking-[0.08em] 2xl:px-3.5 2xl:text-[15px] ${
        active ? 'text-gold-light' : 'text-on-panel/85 hover:text-gold-light'
      }`}
    >
      {category.short ?? category.label}
      <span
        aria-hidden="true"
        className={`absolute inset-x-2 -bottom-0.5 h-[2px] origin-left bg-gold transition-transform duration-500 ease-out-soft min-[1400px]:inset-x-2.5 2xl:inset-x-3.5 ${
          active ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </a>
  )
}

// Botón verde de WhatsApp de la barra.
function WhatsAppHeaderButton() {
  return (
    <a
      href={contactUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hablar por WhatsApp"
      title="Hablar por WhatsApp"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-[#25d366] shadow-[0_6px_16px_-6px_rgb(37_211_102/0.7)] transition-transform duration-300 ease-out-soft hover:scale-110 active:scale-95 sm:size-11"
    >
      <WhatsAppGlyph className="size-6 sm:size-[1.6rem]" />
    </a>
  )
}

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
      className="relative grid size-11 cursor-pointer place-items-center xl:hidden"
    >
      <span className={`${line} ${open ? 'rotate-45' : '-translate-y-[5px]'}`} />
      <span className={`${line} ${open ? '-rotate-45' : 'translate-y-[5px]'}`} />
    </button>
  )
}

// Cabecera: bloque negro flotante con borde dorado. En escritorio grande:
// RUBROS y tres rubros a la izquierda, el sello al centro, el resto de los
// rubros, WhatsApp y carrito a la derecha. En pantallas chicas, menú.
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  // No se oculta con el menú abierto ni mientras se navega con teclado dentro.
  const { hidden, scrolled } = useHeaderVisibility(menuOpen || focused)
  const route = useRoute()
  const onHome = route.page === 'home'
  const activeSection = useActiveSection(NAV_HREFS, onHome)
  // Fuera del inicio (rubros y productos) la sección activa es Rubros.
  const active = onHome ? activeSection : '#rubros'
  const selectedCategory = useCatalogCategory()
  const isActiveCategory = (id) => onHome && selectedCategory !== ALL && selectedCategory === id

  // Buscador: Ctrl+K o "/" (si no se está escribiendo en otro campo).
  useEffect(() => {
    const onKeyDown = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setMenuOpen(false)
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const openSearch = () => {
    setMenuOpen(false)
    setSearchOpen(true)
  }

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
      {/* minmax(0,1fr): las dos mitades miden siempre lo mismo y el logo queda en el centro exacto */}
      <div className="grid h-[4.25rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-3 sm:h-[4.75rem] sm:px-6 lg:px-8 xl:gap-4 xl:px-7 min-[1400px]:gap-5 min-[1400px]:px-8">
        <div className="flex items-center">
          <MenuToggle open={menuOpen} onClick={() => setMenuOpen((open) => !open)} />
          <span className="xl:hidden">
            <SearchButton onClick={openSearch} />
          </span>
          <nav aria-label="Rubros" className="hidden w-full items-center justify-between gap-2 xl:flex">
            <span className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.28em] text-gold-light uppercase">
              <span aria-hidden="true" className="h-px w-6 bg-gold" />
              Rubros
            </span>
            <span className="flex items-center">
              {LEFT_CATEGORIES.map((category) => (
                <HeaderCategory key={category.id} category={category} active={isActiveCategory(category.id)} />
              ))}
            </span>
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
            className="absolute top-0.5 left-1/2 h-[4.7rem] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_12px_20px_rgb(0_0_0/0.45)] transition-transform duration-500 ease-out-soft hover:scale-[1.04] sm:top-0 sm:h-[6.4rem]"
          />
        </a>

        <div className="flex items-center justify-end gap-2 xl:justify-between">
          <nav aria-label="Más rubros" className="hidden items-center xl:flex">
            {RIGHT_CATEGORIES.map((category) => (
              <HeaderCategory key={category.id} category={category} active={isActiveCategory(category.id)} />
            ))}
          </nav>
          <span className="flex items-center gap-2 xl:gap-1 min-[1400px]:gap-2">
            <span className="hidden xl:block">
              <SearchButton onClick={openSearch} />
            </span>
            <WhatsAppHeaderButton />
            <CartButton />
          </span>
        </div>
      </div>

      <nav
        id="menu-movil"
        aria-label="Principal"
        inert={!menuOpen}
        className={`absolute inset-x-0 top-full mt-2 origin-top rounded-[1.25rem] bg-panel/98 px-5 pt-2 pb-5 ring-1 ring-gold/40 backdrop-blur-xl transition-[opacity,transform] duration-500 ease-out-soft xl:hidden ${
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
                className="flex min-h-11 flex-col justify-center text-[15px] text-on-panel/80 hover:text-gold-light"
              >
                {category.short ?? category.label}
                {category.detail && <span className="text-[11px] leading-snug text-on-panel/45">{category.detail}</span>}
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
      {/* El buscador se abre en la capa superior (no lo afecta que la barra se oculte) */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
