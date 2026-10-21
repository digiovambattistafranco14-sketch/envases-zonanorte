import { ArrowLeft, ArrowRight } from '../components/icons.jsx'
import ProductImage from '../components/ProductImage.jsx'
import ProductOrderControls from '../components/ProductOrderControls.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getCategoryLabel, isInCategory, products } from '../data/products.js'
import { useProductOrder } from '../hooks/useProductOrder.js'
import { ALL, setCatalogCategory, useCatalogCategory } from '../lib/catalogFilter.js'
import { productHref } from '../lib/router.js'

// Vuelve a "Elegí tu rubro". Si el rubro que estaba elegido incluye este
// producto se mantiene; si no, se elige el rubro del producto.
function BackLink({ product }) {
  const selected = useCatalogCategory()
  const keep = selected !== ALL && isInCategory(product, selected)
  const target = keep ? selected : product.category
  return (
    <a
      href="#rubros"
      onClick={() => setCatalogCategory(target)}
      className="group inline-flex min-h-11 items-center gap-2.5 text-[15px] font-semibold text-muted transition-colors duration-300 hover:text-ink"
    >
      <span className="grid size-8 place-items-center rounded-full bg-surface ring-1 ring-black/10 transition-transform duration-500 ease-out-soft group-hover:-translate-x-0.5">
        <ArrowLeft size={15} weight="bold" />
      </span>
      Volver a {getCategoryLabel(target)}
    </a>
  )
}

function OtherProducts({ current }) {
  // Primero los de la misma categoría, después el resto.
  const others = products
    .filter((p) => p.id !== current.id)
    .sort((a, b) => isInCategory(b, current.category) - isInCategory(a, current.category))
    .slice(0, 4)

  return (
    <section className="mt-16 md:mt-28">
      <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Otros productos</h2>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {others.map((p) => (
          <li key={p.id}>
            <a
              href={productHref(p.id)}
              className="card-shell group block h-full transition-[transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="card-core aspect-[4/5] bg-stage">
                <ProductImage
                  product={p}
                  sizes="(min-width: 1024px) 300px, 45vw"
                  className="transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                />
              </div>
              <div className="px-3 pt-4 pb-3">
                <p className="text-[13px] font-medium text-gold-ink">{getCategoryLabel(p.category)}</p>
                <p className="mt-1 leading-snug font-semibold tracking-tight">{p.name}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProductDetail({ product }) {
  const order = useProductOrder(product)
  const { count, openCart } = useCart()

  return (
    <div className="page-in container-page pt-6 pb-16 md:pt-12 md:pb-28">
      <BackLink product={product} />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-16">
        <div className="card-shell mx-auto w-full max-w-md lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:max-w-none">
          <div className="card-core aspect-[4/5] bg-stage">
            <ProductImage
              product={product}
              alt={product.name}
              sizes="(min-width: 1024px) 520px, 92vw"
              lazy={false}
            />
          </div>
        </div>

        <div className="min-w-0 lg:max-w-xl lg:py-6">
          <p className="inline-flex rounded-full bg-surface px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-gold-ink uppercase ring-1 ring-black/5">
            {getCategoryLabel(product.category)}
          </p>
          <h1 className="mt-5 font-display text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 max-w-[50ch] text-lg leading-relaxed text-muted">{product.description}</p>

          <div className="card-shell mt-8">
            <div className="p-4 sm:p-5">
              <ProductOrderControls product={product} order={order} />
              {count > 0 && (
                <button type="button" onClick={openCart} className="btn btn-outline group mt-3 w-full justify-between">
                  Ver mi pedido ({count})
                  <span className="btn-chip">
                    <ArrowRight size={15} weight="bold" />
                  </span>
                </button>
              )}
            </div>
          </div>

          {product.specs?.length > 0 && (
            <>
              <h2 className="mt-10 text-sm font-semibold">Características</h2>
              <dl className="mt-3 divide-y divide-black/10 border-y border-black/10">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 py-3.5">
                    <dt className="text-muted">{spec.label}</dt>
                    <dd className="text-right font-semibold">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>

      <OtherProducts current={product} />
    </div>
  )
}

export default function ProductPage({ product }) {
  if (!product) {
    return (
      <div className="page-in container-page py-28 text-center">
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">No encontramos ese producto</h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-lg text-muted">
          Puede que ya no esté en el catálogo. Mirá los productos disponibles.
        </p>
        <a href="#rubros" className="btn btn-primary mt-8">
          Ver rubros
        </a>
      </div>
    )
  }
  // key: reinicia cantidad y tamaño al pasar de un producto a otro.
  return <ProductDetail key={product.id} product={product} />
}
