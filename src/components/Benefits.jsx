import { ChatsCircle, Package, SealCheck } from './icons.jsx'
import { LogoMark } from './Logo.jsx'
import Reveal from './Reveal.jsx'

const benefits = [
  {
    icon: SealCheck,
    title: 'Calidad revisada',
    text: 'Vidrio, plástico y válvulas seleccionados para que tu producto llegue bien presentado.',
  },
  {
    icon: ChatsCircle,
    title: 'Atención personalizada',
    text: 'Te responde una persona por WhatsApp y te ayuda a elegir el envase para lo que necesitás.',
  },
  {
    icon: Package,
    title: 'Por unidad o por cantidad',
    text: 'Comprás lo justo para empezar o cotizás por volumen para tu marca o tu local.',
  },
]

export default function Benefits() {
  return (
    <section id="beneficios" className="section container-page">
      <div className="grid gap-5 lg:grid-cols-[5fr_7fr] lg:gap-6">
        <Reveal className="flex min-h-80 flex-col justify-between gap-12 rounded-[1.75rem] bg-panel p-8 shadow-card sm:p-10">
          <LogoMark size={96} />
          <div>
            <h2 className="font-display text-4xl leading-[1.08] font-medium tracking-tight text-balance text-on-panel sm:text-5xl">
              Por qué <em>elegirnos</em>
            </h2>
            <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-on-panel-muted sm:text-lg">
              Somos de Zona Norte y trabajamos con emprendedores, marcas y comercios de la zona.
            </p>
          </div>
        </Reveal>

        <ul className="card-shell flex flex-col justify-center divide-y divide-black/5 px-8 py-4 sm:px-10">
          {benefits.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 90} className="flex gap-5 py-7">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-gold">
                <Icon size={22} weight="light" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 max-w-[52ch] leading-relaxed text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
