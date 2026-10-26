import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { productHref } from '../lib/router.js'

// Fila de fotos que se desplaza sola y se puede arrastrar (con el dedo o el
// mouse). La pista tiene dos tandas iguales de fotos: cuando la primera sale
// entera por la izquierda se vuelve al principio sin que se note.
//
// - Velocidad pareja: pasa una foto cada SECONDS_PER_TILE, haya pocas o muchas.
// - Se frena con el mouse encima (solo en compu: en celular quedaría trabada),
//   mientras se arrastra y cuando no está en pantalla (ahorra batería).
// - Con "reducir movimiento" no se mueve sola, pero se puede arrastrar.
const SECONDS_PER_TILE = 4.5
const DRAG_THRESHOLD = 6 // px que hay que mover para que cuente como arrastre y no como toque

// size: 'hero' = portada (fotos grandes, pegadas entre sí); 'strip' = cinta chica.
// svh: alto de la pantalla con la barra del navegador visible, así no cambia
// (ni hace saltar la página) cuando la barra se esconde al hacer scroll.
const TILE = {
  hero: 'h-[clamp(17rem,calc(100svh-21rem),26rem)] sm:h-[clamp(18rem,calc(100svh-21rem),36rem)]',
  strip: 'h-32 rounded-2xl ring-1 ring-black/5 sm:h-40 2xl:h-52',
}

const mod = (n, m) => ((n % m) + m) % m

export default function PhotoMarquee({ photos, reverse = false, label, size = 'strip' }) {
  const hero = size === 'hero'
  const rootRef = useRef(null)
  const trackRef = useRef(null)
  const [repeat, setRepeat] = useState(1) // veces que se repite la lista en cada tanda
  const set = Array.from({ length: repeat }, () => photos).flat()
  const track = [...set, ...set]

  // Cada tanda tiene que ser más ancha que la pantalla; con pocas fotos se repiten.
  useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current
      const first = trackRef.current?.firstElementChild
      if (!root || !first || !photos.length) return
      const needed = Math.ceil((root.clientWidth + first.offsetWidth) / (photos.length * first.offsetWidth))
      setRepeat((current) => (needed > current ? needed : current))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [photos.length])

  useEffect(() => {
    const root = rootRef.current
    const el = trackRef.current
    if (!root || !el) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const direction = reverse ? -1 : 1

    let offset = 0 // px que se corrió la pista hacia la izquierda
    let setWidth = el.scrollWidth / 2
    let speed = 0 // px por segundo
    let visible = true
    let hovering = false
    let focused = false
    let drag = null // { startX, startY, startOffset, active, lastX, lastT, velocity }
    let inertia = 0 // px por segundo después de soltar
    let suppressClick = false
    let frame = 0
    let last = 0

    const measure = () => {
      setWidth = el.scrollWidth / 2
      const tile = el.firstElementChild?.offsetWidth ?? 0
      speed = reduceMotion ? 0 : tile / SECONDS_PER_TILE
    }
    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(el)

    const paint = () => {
      if (setWidth > 0) offset = mod(offset, setWidth)
      el.style.transform = `translate3d(${-offset}px,0,0)`
    }

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1) // al volver a la pestaña no da un salto
      last = now
      if (!drag?.active) {
        if (Math.abs(inertia) > 5) {
          offset += inertia * dt
          inertia *= Math.pow(0.04, dt) // se va frenando de a poco
        } else if (!hovering && !focused) {
          inertia = 0
          offset += direction * speed * dt
        }
      }
      paint()
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame || !visible) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    // Fuera de pantalla no se anima.
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    intersection.observe(root)

    const onPointerDown = (event) => {
      if (event.button !== 0) return
      inertia = 0
      drag = { startX: event.clientX, startY: event.clientY, startOffset: offset, active: false, lastX: event.clientX, lastT: event.timeStamp, velocity: 0 }
    }
    const onPointerMove = (event) => {
      if (!drag) return
      const dx = event.clientX - drag.startX
      const dy = event.clientY - drag.startY
      if (!drag.active) {
        if (Math.abs(dx) < DRAG_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
        drag.active = true
        root.setPointerCapture?.(event.pointerId)
        root.classList.add('is-dragging')
      }
      offset = drag.startOffset - dx
      const dt = event.timeStamp - drag.lastT
      if (dt > 0) drag.velocity = (-(event.clientX - drag.lastX) / dt) * 1000
      drag.lastX = event.clientX
      drag.lastT = event.timeStamp
      if (!frame) paint()
    }
    const onPointerUp = () => {
      if (drag?.active) {
        suppressClick = true // el clic que sigue a un arrastre no abre el producto
        inertia = Math.max(-3000, Math.min(3000, drag.velocity))
        root.classList.remove('is-dragging')
      }
      drag = null
    }
    const onClick = (event) => {
      if (!suppressClick) return
      suppressClick = false
      event.preventDefault()
      event.stopPropagation()
    }
    const onEnter = () => {
      if (canHover) hovering = true
    }
    const onLeave = () => {
      hovering = false
    }
    const onFocusIn = () => {
      focused = true
    }
    const onFocusOut = (event) => {
      if (!root.contains(event.relatedTarget)) focused = false
    }

    root.addEventListener('pointerdown', onPointerDown)
    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerup', onPointerUp)
    root.addEventListener('pointercancel', onPointerUp)
    root.addEventListener('click', onClick, true)
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    start()

    return () => {
      stop()
      resizeObserver.disconnect()
      intersection.disconnect()
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerup', onPointerUp)
      root.removeEventListener('pointercancel', onPointerUp)
      root.removeEventListener('click', onClick, true)
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
    }
  }, [reverse, repeat, photos])

  return (
    <div ref={rootRef} role="region" aria-label={label} className="marquee relative cursor-grab touch-pan-y overflow-hidden select-none">
      <ul ref={trackRef} className="flex w-max will-change-transform">
        {track.map((photo, i) => {
          const copy = i >= photos.length // solo la primera vuelta la leen los lectores de pantalla
          const tile = (
            <img
              src={photo.src}
              alt={copy ? '' : photo.alt}
              width={800}
              height={1000}
              loading={i < 4 ? 'eager' : 'lazy'}
              fetchPriority={hero && i < 2 ? 'high' : undefined}
              decoding="async"
              draggable="false"
              className="pointer-events-none size-full object-cover transition-transform duration-700 ease-out-soft group-hover/tile:scale-[1.05]"
            />
          )
          return (
            <li key={i} aria-hidden={copy || undefined} className={`shrink-0 ${hero ? 'pr-[3px]' : 'pr-3 sm:pr-4'}`}>
              <div className={`group/tile aspect-[4/5] overflow-hidden bg-surface ${TILE[size]}`}>
                {photo.product ? (
                  <a href={productHref(photo.product)} tabIndex={copy ? -1 : undefined} draggable="false" className="block size-full">
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
