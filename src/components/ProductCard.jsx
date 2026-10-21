import { ArrowRight, Check, Plus } from './icons.jsx'
import { getCategoryLabel } from '../data/products.js'
import { useProductOrder } from '../hooks/useProductOrder.js'
import { formatPrice } from '../lib/format.js'
import { productHref } from '../lib/router.js'
import ProductImage from './ProductImage.jsx'
import QuantityStepper from './QuantityStepper.jsx'

// Tarjeta de producto: foto, rubro, nombre, precio y botón. La descripción
// completa está en la página del producto. En celular los controles se apilan.
export default function ProductCard({ product }) {
  const { qty, setQty, price, added, add } = useProductOrder(product)
  const href = productHref(product.id)
  const hasVariants = Boolean(product.variants?.length)

  return (
    <article className="card-shell group flex h-full flex-col overflow-hidden transition-shadow duration-500 ease-out-soft hover:shadow-card-hover">
      <a
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="block aspect-[4/5] overflow-hidden border-b border-black/[0.06] bg-white"
      >
        <ProductImage
          product={product}
          sizes="(min-width: 1024px) 400px, 46vw"
          className="transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
        />
      </a>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-5">
        <p className="text-[11px] font-bold tracking-[0.16em] text-gold-ink uppercase sm:text-[13px]">{getCategoryLabel(product.category)}</p>
        <h3 className="mt-1.5 text-[16px] leading-snug font-semibold sm:mt-2 sm:text-[19px]">
          <a href={href} className="outline-offset-4">
            {product.name}
          </a>
        </h3>

        <div className="mt-auto pt-3 sm:pt-5">
          <p className="text-[14px] text-muted sm:text-[16px]">{formatPrice(price)}</p>
          {hasVariants ? (
            <a
              href={href}
              className="btn btn-primary group mt-2.5 w-full max-sm:min-h-11 max-sm:px-2 max-sm:text-[12px] max-sm:tracking-[0.05em] sm:mt-3 sm:justify-between sm:pl-6 sm:text-[14px]"
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
                className="btn btn-primary min-w-0 flex-1 px-4 max-sm:min-h-11 max-sm:px-2 max-sm:text-[12px] max-sm:tracking-[0.05em] sm:text-[14px]"
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
