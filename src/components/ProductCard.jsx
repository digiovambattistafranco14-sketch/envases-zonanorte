import { ArrowRight, Check, Plus } from './icons.jsx'
import { getCategoryLabel } from '../data/products.js'
import { useProductOrder } from '../hooks/useProductOrder.js'
import { formatPrice } from '../lib/format.js'
import { productHref } from '../lib/router.js'
import ProductImage from './ProductImage.jsx'
import QuantityStepper from './QuantityStepper.jsx'

// En celular el catálogo va a dos columnas: la tarjeta se compacta (sin
// descripción, controles apilados). Desde 640px muestra todo.
export default function ProductCard({ product }) {
  const { qty, setQty, price, added, add } = useProductOrder(product)
  const href = productHref(product.id)
  const hasVariants = Boolean(product.variants?.length)

  return (
    <article className="card-shell group flex h-full flex-col p-1.5 transition-[transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-card-hover max-sm:rounded-3xl sm:p-2">
      <a
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="card-core block aspect-[4/5] bg-stage max-sm:rounded-[1.125rem]"
      >
        <ProductImage
          product={product}
          sizes="(min-width: 1024px) 400px, 46vw"
          className="transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
        />
      </a>

      <div className="flex flex-1 flex-col px-2 pt-3.5 pb-1.5 sm:px-4 sm:pt-5 sm:pb-3">
        <p className="text-xs font-medium text-gold-ink sm:text-[13px]">{getCategoryLabel(product.category)}</p>
        <h3 className="mt-1 text-[15px] leading-snug font-semibold tracking-tight sm:mt-1.5 sm:text-[17px]">
          <a href={href} className="outline-offset-4">
            {product.name}
          </a>
        </h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted max-sm:hidden">
          {product.description}
        </p>

        <div className="mt-auto pt-3 sm:pt-5">
          <p className="text-[13px] text-muted sm:text-sm">{formatPrice(price)}</p>
          {hasVariants ? (
            <a
              href={href}
              className="btn btn-primary group mt-2.5 w-full max-sm:min-h-11 max-sm:px-3 max-sm:text-sm sm:mt-3 sm:justify-between sm:pl-6"
            >
              Elegir tamaño
              <span className="btn-chip max-sm:hidden">
                <ArrowRight size={15} weight="bold" />
              </span>
            </a>
          ) : (
            <div className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:items-center">
              <QuantityStepper value={qty} onChange={setQty} label={`Cantidad de ${product.name}`} stretch />
              <button
                type="button"
                onClick={add}
                aria-label={`Agregar ${product.name} al carrito`}
                className="btn btn-primary min-w-0 flex-1 px-4 max-sm:min-h-11 max-sm:text-sm"
              >
                {added ? <Check size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
                <span aria-live="polite">{added ? 'Agregado' : 'Agregar'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
