import { ArrowRight, CaretRight, ChatsCircle, FacebookLogo, InstagramLogo, MapPin, Storefront, Truck, WhatsappLogo } from './icons.jsx'
import { site } from '../config/site.js'
import { categories } from '../data/products.js'
import { setCatalogCategory } from '../lib/catalogFilter.js'
import { contactUrl, whatsappUrl } from '../lib/whatsapp.js'
import LocationMap from './LocationMap.jsx'
import LogoSeal from './LogoSeal.jsx'
import Reveal from './Reveal.jsx'

const socials = [
  { key: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { key: 'facebook', label: 'Facebook', icon: FacebookLogo },
].filter((s) => site.social[s.key])

const external = { target: '_blank', rel: 'noopener noreferrer' }

// Dato de contacto que se puede tocar: el ícono va en un círculo que se
// enciende en dorado, el texto se corre un poco y aparece una flecha. En
// celular (sin mouse) la flecha se ve siempre y el toque achica la fila.
function ContactLink({ href, icon: Icon, children, ...rest }) {
  return (
    <a href={href} {...rest} className="footer-link group/link -mx-1.5 flex min-h-10 items-center gap-2.5 rounded-xl px-1.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-gold-light ring-1 ring-gold/30 transition-colors duration-300 group-hover/link:bg-gold group-hover/link:text-on-gold">
        <Icon size={16} />
      </span>
      <span className="min-w-0 truncate transition-[color,translate] duration-300 ease-out-soft group-hover/link:translate-x-0.5 group-hover/link:text-gold-light">
        {children}
      </span>
      <ArrowRight
        size={14}
        weight="bold"
        className="nudge shrink-0 text-gold-light/70 transition-[opacity,translate] duration-300 ease-out-soft can-hover:-translate-x-1 can-hover:opacity-0 can-hover:group-hover/link:translate-x-0 can-hover:group-hover/link:opacity-100"
      />
    </a>
  )
}

function MapBlock({ className = '' }) {
  return (
    <div className={className}>
      <h3 className="text-[11px] font-bold tracking-[0.22em] text-gold-light uppercase">Nuestro local</h3>
      <LocationMap className="mt-4" />
    </div>
  )
}

// Pie negro (en su propio panel): logo, contacto y envíos a la izquierda;
// rubros y mapa del local a la derecha (en celular el mapa va después de envíos).
export default function Footer() {
  return (
    <footer id="contacto" className="px-2 py-2 sm:px-4 sm:py-4">
      <div className="relative mx-auto max-w-[110rem] overflow-hidden rounded-[1.5rem] bg-panel text-on-panel ring-1 ring-gold/40 sm:rounded-[2.25rem]">
        <div className="container-page grid gap-12 py-16 md:grid-cols-[1fr_auto] md:items-start md:py-20">
          <Reveal className="max-w-xl">
            {/* Logo con los datos de contacto al lado (también en celular) */}
            <div className="flex items-center gap-4 sm:gap-8">
              <LogoSeal className="h-24 w-auto shrink-0 sm:h-36" sizes="(min-width: 640px) 136px, 92px" />
              <ul className="min-w-0 flex-1 space-y-0.5 text-[15px] text-on-panel/80 sm:max-w-[19rem]">
                <li>
                  <ContactLink href={contactUrl()} icon={WhatsappLogo} {...external}>
                    {site.whatsapp.display}
                  </ContactLink>
                </li>
                {site.email && (
                  <li>
                    <ContactLink href={`mailto:${site.email}`} icon={ChatsCircle}>
                      {site.email}
                    </ContactLink>
                  </li>
                )}
                {socials.map(({ key, label, icon }) => (
                  <li key={key}>
                    <ContactLink href={site.social[key]} icon={icon} {...external}>
                      {label}
                    </ContactLink>
                  </li>
                ))}
                <li>
                  <ContactLink href="#consultas" icon={ChatsCircle}>
                    Consultas
                  </ContactLink>
                </li>
                <li>
                  <ContactLink href={site.location.mapsUrl} icon={Storefront} {...external}>
                    {site.location.address}
                  </ContactLink>
                </li>
                {/* No es un enlace: sin círculo ni flecha, para que no parezca tocable */}
                <li className="flex min-h-10 items-center gap-2.5 text-on-panel/55">
                  <span className="grid size-8 shrink-0 place-items-center">
                    <MapPin size={17} />
                  </span>
                  Zona Norte y GBA
                </li>
              </ul>
            </div>

            {/* Envíos: toda la tarjeta abre WhatsApp para consultar */}
            <a
              href={whatsappUrl('Hola, quería consultar por un envío.')}
              {...external}
              className="footer-card group/ship mt-8 flex items-start gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-gold/30 transition-[background-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:bg-white/[0.07] hover:shadow-[0_18px_40px_-20px_rgb(200_160_74/0.45)] hover:ring-gold/60 sm:p-5"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-light ring-1 ring-gold/40 transition-colors duration-300 group-hover/ship:bg-gold group-hover/ship:text-on-gold">
                <Truck size={26} />
              </span>
              <span className="min-w-0 text-[15px] leading-relaxed text-on-panel/75">
                <strong className="block text-[16px] font-semibold text-on-panel">Realizamos envíos</strong>
                {site.shipping}
                <span className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-gold-light">
                  Consultar envío por WhatsApp
                  <ArrowRight size={14} weight="bold" className="nudge transition-transform duration-300 ease-out-soft group-hover/ship:translate-x-1" />
                </span>
              </span>
            </a>

            <MapBlock className="mt-10 md:hidden" />
          </Reveal>

          <Reveal delay={120} className="md:w-[30rem] lg:w-[34rem]">
            <nav aria-label="Rubros">
              <h3 className="text-[11px] font-bold tracking-[0.22em] text-gold-light uppercase">Rubros</h3>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-0.5 text-[15px] text-on-panel/80 sm:gap-x-12">
                {categories.map((category) => (
                  <li key={category.id}>
                    <a
                      href="#rubros"
                      onClick={() => setCatalogCategory(category.id)}
                      className="footer-link group/cat -mx-1.5 flex min-h-10 items-center gap-1.5 rounded-lg px-1.5"
                    >
                      <span className="relative transition-colors duration-300 group-hover/cat:text-gold-light">
                        {category.label}
                        {/* Subrayado dorado que crece al pasar el mouse */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out-soft group-hover/cat:scale-x-100"
                        />
                      </span>
                      <CaretRight
                        size={13}
                        weight="bold"
                        className="nudge shrink-0 text-gold-light/60 transition-[opacity,translate] duration-300 ease-out-soft group-hover/cat:translate-x-0.5 group-hover/cat:text-gold-light can-hover:opacity-0 can-hover:group-hover/cat:opacity-100"
                      />
                    </a>
                    {category.detail && <p className="-mt-1.5 mb-1 max-w-[16rem] text-[12px] leading-snug text-on-panel/45">{category.detail}</p>}
                  </li>
                ))}
              </ul>
            </nav>

            <MapBlock className="mt-10 hidden md:block" />
          </Reveal>
        </div>

        <div className="border-t border-white/10">
          <p className="container-page py-6 text-[13px] text-on-panel/50">
            © {new Date().getFullYear()} {site.fullName}
          </p>
        </div>
      </div>
    </footer>
  )
}
