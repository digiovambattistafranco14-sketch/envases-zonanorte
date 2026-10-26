import { ArrowRight, ChatsCircle } from './icons.jsx'
import { useMemo } from 'react'
import { useCarousel } from '../lib/carousel.js'
import { usePublishedProducts } from '../lib/catalog.js'
import PhotoMarquee from './PhotoMarquee.jsx'

// Fotos del carrusel con su texto alternativo. El clic lleva al producto solo
// si sigue publicado.
function useHeroPhotos() {
  const carousel = useCarousel()
  const products = usePublishedProducts()
  return useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    return carousel.map(({ src, product }) => {
      const linked = byId.get(product)
      return { src, product: linked ? linked.id : null, alt: linked ? linked.name : 'Frascos y envases de Envases & Frascos Zona Norte' }
    })
  }, [carousel, products])
}

// Portada: el carrusel de frascos bien grande, de borde a borde, sobre la
// franja negra con dorado a los costados. El logo ya está en la cabecera.
// Debajo, una frase corta y un botón.
export default function Hero() {
  const photos = useHeroPhotos()
  return (
    <section id="inicio" className="relative isolate mt-2 overflow-hidden bg-panel text-on-panel sm:mt-4">
      <span aria-hidden="true" className="gold-edge absolute inset-y-0 left-0 z-10 w-1.5 sm:w-2" />
      <span aria-hidden="true" className="gold-edge absolute inset-y-0 right-0 z-10 w-1.5 sm:w-2" />

      <h1 className="sr-only">Envases &amp; Frascos Zona Norte</h1>

      <div className="hero-in">
        <PhotoMarquee photos={photos} label="Fotos de nuestros frascos" size="hero" />
      </div>

      <div className="relative border-t border-gold/30">
        <div className="hero-in container-page flex flex-col items-center justify-between gap-5 py-7 text-center [animation-delay:120ms] sm:flex-row sm:text-left">
          <p className="font-display text-[22px] leading-snug text-balance sm:text-[26px]">
            Distribuimos todo tipo de Envases para diferentes rubros
            <em className="mt-1 block text-[18px] text-gold-light sm:text-[21px]">Ventas por Mayor y Menor</em>
          </p>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <a href="#rubros" className="btn btn-gold group">
              Ver rubros
              <span className="btn-chip">
                <ArrowRight size={16} weight="bold" />
              </span>
            </a>
            <a href="#consultas" className="btn btn-ghost-light">
              <ChatsCircle size={18} />
              Hacer una consulta
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
