import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowSquareOut, Check, Image as ImageIcon, Plus, Trash, UploadSimple, X } from '../../components/icons.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import { productImageUrl } from '../../components/ProductImage.jsx'
import { categories, getCategoryLabel } from '../../data/products.js'
import { CatalogError, deleteProduct, getProduct, saveProduct, slugify, uploadImage } from '../../lib/catalog.js'
import { formatPrice } from '../../lib/format.js'
import { adminHref, productHref } from '../../lib/router.js'
import { jumpTo } from '../../lib/smoothScroll.js'
import { ConfirmDialog, Field, FormSection, Segmented, Switch, useAction, useToast } from './ui.jsx'

// Características sugeridas, con un ejemplo de valor para cada una.
const SPEC_EXAMPLES = {
  Material: 'Vidrio',
  Capacidad: '250 cc',
  Tapa: 'Metálica a rosca',
  Color: 'Ámbar',
  Medidas: '7 x 12 cm',
  Boca: '63 mm',
  Modelo: 'Hexagonal',
}
const SPEC_SUGGESTIONS = Object.keys(SPEC_EXAMPLES)
const DESCRIPTION_HINT = 300

let rowCounter = 0
const rowKey = () => `r${(rowCounter += 1)}`

const onlyDigits = (value) => value.replace(/\D/g, '')
const toPrice = (text) => (text === '' ? null : Number(text))

// Producto guardado -> estado del formulario (los precios se editan como texto).
function toDraft(product) {
  if (!product) {
    return {
      name: '',
      category: '',
      alsoIn: [],
      description: '',
      image: '',
      imageFit: 'contain',
      multiSize: false,
      price: '',
      variants: [
        { key: rowKey(), label: '', price: '' },
        { key: rowKey(), label: '', price: '' },
      ],
      specs: [
        { key: rowKey(), label: 'Material', value: '' },
        { key: rowKey(), label: 'Capacidad', value: '' },
      ],
      published: true,
    }
  }
  const hasVariants = product.variants.length > 0
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    alsoIn: product.alsoIn,
    description: product.description,
    image: product.image,
    imageFit: product.imageFit,
    multiSize: hasVariants,
    price: product.price == null ? '' : String(product.price),
    variants: hasVariants
      ? product.variants.map((v) => ({
          key: rowKey(),
          id: v.id,
          label: v.label,
          price: v.price == null ? '' : String(v.price),
        }))
      : [{ key: rowKey(), label: '', price: '' }],
    specs: product.specs.map((s) => ({
      key: rowKey(),
      label: s.label,
      value: s.value,
    })),
    published: product.published,
    sortOrder: product.sortOrder,
  }
}

// Estado del formulario -> producto (lo que se guarda y lo que muestra la vista previa).
function toProduct(draft) {
  const usedIds = new Set()
  const variants = draft.multiSize
    ? draft.variants
        .filter((v) => v.label.trim())
        .map((v) => {
          // Se conserva el id de los tamaños que ya existían (el carrito los usa).
          let id = v.id ?? slugify(v.label)
          while (usedIds.has(id)) id = `${id}-b`
          usedIds.add(id)
          return { id, label: v.label.trim(), price: toPrice(v.price) }
        })
    : []
  return {
    id: draft.id,
    name: draft.name.trim(),
    category: draft.category,
    alsoIn: draft.alsoIn.filter((c) => c !== draft.category),
    description: draft.description.trim(),
    image: draft.image,
    imageFit: draft.imageFit,
    price: draft.multiSize ? null : toPrice(draft.price),
    variants,
    specs: draft.specs.filter((s) => s.label.trim() && s.value.trim()).map((s) => ({ label: s.label.trim(), value: s.value.trim() })),
    published: draft.published,
    ...(draft.sortOrder != null && { sortOrder: draft.sortOrder }),
  }
}

function validate(draft) {
  const errors = {}
  if (!draft.name.trim()) errors.name = 'Poné el nombre del producto.'
  if (!draft.category) errors.category = 'Elegí en qué rubro va.'
  if (draft.multiSize && !draft.variants.some((v) => v.label.trim())) errors.variants = 'Cargá al menos un tamaño, o elegí “Un solo tamaño”.'
  return errors
}

/* ---------- 1. Foto ---------- */

function PhotoPicker({ image, fit, onImage, onFit }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const { url, fit: suggested } = await uploadImage(file)
      onImage(url, suggested)
    } catch (err) {
      setError(err instanceof CatalogError ? err.message : 'No pudimos cargar esa foto.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-start">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={`relative mx-auto aspect-[4/5] w-full max-w-[15rem] overflow-hidden rounded-2xl transition-all duration-200 ${
          image ? 'bg-white ring-1 ring-black/10' : 'border-2 border-dashed bg-[#f5f6f8]'
        } ${dragging ? 'scale-[1.02] border-gold bg-[#f6efdc] ring-2 ring-gold' : 'border-[#c9cad1]'}`}
      >
        {image ? (
          <img src={productImageUrl(image, 480)} alt="" className={`size-full ${fit === 'contain' ? 'img-studio p-[5%]' : 'object-cover'}`} />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="flex size-full cursor-pointer flex-col items-center justify-center gap-3 px-5 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full bg-white text-ink shadow-[0_6px_16px_-8px_rgb(0_0_0/0.3)]">
              <UploadSimple size={26} />
            </span>
            <span className="text-[15px] font-semibold">Subir foto</span>
            <span className="text-[13px] leading-snug text-muted">Tocá acá o arrastrá la foto</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/80 text-[14px] font-semibold">
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
              Preparando foto…
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        {image ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => inputRef.current.click()} className="btn btn-outline min-h-11 px-5 text-[14px] tracking-normal normal-case">
              <ImageIcon size={18} />
              Cambiar foto
            </button>
            <button
              type="button"
              onClick={() => onImage('', fit)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-muted hover:bg-[#fdecec] hover:text-[#c0392b]"
            >
              <Trash size={17} />
              Quitar
            </button>
          </div>
        ) : (
          <p className="text-[14px] leading-relaxed text-muted">
            Usá una foto clara del producto, idealmente vertical. Si no tenés una ahora, podés guardarlo igual y agregarla después.
          </p>
        )}
        {error && <p className="text-[14px] font-medium text-[#c0392b]">{error}</p>}

        <div>
          <p className="text-[15px] font-semibold">¿Qué tipo de foto es?</p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {[
              {
                value: 'contain',
                title: 'Fondo blanco',
                text: 'Se ve el producto entero, sin recortar.',
              },
              {
                value: 'cover',
                title: 'Foto ambientada',
                text: 'Ocupa todo el recuadro (puede recortar bordes).',
              },
            ].map((option) => {
              const active = fit === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onFit(option.value)}
                  className={`relative cursor-pointer rounded-xl p-3.5 text-left transition-all duration-200 ${
                    active ? 'bg-[#fbf7ec] ring-2 ring-gold' : 'bg-[#f5f6f8] ring-1 ring-black/[0.06] hover:ring-black/20'
                  }`}
                >
                  <span className="block text-[14px] font-semibold">{option.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted">{option.text}</span>
                  {active && (
                    <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-gold text-on-gold">
                      <Check size={12} weight="bold" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {image && <p className="mt-2 text-[13px] text-muted">Lo elegimos solos según la foto; cambialo si se ve mal en la vista previa.</p>}
        </div>
      </div>
    </div>
  )
}

/* ---------- 2. Rubro ---------- */

function CategoryPicker({ value, onChange, error }) {
  return (
    <div role="radiogroup" aria-label="Rubro" aria-invalid={Boolean(error)} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((c) => {
        const active = value === c.id
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.id)}
            className={`flex min-w-0 cursor-pointer items-center gap-2.5 rounded-xl p-1.5 pr-3 text-left transition-all duration-200 ${
              active ? 'bg-panel text-on-panel ring-2 ring-gold' : `bg-[#f5f6f8] ring-1 hover:ring-black/25 ${error ? 'ring-[#e3a39b]' : 'ring-black/[0.06]'}`
            }`}
          >
            <img src={`/img/galeria/${c.image}.webp`} alt="" loading="lazy" className="size-10 shrink-0 rounded-lg bg-white object-cover" />
            <span className="truncate text-[14px] font-semibold">{c.short ?? c.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- 3. Tamaños y precio ---------- */

function PriceInput({ id, value, onChange, placeholder = 'A consultar', label }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">$</span>
      <input
        id={id}
        inputMode="numeric"
        aria-label={label}
        value={value ? Number(value).toLocaleString('es-AR') : ''}
        onChange={(e) => onChange(onlyDigits(e.target.value))}
        placeholder={placeholder}
        className="field-input pl-8"
      />
    </div>
  )
}

function SizesEditor({ draft, update, error }) {
  const setVariant = (key, patch) =>
    update({
      variants: draft.variants.map((v) => (v.key === key ? { ...v, ...patch } : v)),
    })

  return (
    <div className="space-y-5">
      <Segmented
        label="Tamaños"
        stretch
        value={draft.multiSize ? 'multi' : 'single'}
        onChange={(v) => update({ multiSize: v === 'multi' })}
        options={[
          { value: 'single', label: 'Un solo tamaño' },
          { value: 'multi', label: 'Varios tamaños' },
        ]}
      />

      {draft.multiSize ? (
        <div>
          <div className="hidden grid-cols-[1fr_1fr_2.75rem] gap-2 px-1 pb-2 text-[13px] font-semibold text-muted sm:grid">
            <span>Tamaño</span>
            <span>Precio (opcional)</span>
          </div>
          <ul className="space-y-2">
            {draft.variants.map((v, i) => (
              <li
                key={v.key}
                className="grid grid-cols-[1fr_2.75rem] gap-2 rounded-xl bg-[#f5f6f8] p-2 sm:grid-cols-[1fr_1fr_2.75rem] sm:bg-transparent sm:p-0"
              >
                <input
                  value={v.label}
                  onChange={(e) => setVariant(v.key, { label: e.target.value })}
                  placeholder={i === 0 ? 'Ej: 250 cc' : 'Ej: 500 cc'}
                  aria-label={`Tamaño ${i + 1}`}
                  className="field-input"
                />
                <div className="col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto">
                  <PriceInput value={v.price} onChange={(price) => setVariant(v.key, { price })} label={`Precio del tamaño ${i + 1}`} />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update({
                      variants: draft.variants.filter((x) => x.key !== v.key),
                    })
                  }
                  disabled={draft.variants.length === 1}
                  aria-label={`Quitar tamaño ${i + 1}`}
                  className="grid size-11 cursor-pointer place-items-center self-center rounded-xl text-muted hover:bg-[#fdecec] hover:text-[#c0392b] disabled:invisible"
                >
                  <X size={18} weight="bold" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() =>
              update({
                variants: [...draft.variants, { key: rowKey(), label: '', price: '' }],
              })
            }
            className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-[14px] font-semibold ring-1 ring-black/10 hover:bg-[#f5f6f8]"
          >
            <Plus size={16} weight="bold" />
            Agregar tamaño
          </button>
          {error ? (
            <p className="mt-2 text-[14px] font-medium text-[#c0392b]">{error}</p>
          ) : (
            <p className="mt-3 text-[13px] text-muted">El cliente elige el tamaño en la web. Si dejás el precio vacío dice “Precio a consultar”.</p>
          )}
        </div>
      ) : (
        <Field label="Precio" htmlFor="precio" hint="Si lo dejás vacío, en la web dice “Precio a consultar”.">
          <div className="max-w-xs">
            <PriceInput id="precio" value={draft.price} onChange={(price) => update({ price })} />
          </div>
        </Field>
      )}
    </div>
  )
}

/* ---------- 4. Características ---------- */

function SpecsEditor({ specs, onChange }) {
  const used = new Set(specs.map((s) => s.label.trim().toLowerCase()))
  const suggestions = SPEC_SUGGESTIONS.filter((s) => !used.has(s.toLowerCase()))
  const setSpec = (key, patch) => onChange(specs.map((s) => (s.key === key ? { ...s, ...patch } : s)))
  const addSpec = (label = '') => onChange([...specs, { key: rowKey(), label, value: '' }])

  return (
    <div>
      {specs.length > 0 && (
        <ul className="space-y-2">
          {specs.map((s, i) => (
            <li
              key={s.key}
              className="grid grid-cols-[1fr_2.75rem] gap-2 rounded-xl bg-[#f5f6f8] p-2 sm:grid-cols-[minmax(0,12rem)_1fr_2.75rem] sm:bg-transparent sm:p-0"
            >
              <input
                value={s.label}
                onChange={(e) => setSpec(s.key, { label: e.target.value })}
                placeholder="Ej: Material"
                aria-label={`Nombre de la característica ${i + 1}`}
                className="field-input font-semibold"
              />
              <input
                value={s.value}
                onChange={(e) => setSpec(s.key, { value: e.target.value })}
                placeholder={`Ej: ${SPEC_EXAMPLES[s.label.trim()] ?? 'Vidrio'}`}
                aria-label={`Valor de la característica ${i + 1}`}
                className="field-input col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto"
              />
              <button
                type="button"
                onClick={() => onChange(specs.filter((x) => x.key !== s.key))}
                aria-label={`Quitar característica ${i + 1}`}
                className="grid size-11 cursor-pointer place-items-center self-center rounded-xl text-muted hover:bg-[#fdecec] hover:text-[#c0392b]"
              >
                <X size={18} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={`flex flex-wrap items-center gap-2 ${specs.length ? 'mt-4' : ''}`}>
        <button
          type="button"
          onClick={() => addSpec()}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-ink px-4 text-[14px] font-semibold text-white hover:bg-black"
        >
          <Plus size={16} weight="bold" />
          Agregar característica
        </button>
        {suggestions.length > 0 && <span className="ml-1 text-[13px] text-muted">o tocá una:</span>}
        {suggestions.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => addSpec(label)}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full bg-[#f5f6f8] px-3.5 text-[13px] font-semibold ring-1 ring-black/[0.08] hover:ring-black/30"
          >
            <Plus size={12} weight="bold" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Vista previa ---------- */

function Preview({ product }) {
  const sample = {
    ...product,
    id: product.id ?? 'vista-previa',
    name: product.name || 'Nombre del producto',
    category: product.category || categories[0].id,
  }
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-[13px] font-bold tracking-[0.16em] text-muted uppercase">
        <span className="size-2 rounded-full bg-[#1f9d55]" />
        Así se ve en la web
      </p>
      {/* inert: es solo una muestra, no se puede tocar */}
      <div inert className="mx-auto max-w-[17rem]">
        <ProductCard key={product.variants.map((v) => v.id).join()} product={sample} />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.06]">
        <p className="text-[12px] font-bold tracking-[0.16em] text-muted uppercase">En la página del producto</p>
        <p className={`mt-2 line-clamp-4 text-[14px] leading-relaxed ${product.description ? 'text-ink' : 'text-muted italic'}`}>
          {product.description || 'Acá va la descripción.'}
        </p>
        {product.variants.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variants.map((v) => (
              <span key={v.id} className="rounded-lg bg-[#f5f6f8] px-2.5 py-1 text-[13px] font-semibold ring-1 ring-black/[0.06]">
                {v.label}
                <span className="ml-1.5 font-normal text-muted">{v.price == null ? 'a consultar' : formatPrice(v.price)}</span>
              </span>
            ))}
          </div>
        )}
        {product.specs.length > 0 && (
          <dl className="mt-3 divide-y divide-black/[0.07] border-t border-black/[0.07] text-[13px]">
            {product.specs.map((s, i) => (
              <div key={i} className="flex justify-between gap-4 py-2">
                <dt className="text-muted">{s.label}</dt>
                <dd className="text-right font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}

/* ---------- Pantalla ---------- */

export default function ProductEditor({ productId }) {
  const toast = useToast()
  const run = useAction()
  const original = productId ? getProduct(productId) : null
  const isNew = !productId
  const initial = useMemo(() => toDraft(original), [original])
  const [draft, setDraft] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [leaveTo, setLeaveTo] = useState(null) // a dónde ir si confirma salir sin guardar
  const [confirmDelete, setConfirmDelete] = useState(false)
  const savedRef = useRef(false)

  const product = useMemo(() => toProduct(draft), [draft])
  const dirty = useMemo(() => JSON.stringify(toProduct(initial)) !== JSON.stringify(product), [initial, product])

  const update = (patch) => {
    setDraft((d) => ({ ...d, ...patch }))
    const keys = Object.keys(patch)
    if (keys.some((k) => errors[k])) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !keys.includes(k))))
  }

  // Si hay cambios sin guardar, avisar antes de salir (links del panel o cerrar la pestaña).
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event) => event.preventDefault()
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]')
      if (!link || link.target === '_blank' || savedRef.current) return
      event.preventDefault()
      event.stopPropagation()
      setLeaveTo(link.getAttribute('href'))
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
    }
  }, [dirty])

  if (productId && !original) {
    return (
      <div className="page-in rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-black/[0.06]">
        <p className="text-lg font-semibold">No encontramos ese producto</p>
        <p className="mt-2 text-muted">Puede que lo hayan eliminado.</p>
        <a href={adminHref.list} className="btn btn-primary mt-6">
          Volver a productos
        </a>
      </div>
    )
  }

  const save = async () => {
    const found = validate(draft)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      const el = document.getElementById(`campo-${first}`)
      if (el) jumpTo(el)
      el?.querySelector('input,button')?.focus({ preventScroll: true })
      toast('Revisá los campos marcados en rojo', { tone: 'error' })
      return
    }
    setSaving(true)
    try {
      const saved = await saveProduct(product)
      savedRef.current = true
      toast(isNew ? `“${saved.name}” se agregó al catálogo` : 'Cambios guardados', {
        action: saved.published
          ? {
              label: 'Ver en la web',
              href: productHref(saved.id),
              external: true,
            }
          : undefined,
      })
      window.location.hash = adminHref.list
    } catch (err) {
      setSaving(false)
      toast(err instanceof CatalogError ? err.message : 'No se pudo guardar. Probá de nuevo.', { tone: 'error' })
    }
  }

  const remove = () => {
    setConfirmDelete(false)
    run(async () => {
      await deleteProduct(original.id)
      savedRef.current = true
      toast(`“${original.name}” eliminado`)
      window.location.hash = adminHref.list
    })
  }

  const otherCategories = categories.filter((c) => c.id !== draft.category)

  return (
    <div className="page-in pb-28">
      <a href={adminHref.list} className="group inline-flex min-h-10 items-center gap-2 text-[15px] font-semibold text-muted hover:text-ink">
        <span className="grid size-8 place-items-center rounded-full bg-white ring-1 ring-black/10 transition-transform group-hover:-translate-x-0.5">
          <ArrowLeft size={15} weight="bold" />
        </span>
        Productos
      </a>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="font-display text-[2.1rem] leading-tight font-medium tracking-tight sm:text-[2.8rem]">{isNew ? 'Nuevo producto' : original.name}</h1>
        {!isNew && (
          <span
            className={`rounded-full px-3 py-1 text-[13px] font-semibold ${original.published ? 'bg-[#e3f4ea] text-[#1f7a45]' : 'bg-[#eceef1] text-muted'}`}
          >
            {original.published ? 'En la web' : 'Oculto'}
          </span>
        )}
      </div>
      <p className="mt-2 text-[15px] text-muted">
        {isNew ? 'Completá los pasos. A la derecha vas viendo cómo queda.' : `Rubro: ${getCategoryLabel(original.category)}`}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <FormSection step={1} title="Foto" hint="La foto principal que se ve en la tarjeta y en la página del producto.">
            <PhotoPicker
              image={draft.image}
              fit={draft.imageFit}
              onImage={(image, imageFit) => update({ image, imageFit })}
              onFit={(imageFit) => update({ imageFit })}
            />
          </FormSection>

          <FormSection step={2} title="Datos del producto">
            <div className="space-y-6">
              <div id="campo-name">
                <Field label="Nombre" htmlFor="nombre" required error={errors.name} hint="Como lo buscaría un cliente. Ej: Frasco hexagonal 250 cc">
                  <input
                    id="nombre"
                    value={draft.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="Ej: Frasco hexagonal con tapa"
                    aria-invalid={Boolean(errors.name)}
                    className={`field-input text-[17px] font-semibold ${errors.name ? 'ring-2 ring-[#e3a39b]' : ''}`}
                  />
                </Field>
              </div>

              <div id="campo-category">
                <Field label="Rubro" required error={errors.category} hint="La sección de la web donde aparece.">
                  <CategoryPicker
                    value={draft.category}
                    error={errors.category}
                    onChange={(category) =>
                      update({
                        category,
                        alsoIn: draft.alsoIn.filter((c) => c !== category),
                      })
                    }
                  />
                </Field>
              </div>

              {draft.category && (
                <Field label="¿Aparece también en otros rubros?" hint="Opcional. Por ejemplo, un frasco que sirve para Alimenticio y para Deco Hogar.">
                  <div className="flex flex-wrap gap-2">
                    {otherCategories.map((c) => {
                      const on = draft.alsoIn.includes(c.id)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            update({
                              alsoIn: on ? draft.alsoIn.filter((x) => x !== c.id) : [...draft.alsoIn, c.id],
                            })
                          }
                          className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-all ${
                            on ? 'bg-ink text-white' : 'bg-[#f5f6f8] text-ink ring-1 ring-black/[0.08] hover:ring-black/30'
                          }`}
                        >
                          {on ? <Check size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
                          {c.short ?? c.label}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              )}

              <Field
                label="Descripción"
                htmlFor="descripcion"
                hint="Contá para qué sirve y qué lo hace bueno. Dos o tres oraciones alcanzan."
                aside={
                  <span className={`text-[13px] tabular-nums ${draft.description.length > DESCRIPTION_HINT ? 'text-[#b9770e]' : 'text-muted'}`}>
                    {draft.description.length}/{DESCRIPTION_HINT}
                  </span>
                }
              >
                <textarea
                  id="descripcion"
                  rows={4}
                  value={draft.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Ej: Frasco de vidrio ideal para conservas, mermeladas y especias. Cierre hermético."
                  className="field-input resize-y py-3 leading-relaxed"
                />
              </Field>
            </div>
          </FormSection>

          <div id="campo-variants">
            <FormSection step={3} title="Tamaños y precio" hint="¿Viene en un solo tamaño o en varios (por ejemplo 250 cc y 500 cc)?">
              <SizesEditor draft={draft} update={update} error={errors.variants} />
            </FormSection>
          </div>

          <FormSection step={4} title="Características" hint="Se muestran en una tabla en la página del producto. Las que dejes vacías no aparecen.">
            <SpecsEditor specs={draft.specs} onChange={(specs) => update({ specs })} />
          </FormSection>

          <FormSection step={5} title="Publicación">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f5f6f8] p-4">
              <div>
                <p className="text-[16px] font-semibold">{draft.published ? 'Visible en la web' : 'Oculto'}</p>
                <p className="mt-0.5 text-[14px] text-muted">
                  {draft.published ? 'Los clientes lo ven y lo pueden pedir.' : 'Queda guardado en el panel pero no aparece en la web.'}
                </p>
              </div>
              <Switch size="lg" checked={draft.published} onChange={(published) => update({ published })} label="Mostrar en la web" />
            </div>
          </FormSection>

          {!isNew && (
            <section className="flex flex-col gap-3 rounded-3xl p-5 ring-1 ring-[#f0c9c4] sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="font-semibold">Eliminar producto</p>
                <p className="mt-0.5 text-[14px] text-muted">Se borra de la web y del panel. No se puede deshacer.</p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-[#c0392b] ring-1 ring-[#e3a39b] hover:bg-[#fdecec]"
              >
                <Trash size={17} />
                Eliminar
              </button>
            </section>
          )}
        </div>

        <aside data-lenis-prevent className="no-scrollbar lg:sticky lg:top-24 lg:max-h-[calc(100dvh-13rem)] lg:overflow-y-auto">
          <Preview product={product} />
        </aside>
      </div>

      {/* Barra para guardar, siempre a mano (fuera de la animación de entrada, que la correría) */}
      {createPortal(
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5">
          <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl bg-white/90 p-2.5 shadow-[0_-8px_40px_-12px_rgb(0_0_0/0.25)] ring-1 ring-black/[0.06] backdrop-blur-md sm:p-3">
            <p className="hidden min-w-0 items-center gap-2 pl-2 text-[14px] font-medium sm:flex">
              {dirty ? (
                <>
                  <span className="size-2 shrink-0 rounded-full bg-[#e2a03f]" />
                  Hay cambios sin guardar
                </>
              ) : (
                <>
                  <span className="size-2 shrink-0 rounded-full bg-[#1f9d55]" />
                  <span className="text-muted">{isNew ? 'Completá los datos y guardá' : 'Todo guardado'}</span>
                </>
              )}
            </p>
            {!isNew && original.published && (
              <a
                href={productHref(original.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden min-h-12 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-muted hover:bg-[#eceef1] hover:text-ink md:inline-flex sm:ml-auto"
              >
                <ArrowSquareOut size={17} />
                Ver en la web
              </a>
            )}
            <a
              href={adminHref.list}
              className={`btn btn-outline min-h-12 px-5 text-[14px] tracking-normal normal-case ${!isNew && original.published ? 'md:ml-0' : 'sm:ml-auto'}`}
            >
              Cancelar
            </a>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="btn btn-primary min-h-12 flex-1 px-6 text-[14px] tracking-normal normal-case disabled:opacity-60 sm:flex-none"
            >
              <Check size={18} weight="bold" />
              {saving ? 'Guardando…' : isNew ? 'Guardar producto' : 'Guardar cambios'}
            </button>
          </div>
        </div>,
        document.body,
      )}

      <ConfirmDialog
        open={leaveTo != null}
        title="¿Salir sin guardar?"
        confirmLabel="Salir sin guardar"
        cancelLabel="Seguir editando"
        danger
        onCancel={() => setLeaveTo(null)}
        onConfirm={() => {
          savedRef.current = true
          const target = leaveTo
          setLeaveTo(null)
          window.location.hash = target
        }}
      >
        Los cambios que hiciste en este producto se van a perder.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar este producto?"
        confirmLabel="Sí, eliminar"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={remove}
      >
        <strong className="font-semibold text-ink">{original?.name}</strong> se borra de la web y del panel. Si solo querés sacarlo por un tiempo, ocultalo en
        el paso 5.
      </ConfirmDialog>
    </div>
  )
}
