// Bloque de sección: cada parte del inicio va en su propio panel redondeado,
// separado del resto por un margen, así la página se lee por secciones.
// tone: 'light' (blanco), 'soft' (gris claro) o 'dark' (negro con borde dorado).
const TONES = {
  light: 'bg-surface ring-1 ring-black/[0.05]',
  soft: 'bg-[#f3f4f6] ring-1 ring-black/[0.04]',
  dark: 'glow-dark text-on-panel ring-1 ring-gold/40',
}

export default function Panel({ id, tone = 'light', className = '', innerClassName = 'py-14 md:py-20', children }) {
  return (
    <section id={id} className={`px-2 pt-2 sm:px-4 sm:pt-4 ${className}`}>
      <div className={`relative isolate mx-auto max-w-[110rem] overflow-hidden rounded-[1.5rem] sm:rounded-[2.25rem] ${TONES[tone]} ${innerClassName}`}>
        {children}
      </div>
    </section>
  )
}
