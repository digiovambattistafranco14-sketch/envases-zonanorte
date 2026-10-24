import { ChatsCircle, FacebookLogo, InstagramLogo, MapPin, Truck, WhatsappLogo } from './icons.jsx'
import { site } from '../config/site.js'
import { categories } from '../data/products.js'
import { setCatalogCategory } from '../lib/catalogFilter.js'
import { contactUrl } from '../lib/whatsapp.js'
import LogoSeal from './LogoSeal.jsx'

const socials = [
  { key: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { key: 'facebook', label: 'Facebook', icon: FacebookLogo },
].filter((s) => site.social[s.key])

const linkClass = 'inline-flex min-h-9 items-center gap-2 transition-colors duration-300 hover:text-gold-light'

// Pie negro y simple (en su propio panel): logo y contacto a la izquierda,
// rubros a la derecha.
export default function Footer() {
  return (
    <footer id="contacto" className="px-2 py-2 sm:px-4 sm:py-4">
      <div className="relative mx-auto max-w-[110rem] overflow-hidden rounded-[1.5rem] bg-panel text-on-panel ring-1 ring-gold/40 sm:rounded-[2.25rem]">
        <div className="container-page grid gap-12 py-16 md:grid-cols-[1fr_auto] md:items-start md:py-20">
          <div className="max-w-xl">
            {/* Logo con los datos de contacto al lado (también en celular) */}
            <div className="flex items-center gap-5 sm:gap-8">
              <LogoSeal className="h-28 w-auto shrink-0 sm:h-36" sizes="(min-width: 640px) 136px, 106px" />
              <ul className="min-w-0 space-y-0.5 text-[15px] text-on-panel/75">
                <li>
                  <a href={contactUrl()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <WhatsappLogo size={18} />
                    {site.whatsapp.display}
                  </a>
                </li>
                {site.email && (
                  <li>
                    <a href={`mailto:${site.email}`} className={linkClass}>
                      {site.email}
                    </a>
                  </li>
                )}
                {socials.map(({ key, label, icon: Icon }) => (
                  <li key={key}>
                    <a href={site.social[key]} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      <Icon size={18} />
                      {label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#consultas" className={linkClass}>
                    <ChatsCircle size={18} />
                    Consultas
                  </a>
                </li>
                <li className="flex min-h-9 items-center gap-2">
                  <MapPin size={18} />
                  Zona Norte y GBA
                </li>
              </ul>
            </div>

            <div className="mt-8 flex items-start gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-gold/30 sm:p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-light ring-1 ring-gold/40">
                <Truck size={26} />
              </span>
              <p className="text-[15px] leading-relaxed text-on-panel/75">
                <strong className="block text-[16px] font-semibold text-on-panel">Realizamos envíos</strong>
                {site.shipping}
              </p>
            </div>
          </div>

          <nav aria-label="Rubros">
            <h3 className="text-[11px] font-bold tracking-[0.22em] text-gold-light uppercase">Rubros</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-12 text-[15px] text-on-panel/75">
              {categories.map((category) => (
                <li key={category.id}>
                  <a href="#rubros" onClick={() => setCatalogCategory(category.id)} className={linkClass}>
                    {category.label}
                  </a>
                  {category.detail && <p className="-mt-1 mb-1 max-w-[16rem] text-[12px] leading-snug text-on-panel/45">{category.detail}</p>}
                </li>
              ))}
            </ul>
          </nav>
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
