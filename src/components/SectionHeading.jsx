import Reveal from './Reveal.jsx'

// Encabezado de sección: etiqueta chica, título grande (con una palabra en
// itálica dorada) y, si hace falta, un texto o una acción a la derecha.
export default function SectionHeading({ eyebrow, title, accent, lead, action, dark = false, className = '' }) {
  return (
    <Reveal className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={`flex items-center gap-3 eyebrow ${dark ? 'text-gold-light!' : ''}`}>
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {eyebrow}
          </p>
        )}
        <h2 className={`section-title mt-4 ${dark ? 'text-on-panel [&_em]:text-gold-light' : ''}`}>
          {title} {accent && <em className="pr-1">{accent}</em>}
        </h2>
        {lead && <p className={`section-lead ${dark ? 'text-on-panel/70' : ''}`}>{lead}</p>}
      </div>
      {action}
    </Reveal>
  )
}
