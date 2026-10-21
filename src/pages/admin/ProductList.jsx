import { useMemo, useState } from 'react'
import { ArrowSquareOut, Copy, Eye, EyeSlash, MagnifyingGlass, PencilSimple, Plus, Trash, X } from '../../components/icons.jsx'
import ProductImage from '../../components/ProductImage.jsx'
import { categories, getCategoryLabel, isInCategory } from '../../data/products.js'
import { deleteProduct, duplicateProduct, setPublished, slugify, useAllProducts } from '../../lib/catalog.js'
import { formatPrice } from '../../lib/format.js'
import { adminHref, productHref } from '../../lib/router.js'
import { ConfirmDialog, Segmented, Switch, useAction, useToast } from './ui.jsx'

const ALL = 'todos'
const STATUS = [
  { value: ALL, label: 'Todos' },
  { value: 'visible', label: 'En la web' },
  { value: 'hidden', label: 'Ocultos' },
]

function priceSummary(product) {
  const prices = product.variants.map((v) => v.price).filter((p) => p != null)
  if (product.variants.length > 0) {
    const sizes = `${product.variants.length} ${product.variants.length === 1 ? 'tamaño' : 'tamaños'}`
    return prices.length ? `${sizes} · desde ${formatPrice(Math.min(...prices))}` : `${sizes} · a consultar`
  }
  return product.price == null ? 'Precio a consultar' : formatPrice(product.price)
}

function IconButton({ label, onClick, href, children, danger = false }) {
  const className = `grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-muted transition-colors ${
    danger ? 'hover:bg-[#fdecec] hover:text-[#c0392b]' : 'hover:bg-[#eceef1] hover:text-ink'
  }`
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={className} onClick={(e) => e.stopPropagation()}>
        {children}
      </a>
    )
  }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={className}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      {children}
    </button>
  )
}

function ProductRow({ product, onDelete }) {
  const toast = useToast()
  const editHref = adminHref.edit(product.id)
  const extra = product.alsoIn.length

  const run = useAction()
  const [busy, setBusy] = useState(false)

  const togglePublished = (value) =>
    run(async () => {
      setBusy(true)
      try {
        await setPublished(product.id, value)
      } finally {
        setBusy(false)
      }
      toast(value ? `“${product.name}” ya se ve en la web` : `“${product.name}” quedó oculto`)
    })

  const duplicate = () =>
    run(async () => {
      const copy = await duplicateProduct(product.id)
      toast('Copia creada (oculta hasta que la publiques)', {
        action: { label: 'Editar', href: adminHref.edit(copy.id) },
      })
    })

  return (
    <li
      onClick={() => (window.location.hash = editHref)}
      className="group grid cursor-pointer grid-cols-[4.5rem_1fr_auto] items-center gap-x-4 gap-y-3 rounded-2xl bg-white p-3 ring-1 ring-black/[0.06] transition-shadow duration-300 hover:shadow-card-hover sm:p-3.5 md:grid-cols-[5rem_minmax(0,1fr)_11rem_9.5rem_auto]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.06]">
        <ProductImage product={product} sizes="80px" />
        {!product.published && <span className="absolute inset-0 bg-white/55" />}
      </div>

      <div className="min-w-0">
        <a
          href={editHref}
          onClick={(e) => e.stopPropagation()}
          className="block truncate text-[16px] font-semibold tracking-tight hover:underline sm:text-[17px]"
        >
          {product.name}
        </a>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
          <span className="font-semibold text-gold-ink">{getCategoryLabel(product.category)}</span>
          {extra > 0 && (
            <span className="rounded-md bg-[#eceef1] px-1.5 py-0.5 text-[12px] font-medium">
              +{extra} {extra === 1 ? 'rubro' : 'rubros'}
            </span>
          )}
          <span className="w-full md:hidden">{priceSummary(product)}</span>
        </p>
      </div>

      <p className="hidden text-[14px] text-muted md:block">{priceSummary(product)}</p>

      {/* Estado: en celular va a la derecha de la foto, en compu tiene su columna */}
      <div className="col-start-3 row-start-1 flex items-center gap-2.5 md:col-start-auto md:row-start-auto" onClick={(e) => e.stopPropagation()}>
        <Switch checked={product.published} disabled={busy} onChange={togglePublished} label={`Mostrar ${product.name} en la web`} />
        <span className={`hidden text-[13px] font-semibold sm:inline ${product.published ? 'text-[#1f7a45]' : 'text-muted'}`}>
          {product.published ? 'En la web' : 'Oculto'}
        </span>
      </div>

      <div className="col-span-3 flex items-center justify-end gap-1 border-t border-black/[0.06] pt-2 md:col-span-1 md:border-0 md:pt-0">
        <a
          href={editHref}
          onClick={(e) => e.stopPropagation()}
          className="mr-auto inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-[14px] font-semibold text-ink ring-1 ring-black/10 transition-colors hover:bg-ink hover:text-white md:mr-1"
        >
          <PencilSimple size={16} weight="bold" />
          Editar
        </a>
        {product.published && (
          <IconButton label="Ver en la web" href={productHref(product.id)}>
            <ArrowSquareOut size={19} />
          </IconButton>
        )}
        <IconButton label="Duplicar" onClick={duplicate}>
          <Copy size={19} />
        </IconButton>
        <IconButton label="Eliminar" danger onClick={() => onDelete(product)}>
          <Trash size={19} />
        </IconButton>
      </div>
    </li>
  )
}

export default function ProductList() {
  const products = useAllProducts()
  const toast = useToast()
  const run = useAction()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [toDelete, setToDelete] = useState(null)

  const visibleCount = products.filter((p) => p.published).length

  const filtered = useMemo(() => {
    const words = query.trim() ? slugify(query).split('-') : []
    return products.filter((p) => {
      if (category !== ALL && !isInCategory(p, category)) return false
      if (status === 'visible' && !p.published) return false
      if (status === 'hidden' && p.published) return false
      const haystack = slugify(`${p.name} ${getCategoryLabel(p.category)}`)
      return words.every((w) => haystack.includes(w))
    })
  }, [products, query, category, status])

  const filtering = query || category !== ALL || status !== ALL
  const clearFilters = () => {
    setQuery('')
    setCategory(ALL)
    setStatus(ALL)
  }

  return (
    <div className="page-in">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[2.4rem] leading-none font-medium tracking-tight sm:text-5xl">Productos</h1>
          <p className="mt-3 text-[15px] text-muted">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} ·{' '}
            <span className="inline-flex items-center gap-1">
              <Eye size={15} /> {visibleCount} en la web
            </span>
            {products.length - visibleCount > 0 && (
              <>
                {' '}
                ·{' '}
                <span className="inline-flex items-center gap-1">
                  <EyeSlash size={15} /> {products.length - visibleCount} ocultos
                </span>
              </>
            )}
          </p>
        </div>
        <a href={adminHref.create} className="btn btn-primary group min-h-13 self-start rounded-2xl px-6 text-[14px] sm:self-auto">
          <Plus size={18} weight="bold" />
          Nuevo producto
        </a>
      </div>

      {/* Buscador y filtros */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/[0.06] lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar producto</span>
          <MagnifyingGlass size={19} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="field-input bg-[#f5f6f8] pl-11 ring-transparent"
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative">
            <span className="sr-only">Rubro</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field-input min-w-52 cursor-pointer appearance-none bg-[#f5f6f8] pr-10 font-medium ring-transparent"
            >
              <option value={ALL}>Todos los rubros</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted">▾</span>
          </label>
          <Segmented value={status} onChange={setStatus} options={STATUS} label="Estado" />
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-4 space-y-2.5">
          {filtered.map((product) => (
            <ProductRow key={product.id} product={product} onDelete={setToDelete} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-black/[0.06]">
          {filtering ? (
            <>
              <p className="text-lg font-semibold">No hay productos con esos filtros</p>
              <button type="button" onClick={clearFilters} className="btn btn-outline mt-6 min-h-11">
                <X size={16} weight="bold" />
                Limpiar filtros
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">Todavía no hay productos</p>
              <p className="mx-auto mt-2 max-w-[40ch] text-muted">Cargá el primero: le ponés una foto, el nombre y el rubro, y ya aparece en la web.</p>
              <a href={adminHref.create} className="btn btn-primary mt-6">
                <Plus size={18} weight="bold" />
                Cargar el primero
              </a>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar este producto?"
        confirmLabel="Sí, eliminar"
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          const { id, name } = toDelete
          setToDelete(null)
          run(async () => {
            await deleteProduct(id)
            toast(`“${name}” eliminado`)
          })
        }}
      >
        <strong className="font-semibold text-ink">{toDelete?.name}</strong> se borra de la web y del panel. Si solo querés sacarlo por un tiempo, mejor
        ocultalo con el interruptor.
      </ConfirmDialog>
    </div>
  )
}
