import { useMemo, useState } from 'react'
import { MagnifyingGlass } from './icons.jsx'
import { categories, getCategoryLabel, products } from '../data/products.js'
import ProductCard from './ProductCard.jsx'
import Reveal from './Reveal.jsx'

const ALL = 'todos'

// Ignora mayúsculas y acentos al buscar ("ambar" encuentra "Ámbar").
const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

export default function Catalog() {
  const [category, setCategory] = useState(ALL)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return products.filter((p) => {
      if (category !== ALL && p.category !== category) return false
      if (!q) return true
      return normalize(`${p.name} ${p.description} ${getCategoryLabel(p.category)}`).includes(q)
    })
  }, [category, query])

  const filters = [{ id: ALL, label: 'Todos' }, ...categories]

  const resetFilters = () => {
    setCategory(ALL)
    setQuery('')
  }

  return (
    <section id="catalogo" className="section bg-surface-2/55">
      <div className="container-page">
        <Reveal>
          <h2 className="section-title">Catálogo</h2>
          <p className="section-lead">
            Entrá a cada producto para ver sus características y sumarlo a tu pedido.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filtrar por categoría" className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 md:mx-0 md:flex-wrap md:px-0">
            {filters.map((f) => {
              const active = category === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(f.id)}
                  className={`min-h-11 shrink-0 cursor-pointer rounded-full px-5 text-[15px] font-semibold transition-colors duration-300 ease-out-soft ${
                    active
                      ? 'bg-ink text-surface'
                      : 'bg-surface text-muted ring-1 ring-black/10 hover:text-ink hover:ring-black/40'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          <div className="relative md:w-72">
            <label htmlFor="buscar-producto" className="sr-only">
              Buscar producto
            </label>
            <MagnifyingGlass
              size={18}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
            />
            <input
              id="buscar-producto"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto"
              className="field-input rounded-full! pl-11"
            />
          </div>
        </Reveal>

        <p aria-live="polite" className="sr-only">
          {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
        </p>

        {filtered.length > 0 ? (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filtered.map((product, i) => (
              <Reveal as="li" key={product.id} delay={(i % 3) * 80} className="min-w-0">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="card-shell mt-10 px-6 py-16 text-center">
            <p className="text-lg font-semibold">No encontramos productos con ese filtro</p>
            <p className="mx-auto mt-2 max-w-[44ch] text-muted">
              Probá con otra palabra o mirá el catálogo completo. Si buscás un envase puntual,
              escribinos y lo conseguimos.
            </p>
            <button type="button" onClick={resetFilters} className="btn btn-outline mt-6">
              Ver todos los productos
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
