// Logo de la marca: sello ovalado (public/img/logo/, ver scripts/optimize-images.mjs).
// Se sirve en tres tamaños para que se vea nítido también en pantallas retina.
// alt vacío cuando el texto accesible ya lo da el enlace que lo contiene.
export default function LogoSeal({ className = '', alt = 'Envases & Frascos Zona Norte', sizes = '160px', eager = false }) {
  return (
    <img
      src="/img/logo/sello-320.webp"
      srcSet="/img/logo/sello-160.webp 160w, /img/logo/sello-320.webp 320w, /img/logo/sello-640.webp 640w"
      sizes={sizes}
      width={842}
      height={892}
      alt={alt}
      decoding="async"
      loading={eager ? undefined : 'lazy'}
      className={className}
    />
  )
}
