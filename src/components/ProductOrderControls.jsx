import { CaretDown, Check, ShoppingCartSimple } from './icons.jsx'
import { formatPrice } from '../lib/format.js'
import { chosenValue, valuePrice } from '../lib/pricing.js'
import QuantityStepper from './QuantityStepper.jsx'

const optionText = (group, value, choices) => {
  const price = valuePrice(group, value, choices)
  return price ? `${value.label} (+ ${formatPrice(price)})` : value.label
}

// Cómo se llega al precio: base + cada opción elegida que suma algo.
function PriceBreakdown({ product, choices }) {
  const parts = product.options.flatMap((group) => {
    const value = chosenValue(group, choices)
    const price = value && valuePrice(group, value, choices)
    return price ? [{ label: `${group.name}: ${value.label}`, price }] : []
  })
  if (!parts.length) return null
  return (
    <dl className="mt-2 space-y-1 text-[14px] text-muted">
      {product.price > 0 && (
        <div className="flex justify-between gap-4">
          <dt>Precio base</dt>
          <dd className="tabular-nums">{formatPrice(product.price)}</dd>
        </div>
      )}
      {parts.map((part) => (
        <div key={part.label} className="flex justify-between gap-4">
          <dt className="min-w-0">{part.label}</dt>
          <dd className="shrink-0 tabular-nums">+ {formatPrice(part.price)}</dd>
        </div>
      ))}
    </dl>
  )
}

// Página de producto: opciones, precio, cantidad y botón de agregar.
// `order` es lo que devuelve useProductOrder(product).
export default function ProductOrderControls({ product, order }) {
  const { qty, setQty, choices, choose, missing, showMissing, priceText, added, add } = order
  const onRequest = priceText === formatPrice(null)

  return (
    <div>
      {product.options.length > 0 && (
        <div className="mb-6 space-y-4">
          {product.options.map((group) => {
            const id = `opcion-${product.id}-${group.id}`
            const invalid = showMissing && !choices[group.id]
            return (
              <div key={group.id}>
                <label htmlFor={id} className="text-sm font-semibold">
                  {group.name}
                </label>
                <div className="relative mt-2">
                  <select
                    id={id}
                    value={choices[group.id] ?? ''}
                    onChange={(e) => choose(group, e.target.value)}
                    aria-invalid={invalid}
                    className={`field-input cursor-pointer appearance-none pr-11 ${invalid ? 'ring-2 ring-red-600' : ''}`}
                  >
                    <option value="">Elegí una opción</option>
                    {group.values.map((value) => (
                      <option key={value.id} value={value.id}>
                        {optionText(group, value, choices)}
                      </option>
                    ))}
                  </select>
                  <CaretDown size={16} weight="bold" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p aria-live="polite" className={onRequest ? 'text-[15px] text-muted' : 'text-2xl font-semibold tabular-nums'}>
        {priceText}
      </p>
      {!onRequest && <PriceBreakdown product={product} choices={choices} />}

      <div className="mt-3 flex items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} label={`Cantidad de ${product.name}`} />
        <button type="button" onClick={add} className="btn btn-primary min-w-0 flex-1">
          {added ? <Check size={18} weight="bold" /> : <ShoppingCartSimple size={18} weight="bold" />}
          <span aria-live="polite">{added ? 'Agregado' : 'Agregar al carrito'}</span>
        </button>
      </div>
      {showMissing && missing.length > 0 && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          Falta elegir: {missing.map((g) => g.name).join(', ')}.
        </p>
      )}
    </div>
  )
}
