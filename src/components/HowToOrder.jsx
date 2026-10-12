import Reveal from './Reveal.jsx'

const steps = [
  {
    title: 'Elegí tus envases',
    text: 'Recorré el catálogo y sumá al carrito cada producto con la cantidad que necesitás.',
  },
  {
    title: 'Dejá tus datos',
    text: 'Abrí el carrito, revisá el pedido y completá tu nombre y un teléfono de contacto.',
  },
  {
    title: 'Enviá el pedido',
    text: 'Se abre WhatsApp con el detalle armado. Te respondemos con el precio y coordinamos el pedido.',
  },
]

export default function HowToOrder() {
  return (
    <section className="section container-page">
      <Reveal>
        <h2 className="section-title">Cómo hacer tu pedido</h2>
      </Reveal>
      <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
        {steps.map((step, i) => (
          <Reveal as="li" key={step.title} delay={i * 100} className="md:px-8 md:first:pl-0 md:last:pr-0">
            <span className="font-display text-6xl leading-none font-medium text-gold italic" aria-hidden="true">
              {i + 1}
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2 max-w-[38ch] leading-relaxed text-muted">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
