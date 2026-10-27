import { ArrowSquareOut, MapPin } from './icons.jsx'
import { site } from '../config/site.js'
import LogoSeal from './LogoSeal.jsx'

// Mapita del local con el sello como marcador. Toda la tarjeta abre Google Maps.
// La imagen del mapa está dentro de la web (scripts/build-map.mjs), con el local
// justo en el centro.
export default function LocationMap({ className = '' }) {
  const { address, mapsUrl } = site.location
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver ${address} en Google Maps`}
      className={`group relative block overflow-hidden rounded-2xl ring-1 ring-gold/40 ${className}`}
    >
      <div className="relative aspect-[3/2] bg-[#e9e6df]">
        <img
          src="/img/mapa-local.webp"
          alt=""
          width={1200}
          height={800}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.06]"
        />

        {/* Marcador: el sello con una punta que señala el local (centro del mapa) */}
        <span className="map-pin pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <span className="grid size-16 place-items-center rounded-full bg-panel p-1 shadow-[0_10px_24px_-8px_rgb(0_0_0/0.6)] ring-2 ring-gold sm:size-[4.5rem]">
            <LogoSeal sizes="72px" className="h-full w-auto" alt="" />
          </span>
          <span className="-mt-1 h-3 w-3 rotate-45 bg-gold" />
        </span>
        <span className="map-pulse pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />

        <span className="absolute right-1.5 bottom-1 text-[9px] text-black/55">© OpenStreetMap</span>
      </div>

      <div className="flex items-center justify-between gap-3 bg-white/[0.04] px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 text-[15px] text-on-panel">
          <MapPin size={18} className="shrink-0 text-gold-light" />
          <span className="truncate">{address}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-gold-light transition-colors group-hover:text-white">
          Cómo llegar
          <ArrowSquareOut size={15} weight="bold" />
        </span>
      </div>
    </a>
  )
}
