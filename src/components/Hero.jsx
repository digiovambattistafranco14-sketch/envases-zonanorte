import { ArrowRight, WhatsappLogo } from './icons.jsx'
import { contactUrl } from '../lib/whatsapp.js'
import { productImageUrl } from './ProductImage.jsx'

export default function Hero() {
  return (
    <section id="inicio" className="container-page">
      <div className="grid items-center gap-10 pt-10 pb-14 md:grid-cols-2 md:gap-10 md:pt-14 lg:min-h-[calc(100dvh-var(--header-h))] lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:py-12">
        <div className="hero-in">
          <p className="inline-flex rounded-full bg-surface px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-gold-ink uppercase ring-1 ring-black/5">
            Venta mayorista y minorista
          </p>
          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.06] font-medium tracking-tight text-balance sm:text-6xl md:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem] 2xl:text-[4.25rem]">
            Envases y frascos listos para <em className="pr-1 font-medium">tu marca</em>
          </h1>
          <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-muted sm:text-lg md:mt-6">
            Potes, botellas y difusores por unidad o por cantidad. Armá tu pedido online y cerralo
            por WhatsApp.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <a href="#catalogo" className="btn btn-primary group justify-between">
              Ver catálogo
              <span className="btn-chip">
                <ArrowRight size={15} weight="bold" />
              </span>
            </a>
            <a href={contactUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <WhatsappLogo size={20} />
              Hablar por WhatsApp
            </a>
          </div>
        </div>

        <div className="hero-in relative [animation-delay:120ms] lg:pl-6">
          <div className="card-shell">
            <img
              src="/img/productos/hero-envases-700.webp"
              srcSet="/img/productos/hero-envases-700.webp 700w, /img/productos/hero-envases-1400.webp 1400w"
              sizes="(min-width: 1024px) 600px, (min-width: 768px) 46vw, 92vw"
              width={1400}
              height={961}
              alt="Dispenser de vidrio con bomba y difusor cubo con varillas sobre una mesada de mármol"
              fetchPriority="high"
              className="card-core aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
            />
          </div>
          {/* Segunda pieza superpuesta: da profundidad en pantallas grandes. */}
          <div className="card-shell absolute -bottom-10 -left-4 hidden w-40 -rotate-3 lg:block xl:w-44">
            <div className="card-core aspect-[4/5] bg-stage">
              <img
                src={productImageUrl('botella-venecia-250-gatillo')}
                alt=""
                loading="lazy"
                className="img-studio size-full p-2"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
