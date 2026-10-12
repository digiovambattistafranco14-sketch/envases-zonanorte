import { FacebookLogo, InstagramLogo, WhatsappLogo } from './icons.jsx'
import { navLinks, site } from '../config/site.js'
import { contactUrl } from '../lib/whatsapp.js'
import Logo from './Logo.jsx'
import Reveal from './Reveal.jsx'

const socials = [
  { key: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { key: 'facebook', label: 'Facebook', icon: FacebookLogo },
].filter((s) => site.social[s.key])

export default function Footer() {
  return (
    <footer id="contacto" className="bg-panel text-on-panel">
      <div className="container-page py-20 md:py-24">
        <Reveal className="flex flex-col gap-6 border-b border-white/10 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl">
              ¿Buscás un envase que no ves acá?
            </h2>
            <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-on-panel-muted">
              Escribinos con lo que necesitás y te decimos qué tenemos disponible.
            </p>
          </div>
          <a
            href={contactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-light self-start md:self-auto"
          >
            <WhatsappLogo size={20} weight="bold" />
            Hablar por WhatsApp
          </a>
        </Reveal>

        <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo tone="panel" size={52} />
            <p className="mt-5 max-w-[38ch] leading-relaxed text-on-panel-muted">
              Envases, frascos y accesorios para cosmética y deco hogar. Venta por unidad y por
              cantidad.
            </p>
          </div>

          <nav aria-label="Secciones">
            <h3 className="font-semibold">Secciones</h3>
            <ul className="mt-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-10 items-center text-on-panel-muted transition-colors hover:text-on-panel"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-semibold">Contacto</h3>
            <ul className="mt-3 text-on-panel-muted">
              <li>
                <a
                  href={contactUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 transition-colors hover:text-on-panel"
                >
                  <WhatsappLogo size={18} />
                  {site.whatsapp.display}
                </a>
              </li>
              <li className="flex min-h-10 items-center">Zona Norte, Buenos Aires</li>
            </ul>
            {socials.length > 0 && (
              <ul className="mt-4 flex gap-2">
                {socials.map(({ key, label, icon: Icon }) => (
                  <li key={key}>
                    <a
                      href={site.social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid size-11 place-items-center rounded-full border border-white/15 transition-colors hover:border-gold hover:text-gold"
                    >
                      <Icon size={20} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="mt-12 text-sm text-on-panel-muted">
          © {new Date().getFullYear()} {site.fullName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
