import { ArrowRight } from './icons.jsx'
import { galleryBottom, galleryTop } from '../data/gallery.js'
import PhotoMarquee from './PhotoMarquee.jsx'

const photos = [...galleryTop, ...galleryBottom]

// Portada: el carrusel de frascos bien grande, de borde a borde, sobre la
// franja negra con dorado a los costados. El logo ya está en la cabecera.
// Debajo, una frase corta y un botón.
export default function Hero() {
  return (
    <section id="inicio" className="relative isolate mt-2 overflow-hidden bg-panel text-on-panel sm:mt-4">
      <span aria-hidden="true" className="gold-edge absolute inset-y-0 left-0 z-10 w-1.5 sm:w-2" />
      <span aria-hidden="true" className="gold-edge absolute inset-y-0 right-0 z-10 w-1.5 sm:w-2" />

      <h1 className="sr-only">Envases &amp; Frascos Zona Norte</h1>

      <div className="hero-in">
        <PhotoMarquee photos={photos} duration={140} label="Fotos de nuestros frascos" size="hero" />
      </div>

      <div className="relative border-t border-gold/30">
        <div className="hero-in container-page flex flex-col items-center justify-between gap-5 py-7 text-center [animation-delay:120ms] sm:flex-row sm:text-left">
          <p className="font-display text-[22px] leading-snug sm:text-[26px]">
            Envases para cada rubro, <em className="text-gold-light">por mayor y por menor</em>
          </p>
          <a href="#rubros" className="btn btn-gold group shrink-0">
            Ver rubros
            <span className="btn-chip">
              <ArrowRight size={16} weight="bold" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
