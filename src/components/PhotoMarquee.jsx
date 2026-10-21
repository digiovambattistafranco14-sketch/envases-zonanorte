import { productHref } from '../lib/router.js'

// Fila de fotos que se desplaza sola. Las fotos se repiten (REPEAT) para que
// media pista cubra hasta pantallas muy anchas; la pista se duplica y se anima
// de 0 a -50%, así el loop no tiene salto. Se pausa al pasar el mouse; con "reducir
// movimiento" queda quieta y se puede deslizar a mano.
const REPEAT = 3

// size: 'hero' = portada (fotos grandes, pegadas entre sí); 'strip' = cinta chica.
const TILE = {
  hero: 'h-[clamp(17rem,calc(100dvh-21rem),26rem)] sm:h-[clamp(18rem,calc(100dvh-21rem),36rem)]',
  strip: 'h-32 rounded-2xl ring-1 ring-black/5 sm:h-40 2xl:h-52',
}

export default function PhotoMarquee({ photos, reverse = false, duration = 120, label, size = 'strip' }) {
  const hero = size === 'hero'
  const half = Array.from({ length: REPEAT }, () => photos).flat()
  const track = [...half, ...half]

  return (
    <div
      role="region"
      aria-label={label}
      className="marquee group/marquee relative overflow-hidden"
      style={{ '--marquee-duration': `${duration}s` }}
    >
      <ul className={`marquee-track flex w-max ${reverse ? 'marquee-reverse' : ''}`}>
        {track.map((photo, i) => {
          const copy = i >= photos.length // la primera tanda es la única que leen los lectores de pantalla
          const tile = (
            <img
              src={photo.src}
              alt={copy ? '' : photo.alt}
              width={800}
              height={1000}
              loading={i < 6 ? 'eager' : 'lazy'}
              decoding="async"
              draggable="false"
              className="size-full object-cover transition-transform duration-700 ease-out-soft group-hover/tile:scale-[1.05]"
            />
          )
          return (
            <li key={i} aria-hidden={copy || undefined} className={`shrink-0 ${hero ? 'pr-[3px]' : 'pr-3 sm:pr-4'}`}>
              <div className={`group/tile aspect-[4/5] overflow-hidden bg-surface ${TILE[size]}`}>
                {photo.product ? (
                  <a href={productHref(photo.product)} tabIndex={copy ? -1 : undefined} className="block size-full">
                    {tile}
                  </a>
                ) : (
                  tile
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
