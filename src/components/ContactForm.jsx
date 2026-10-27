import { useState } from 'react'
import { ArrowRight, Storefront, WhatsappLogo } from './icons.jsx'
import { site } from '../config/site.js'
import { whatsappUrl } from '../lib/whatsapp.js'
import Reveal from './Reveal.jsx'

const EMPTY = { name: '', contact: '', message: '' }

function validate({ name, message }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Ingresá tu nombre.'
  if (message.trim().length < 5) errors.message = 'Contanos qué necesitás.'
  return errors
}

const buildMessage = ({ name, contact, message }) =>
  [
    `Hola, soy ${name.trim()}. Les escribo desde la web de ${site.fullName}.`,
    '',
    message.trim(),
    ...(contact.trim() ? ['', `Mi contacto: ${contact.trim()}`] : []),
  ].join('\n')

function Field({ id, label, error, as: Tag = 'input', ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Tag
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`field-input ${Tag === 'textarea' ? 'min-h-32 resize-y py-3' : ''} ${error ? 'ring-2 ring-red-600' : ''}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

// Consultas: el mensaje se arma y se abre en WhatsApp (le llega directo al
// celular). Si hay mail configurado en site.js, también se puede mandar por mail.
export default function ContactForm() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const update = (field) => (e) => {
    const next = { ...form, [field]: e.target.value }
    setForm(next)
    if (errors[field]) setErrors(validate(next))
  }

  const check = () => {
    const found = validate(form)
    setErrors(found)
    return Object.keys(found).length === 0
  }

  const sendWhatsApp = (e) => {
    e.preventDefault()
    if (!check()) return
    window.open(whatsappUrl(buildMessage(form)), '_blank', 'noopener,noreferrer')
  }

  const sendEmail = () => {
    if (!check()) return
    const subject = encodeURIComponent(`Consulta desde la web - ${form.name.trim()}`)
    const body = encodeURIComponent(buildMessage(form))
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
  }

  return (
    <section id="consultas" className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="mx-auto max-w-[110rem]">
      <div className="grid overflow-hidden rounded-[1.5rem] bg-surface ring-1 ring-black/[0.05] sm:rounded-[2.25rem] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Columna de imagen con los datos de contacto encima */}
        <Reveal className="relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden bg-panel p-8 text-on-panel sm:p-10 lg:min-h-[32rem]">
          <img
            src="/img/galeria/consultas-piano.webp"
            alt=""
            loading="lazy"
            className="absolute inset-0 -z-10 size-full object-cover object-[68%_40%]"
          />
          <span aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/60 to-black/35" />
          <p className="flex items-center gap-3 eyebrow text-gold-light! [text-shadow:0_1px_8px_rgb(0_0_0/0.8)]">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            Consultas
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl">
            Nuestra experiencia en <em className="text-gold-light">décadas.</em>
          </h2>
          <p className="mt-4 max-w-[34ch] font-display text-[20px] leading-snug text-on-panel/85 sm:text-[22px]">
            Hoy nos brinda la posibilidad en asesorarlo con gran gusto.
          </p>
          <p className="mt-6 text-[15px] text-on-panel/75">
            WhatsApp <span className="font-semibold text-on-panel">{site.whatsapp.display}</span>
          </p>
          <a
            href={site.location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link group/local -mx-2 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 self-start rounded-xl px-2 py-1.5 text-[15px] text-on-panel/75"
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <Storefront size={17} className="text-gold-light" />
              Local <span className="font-semibold text-on-panel">{site.location.address}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold whitespace-nowrap text-gold-light">
              Cómo llegar
              <ArrowRight size={13} weight="bold" className="transition-transform duration-300 ease-out-soft group-hover/local:translate-x-1" />
            </span>
          </a>
        </Reveal>

        {/* Formulario */}
        <Reveal delay={100} className="flex items-center">
          <form onSubmit={sendWhatsApp} noValidate className="mx-auto w-full max-w-xl p-6 sm:p-10 lg:p-16">
            <div className="flex flex-col gap-5">
              <Field id="consulta-nombre" label="Nombre" autoComplete="name" value={form.name} onChange={update('name')} error={errors.name} />
              <Field
                id="consulta-contacto"
                label="Teléfono o mail (opcional)"
                autoComplete="email"
                value={form.contact}
                onChange={update('contact')}
              />
              <Field
                id="consulta-mensaje"
                label="Tu consulta"
                as="textarea"
                value={form.message}
                onChange={update('message')}
                error={errors.message}
              />
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="btn btn-primary flex-1">
                  <WhatsappLogo size={18} />
                  Enviar consulta
                </button>
                {site.email && (
                  <button type="button" onClick={sendEmail} className="btn btn-outline flex-1">
                    Enviar por mail
                  </button>
                )}
              </div>
            </div>
          </form>
        </Reveal>
      </div>
      </div>
    </section>
  )
}
