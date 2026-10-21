// Las fotos del catálogo inicial tienen dos anchos (480 y 960). Las que se
// suben desde el panel llegan como dirección completa (o data: en modo demo).
const isFullUrl = (image) => /^(https?:|data:|blob:|\/)/.test(image ?? '')

// Ruta de una foto de producto en uno de sus anchos.
export const productImageUrl = (image, width = 480) =>
  isFullUrl(image) ? image : `/img/productos/${image}-${width}.webp`

// Foto de producto dentro de su recuadro. Las fotos de estudio (fondo blanco)
// se funden con el recuadro; las ambientadas lo llenan.
// sizes: ancho que ocupa en pantalla, para que el navegador elija el archivo.
export default function ProductImage({ product, alt = '', sizes, lazy = true, className = '' }) {
  const fit = product.imageFit === 'contain' ? 'img-studio p-[5%]' : 'object-cover'
  if (!product.image) {
    return <span aria-hidden="true" className={`block size-full bg-[#f3f4f6] ${className}`} />
  }
  const full = isFullUrl(product.image)
  return (
    <img
      src={productImageUrl(product.image, 480)}
      srcSet={full ? undefined : `${productImageUrl(product.image, 480)} 480w, ${productImageUrl(product.image, 960)} 960w`}
      sizes={full ? undefined : sizes}
      alt={alt}
      loading={lazy ? 'lazy' : undefined}
      decoding="async"
      className={`size-full ${fit} ${className}`}
    />
  )
}
