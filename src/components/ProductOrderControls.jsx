import { Check, ShoppingCartSimple } from './icons.jsx'
import { formatPrice } from '../lib/format.js'
import { productImageUrl } from './ProductImage.jsx'
import QuantityStepper from './QuantityStepper.jsx'

// Página de producto: tamaños, versiones, precio, cantidad y botón de agregar.
// `order` es lo que devuelve useProductOrder(product).
export default function ProductOrderControls({ product, order }) {
  const { qty, setQty, variantId, setVariantId, versionId, setVersionId, price, added, add } = order

  return (
    <div>
      {product.variants?.length > 0 && (
        <fieldset className="mb-6">
          <legend className="text-sm font-semibold">Tamaño</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const active = v.id === variantId
              return (
                <label
                  key={v.id}
                  className={`inline-flex min-h-11 cursor-pointer items-center rounded-xl px-5 text-[15px] font-semibold transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-gold-ink ${
                    active ? 'bg-ink text-surface' : 'bg-surface text-ink ring-1 ring-black/10 hover:ring-black/40'
                  }`}
                >
                  <input
                    type="radio"
                    name={`tamano-${product.id}`}
                    value={v.id}
                    checked={active}
                    onChange={() => setVariantId(v.id)}
                    className="sr-only"
                  />
                  {v.label}
                </label>
              )
            })}
          </div>
        </fieldset>
      )}

      {product.versions?.length > 0 && (
        <fieldset className="mb-6">
          <legend className="text-sm font-semibold">Versión</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.versions.map((v) => {
              const active = v.id === versionId
              return (
                <label
                  key={v.id}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl text-[15px] font-semibold transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-gold-ink ${
                    v.image ? 'py-1 pr-5 pl-1' : 'px-5'
                  } ${active ? 'bg-ink text-surface' : 'bg-surface text-ink ring-1 ring-black/10 hover:ring-black/40'}`}
                >
                  <input
                    type="radio"
                    name={`version-${product.id}`}
                    value={v.id}
                    checked={active}
                    onChange={() => setVersionId(v.id)}
                    className="sr-only"
                  />
                  {v.image && <img src={productImageUrl(v.image, 480)} alt="" className="size-9 rounded-lg bg-white object-cover" />}
                  {v.label}
                </label>
              )
            })}
          </div>
        </fieldset>
      )}

      <p className={price == null ? 'text-[15px] text-muted' : 'text-2xl font-semibold'}>{formatPrice(price)}</p>

      <div className="mt-3 flex items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} label={`Cantidad de ${product.name}`} />
        <button type="button" onClick={add} className="btn btn-primary min-w-0 flex-1">
          {added ? <Check size={18} weight="bold" /> : <ShoppingCartSimple size={18} weight="bold" />}
          <span aria-live="polite">{added ? 'Agregado' : 'Agregar al carrito'}</span>
        </button>
      </div>
    </div>
  )
}
