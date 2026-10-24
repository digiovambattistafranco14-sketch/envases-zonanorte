import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ArrowRight, MagnifyingGlass, X } from './icons.jsx'
import { getCategoryLabel } from '../data/products.js'
import { usePublishedProducts } from '../lib/catalog.js'
import { productHref } from '../lib/router.js'
import { lockScroll } from '../lib/smoothScroll.js'
import { contactUrl } from '../lib/whatsapp.js'
import ProductImage from './ProductImage.jsx'

// Sin mayúsculas ni tildes: "Pote ÁMBAR" y "pote ambar" son lo mismo.
const plain = (text) =>
  String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const SUGGESTIONS = ['Frasco', 'Pote', 'Difusor', 'Ámbar', 'Vidrio', 'Tapa']

// Busca en el nombre, los rubros, la descripción, los tamaños y las
// características. Primero los que coinciden en el nombre.
function search(products, query) {
  const words = plain(query).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return products
    .map((p) => {
      const name = plain(p.name)
      const rest = plain(
        [
          getCategoryLabel(p.category),
          ...p.alsoIn.map(getCategoryLabel),
          p.description,
          ...p.variants.map((v) => v.label),
          ...p.specs.map((s) => `${s.label} ${s.value}`),
        ].join(' '),
      )
      if (!words.every((w) => name.includes(w) || rest.includes(w))) return null
      const score = words.reduce((sum, w) => sum + (name.startsWith(w) ? 3 : name.includes(w) ? 2 : 0), 0)
      return { product: p, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product)
}

export function SearchButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buscar productos"
      title="Buscar productos"
      className="grid size-11 shrink-0 cursor-pointer place-items-center text-on-panel transition-colors duration-300 hover:text-gold-light"
    >
      <MagnifyingGlass size={23} />
    </button>
  )
}

// Buscador: se abre arriba de todo, filtra mientras se escribe y con las
// flechas + Enter se elige un resultado.
export default function SearchDialog({ open, onClose }) {
  const products = usePublishedProducts()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const listId = useId()
  const results = useMemo(() => search(products, query), [products, query])

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) {
      dialog.showModal()
      lockScroll(true)
      requestAnimationFrame(() => inputRef.current?.select())
    }
    if (!open && dialog.open) dialog.close()
    if (!open) lockScroll(false)
  }, [open])

  const choose = (product) => {
    onClose()
    window.location.hash = productHref(product.id)
  }

  const onKeyDown = (event) => {
    // En un campo de búsqueda, Escape primero borraría el texto: acá cierra directo.
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (!results.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + step + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(results[Math.min(active, results.length - 1)])
    }
  }

  const update = (value) => {
    setQuery(value)
    setActive(0)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Buscar productos"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      data-lenis-prevent
      className="search-dialog mx-auto mt-3 mb-auto max-h-[calc(100dvh-1.5rem)] w-[min(44rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.5rem] bg-surface p-0 text-ink shadow-[0_40px_90px_-30px_rgb(0_0_0/0.6)] ring-1 ring-gold/40 sm:mt-[10vh]"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col sm:max-h-[80vh]">
        <div className="flex items-center gap-3 border-b border-black/[0.07] px-4 sm:px-5">
          <MagnifyingGlass size={22} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => update(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="¿Qué estás buscando? Ej: frasco ámbar"
            aria-label="Buscar productos"
            aria-controls={listId}
            aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
            autoComplete="off"
            className="h-16 min-w-0 flex-1 bg-transparent text-[17px] outline-none focus-visible:outline-none placeholder:text-muted sm:h-[4.5rem] sm:text-[19px] [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain">
          {!query.trim() ? (
            <div className="px-5 py-6">
              <p className="text-[12px] font-bold tracking-[0.18em] text-muted uppercase">Búsquedas comunes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => {
                      update(word)
                      inputRef.current?.focus()
                    }}
                    className="min-h-10 cursor-pointer rounded-full bg-[#f3f4f6] px-4 text-[14px] font-semibold ring-1 ring-black/[0.06] transition-colors hover:bg-ink hover:text-white"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length ? (
            <>
              <p aria-live="polite" className="px-5 pt-4 pb-2 text-[13px] text-muted">
                {results.length} {results.length === 1 ? 'producto' : 'productos'}
              </p>
              <ul id={listId} role="listbox" aria-label="Resultados" className="px-2 pb-2">
                {results.map((product, i) => (
                  <li key={product.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <a
                      href={productHref(product.id)}
                      onClick={(event) => {
                        event.preventDefault()
                        choose(product)
                      }}
                      onMouseMove={() => setActive(i)}
                      className={`flex items-center gap-4 rounded-2xl p-2.5 transition-colors ${i === active ? 'bg-[#f3f4f6]' : ''}`}
                    >
                      <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.06]">
                        <ProductImage product={product} sizes="64px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-bold tracking-[0.14em] text-gold-ink uppercase">{getCategoryLabel(product.category)}</span>
                        <span className="mt-0.5 block truncate text-[16px] font-semibold">{product.name}</span>
                        {product.variants.length > 0 && (
                          <span className="mt-0.5 block truncate text-[13px] text-muted">{product.variants.map((v) => v.label).join(' · ')}</span>
                        )}
                      </span>
                      <ArrowRight size={18} className={`shrink-0 transition-opacity ${i === active ? 'opacity-100' : 'opacity-0'}`} />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div aria-live="polite" className="px-6 py-10 text-center">
              <p className="text-[17px] font-semibold">No encontramos “{query.trim()}”</p>
              <p className="mx-auto mt-2 max-w-[36ch] text-[15px] text-muted">Probá con otra palabra o escribinos: capaz lo tenemos y todavía no está en la web.</p>
              <a href={contactUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6">
                Consultar por WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
