import { MapPin } from './icons.jsx'
import { site } from '../config/site.js'
import Reveal from './Reveal.jsx'

export default function Coverage() {
  return (
    <section id="cobertura" className="section bg-surface-2/55">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
        <Reveal>
          <h2 className="section-title">Zona de cobertura</h2>
          <p className="section-lead">
            Atendemos Zona Norte y el resto del GBA. Si tu localidad no figura, consultanos igual.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {site.coverage.map((place) => (
              <li
                key={place}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-[15px] font-medium ring-1 ring-black/5"
              >
                <MapPin size={15} className="text-gold-ink" />
                {place}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="card-shell">
            <iframe
              title="Mapa de cobertura en Zona Norte, Gran Buenos Aires"
              src={site.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="card-core block aspect-[4/3] w-full bg-stage"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
