import { WhatsappLogo } from './icons.jsx'
import { categories, isInCategory } from '../data/products.js'
import { usePublishedProducts } from '../lib/catalog.js'
import { ALL, setCatalogCategory, useCatalogCategory } from '../lib/catalogFilter.js'
import { contactUrl } from '../lib/whatsapp.js'
import Panel from './Panel.jsx'
import ProductCard from './ProductCard.jsx'
import SectionHeading from './SectionHeading.jsx'

const OPTIONS = [{ id: ALL, label: 'Todos', image: 'frascos-tapa-plastica' }, ...categories]

const countIn = (products, id) => (id === ALL ? products.length : products.filter((p) => isInCategory(p, id)).length)
const plural = (n) => `${n} ${n === 1 ? 'producto' : 'productos'}`

// Opción del selector: miniatura redonda + nombre + cantidad.
function CategoryOption({ option, active, count, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={active}
      className={`group flex min-w-0 shrink-0 cursor-pointer items-center gap-3 rounded-full py-2 pr-5 pl-2 text-left transition-all duration-300 ease-out-soft ${
        active
          ? 'bg-panel text-on-panel shadow-[0_12px_24px_-14px_rgb(17_17_19/0.7)] ring-1 ring-gold'
          : 'bg-[#f3f4f6] text-ink ring-1 ring-black/[0.06] hover:ring-black/25'
      }`}
    >
      <span className={`size-12 shrink-0 overflow-hidden rounded-full sm:size-14 bg-white ring-1 ${active ? 'ring-gold/60' : 'ring-black/5'}`}>
        <img
          src={`/img/galeria/${option.image}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-110"
        />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[16px] font-semibold sm:text-[18px]">{option.short ?? option.label}</span>
        {option.detail && (
          <span className={`mt-0.5 line-clamp-2 text-[11px] leading-snug sm:text-[12px] ${active ? 'text-on-panel/70' : 'text-muted'}`}>{option.detail}</span>
        )}
        <span className={`text-[13px] sm:text-[14px] ${active ? 'text-gold-light' : 'text-muted'}`}>{plural(count)}</span>
      </span>
    </button>
  )
}

// "Elegí tu rubro": se elige una opción y los productos aparecen acá mismo.
export default function CategoryGrid() {
  const products = usePublishedProducts()
  const current = useCatalogCategory()
  const visible = current === ALL ? products : products.filter((p) => isInCategory(p, current))
  const selected = OPTIONS.find((o) => o.id === current)
  const label = current === ALL ? 'Todos los productos' : selected?.label

  return (
    <Panel id="rubros" tone="light" innerClassName="pt-9 pb-14 md:pt-12 md:pb-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Nuestros rubros"
          title="Elegí tu"
          accent="rubro"
          lead="Gastronomía, Eventos, Emprendedores, Bazar, Cotillón, etc."
        />

        <div role="group" aria-label="Rubros" className="no-scrollbar -mx-4 mt-10 flex gap-3 overflow-x-auto px-4 py-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
          {OPTIONS.map((option) => (
            <CategoryOption
              key={option.id}
              option={option}
              active={option.id === current}
              count={countIn(products, option.id)}
              onSelect={setCatalogCategory}
            />
          ))}
        </div>

        <p aria-live="polite" className="mt-10 text-[17px] text-muted sm:text-[19px]">
          <span className="font-semibold text-ink">{label}</span> · {plural(visible.length)}
        </p>
        {selected?.detail && <p className="mt-1 text-[14px] text-muted sm:text-[15px]">{selected.detail}</p>}

        {/* key: al cambiar de rubro la grilla vuelve a entrar con una animación suave */}
        <div key={current} className="page-in">
          {visible.length > 0 ? (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <li key={product.id} className="min-w-0">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-2xl bg-[#f3f4f6] px-6 py-14 text-center">
              <p className="text-lg font-semibold">Estamos sumando los productos de este rubro</p>
              <p className="mx-auto mt-2 max-w-[44ch] text-muted">Escribinos con lo que necesitás y te decimos qué tenemos.</p>
              <a href={contactUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6">
                <WhatsappLogo size={18} />
                Consultar
              </a>
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}
