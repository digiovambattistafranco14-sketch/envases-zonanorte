import { site } from '../config/site.js'

// Sello recortado en círculo y servido a 2x/3x para que no se vea borroso.
// El nombre va en texto real al lado: siempre nítido a cualquier tamaño.
export function LogoMark({ size = 44, className = '' }) {
  return (
    <img
      src="/img/logo/logo-96.webp"
      srcSet="/img/logo/logo-96.webp 96w, /img/logo/logo-192.webp 192w, /img/logo/logo-512.webp 512w"
      sizes={`${size}px`}
      width={size}
      height={size}
      alt=""
      decoding="async"
      className={`shrink-0 rounded-full ring-1 ring-gold/60 ${className}`}
    />
  )
}

// compact: en pantallas muy angostas (menos de 380px) muestra solo el sello.
export default function Logo({ size = 44, tone = 'default', compact = false }) {
  const onPanel = tone === 'panel'
  return (
    <span className="flex items-center gap-3">
      <LogoMark size={size} />
      <span className={`flex flex-col leading-none ${compact ? 'max-[379px]:hidden' : ''}`}>
        <span
          className={`font-display text-[17px] font-semibold tracking-tight whitespace-nowrap sm:text-[19px] ${onPanel ? 'text-on-panel' : 'text-ink'}`}
        >
          {site.name}
        </span>
        <span
          className={`mt-1 text-[10px] font-semibold tracking-[0.24em] uppercase ${
            onPanel ? 'text-gold' : 'text-gold-ink'
          }`}
        >
          {site.zone}
        </span>
      </span>
    </span>
  )
}
