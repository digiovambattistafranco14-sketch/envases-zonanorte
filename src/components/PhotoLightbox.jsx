import { useEffect, useRef, useState } from 'react'
import { CaretLeft, CaretRight, MagnifyingGlassPlus, X } from './icons.jsx'
import { productImageUrl } from './ProductImage.jsx'
import { lockScroll } from '../lib/smoothScroll.js'

const ZOOM = 2.2

// Fotos del producto a pantalla completa. Flechas (o deslizar) para pasar,
// clic sobre la foto para acercar y mover el mouse para recorrerla.
export default function PhotoLightbox({ photos, index, onIndex, open, onClose, title }) {
  const dialogRef = useRef(null)
  const [zoom, setZoom] = useState(null) // { x, y } en % cuando está acercada
  const swipe = useRef(null)
  const swiped = useRef(false) // el toque que terminó un deslizamiento no acerca la foto
  const many = photos.length > 1

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) {
      dialog.showModal()
      lockScroll(true)
    }
    if (!open && dialog.open) dialog.close()
    if (!open) lockScroll(false)
  }, [open])

  const go = (step) => {
    setZoom(null)
    onIndex((index + step + photos.length) % photos.length)
  }

  const pointAt = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
    }
  }

  const onKeyDown = (event) => {
    if (!many) return
    if (event.key === 'ArrowRight') go(1)
    if (event.key === 'ArrowLeft') go(-1)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        setZoom(null)
        onClose()
      }}
      onKeyDown={onKeyDown}
      data-lenis-prevent
      className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-white"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6">
            <p className="min-w-0 truncate text-[15px] font-semibold text-white/85">
              {title}
              {many && <span className="ml-3 font-normal text-white/55 tabular-nums">{`${index + 1} / ${photos.length}`}</span>}
            </p>
            <button
              type="button"
              onClick={() => {
                setZoom(null)
                onClose()
              }}
              aria-label="Cerrar"
              autoFocus
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X size={22} />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-4 sm:px-20"
            onClick={(event) => event.target === event.currentTarget && onClose()}
          >
            <div
              className={`relative h-full max-h-[min(100%,62rem)] w-full max-w-[52rem] overflow-hidden rounded-2xl bg-white ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={(event) => {
                if (swiped.current) {
                  swiped.current = false
                  return
                }
                setZoom(zoom ? null : pointAt(event))
              }}
              onMouseMove={(event) => zoom && setZoom(pointAt(event))}
              onPointerDown={(event) => {
                swipe.current = event.pointerType === 'mouse' ? null : event.clientX
              }}
              onPointerUp={(event) => {
                if (swipe.current == null || zoom) return
                const dx = event.clientX - swipe.current
                swipe.current = null
                if (many && Math.abs(dx) > 50) {
                  swiped.current = true
                  go(dx < 0 ? 1 : -1)
                }
              }}
            >
              <img
                key={photos[index]}
                src={productImageUrl(photos[index], 960)}
                alt={many ? `${title}, foto ${index + 1} de ${photos.length}` : title}
                draggable="false"
                className="photo-in size-full object-contain transition-transform duration-300 ease-out-soft select-none"
                style={zoom ? { transform: `scale(${ZOOM})`, transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
              {!zoom && (
                <span className="pointer-events-none absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap max-sm:hidden">
                  <MagnifyingGlassPlus size={14} weight="bold" />
                  Tocá para acercar
                </span>
              )}
            </div>

            {many &&
              [
                { step: -1, label: 'Foto anterior', side: 'left-2 sm:left-5', Icon: CaretLeft },
                { step: 1, label: 'Foto siguiente', side: 'right-2 sm:right-5', Icon: CaretRight },
              ].map(({ step, label, side, Icon }) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => go(step)}
                  aria-label={label}
                  className={`absolute top-1/2 ${side} grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-lg transition-transform duration-300 ease-out-soft hover:scale-105`}
                >
                  <Icon size={20} weight="bold" />
                </button>
              ))}
          </div>

          {many && (
            <ul className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 pb-5">
              {photos.map((url, i) => (
                <li key={`${i}-${url.slice(-24)}`} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(null)
                      onIndex(i)
                    }}
                    aria-label={`Ver foto ${i + 1}`}
                    aria-current={i === index}
                    className={`block size-14 cursor-pointer overflow-hidden rounded-lg bg-white transition-opacity sm:size-16 ${
                      i === index ? 'ring-2 ring-gold' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={productImageUrl(url, 480)} alt="" className="size-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </dialog>
  )
}
