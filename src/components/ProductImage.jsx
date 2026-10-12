// Ruta de una foto de producto en uno de sus anchos (480 o 960).
export const productImageUrl = (name, width = 480) => `/img/productos/${name}-${width}.webp`

// Foto de producto dentro de su recuadro. Las fotos de estudio (fondo blanco)
// se funden con el recuadro; las ambientadas lo llenan.
// sizes: ancho que ocupa en pantalla, para que el navegador elija el archivo.
export default function ProductImage({ product, alt = '', sizes, lazy = true, className = '' }) {
  return (
    <img
      src={productImageUrl(product.image, 480)}
      srcSet={`${productImageUrl(product.image, 480)} 480w, ${productImageUrl(product.image, 960)} 960w`}
      sizes={sizes}
      alt={alt}
      loading={lazy ? 'lazy' : undefined}
      decoding="async"
      className={`size-full ${product.imageFit === 'contain' ? 'img-studio p-[5%]' : 'object-cover'} ${className}`}
    />
  )
}
