import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowSquareOut, CaretLeft, CaretRight, Check, Images, Plus, UploadSimple, X } from '../../components/icons.jsx'
import PhotoMarquee from '../../components/PhotoMarquee.jsx'
import { MAX_CAROUSEL, MIN_CAROUSEL, saveCarousel, useCarousel } from '../../lib/carousel.js'
import { uploadImage, useAllProducts } from '../../lib/catalog.js'
import { ConfirmDialog, FormSection, useAction, useToast } from './ui.jsx'

let keyCounter = 0
const withKey = (photo) => ({ ...photo, key: `c${(keyCounter += 1)}` })
const sameList = (a, b) => JSON.stringify(a.map(({ src, product }) => [src, product])) === JSON.stringify(b.map(({ src, product }) => [src, product]))

function TileButton({ label, onClick, disabled = false, danger = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid size-8 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-colors disabled:invisible ${
        danger ? 'hover:bg-[#c0392b] hover:text-white' : 'hover:bg-white'
      }`}
    >
      {children}
    </button>
  )
}

export default function CarouselEditor() {
  const saved = useCarousel()
  const products = useAllProducts()
  const toast = useToast()
  const run = useAction()
  const [photos, setPhotos] = useState(() => saved.map(withKey))
  const [progress, setProgress] = useState(null)
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [leaveTo, setLeaveTo] = useState(null)
  const inputRef = useRef(null)
  const savedRef = useRef(false)

  const dirty = !sameList(photos, saved)
  const room = MAX_CAROUSEL - photos.length
  const tooFew = photos.length < MIN_CAROUSEL
  const preview = useMemo(() => photos.map(({ src }) => ({ src, alt: '' })), [photos])

  // Si llegan las fotos guardadas (primera carga) y no se tocó nada, mostrarlas.
  const lastSaved = useRef(saved)
  useEffect(() => {
    if (lastSaved.current !== saved && sameList(photos, lastSaved.current)) setPhotos(saved.map(withKey))
    lastSaved.current = saved
  }, [saved, photos])

  // Avisar antes de salir con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event) => event.preventDefault()
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]')
      if (!link || link.target === '_blank' || savedRef.current) return
      event.preventDefault()
      event.stopPropagation()
      setLeaveTo(link.getAttribute('href'))
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
    }
  }, [dirty])

  const handleFiles = async (fileList) => {
    const files = [...(fileList ?? [])].filter((file) => file.type.startsWith('image/'))
    if (!files.length || progress) return
    if (room <= 0) {
      setNotice(`El carrusel ya tiene ${MAX_CAROUSEL} fotos, que es el máximo.`)
      return
    }
    const batch = files.slice(0, room)
    setNotice('')
    setProgress({ done: 0, total: batch.length })
    const added = []
    let failed = 0
    for (const file of batch) {
      try {
        const { url } = await uploadImage(file)
        added.push(withKey({ src: url, product: null }))
      } catch {
        failed += 1
      }
      setProgress({ done: added.length + failed, total: batch.length })
    }
    setProgress(null)
    if (added.length) setPhotos((current) => [...current, ...added])
    if (failed) setNotice(failed === 1 ? 'Una foto no se pudo cargar. Probá con JPG o PNG.' : `${failed} fotos no se pudieron cargar. Probá con JPG o PNG.`)
    else if (files.length > batch.length) setNotice(`Se agregaron ${batch.length}: el máximo es ${MAX_CAROUSEL} fotos.`)
  }

  const setProduct = (key, product) => setPhotos((list) => list.map((p) => (p.key === key ? { ...p, product: product || null } : p)))
  const remove = (key) => setPhotos((list) => list.filter((p) => p.key !== key))
  const move = (index, step) =>
    setPhotos((list) => {
      const next = [...list]
      ;[next[index], next[index + step]] = [next[index + step], next[index]]
      return next
    })

  const save = () =>
    run(async () => {
      setSaving(true)
      try {
        await saveCarousel(photos)
        toast('Carrusel guardado', { action: { label: 'Ver en la web', href: '#inicio', external: true } })
      } finally {
        setSaving(false)
      }
    })

  const discard = () => {
    setPhotos(saved.map(withKey))
    setNotice('')
  }

  return (
    <div className="page-in pb-28">
      <h1 className="font-display text-[2.4rem] leading-none font-medium tracking-tight sm:text-5xl">Carrusel</h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted">
        Las fotos grandes que pasan solas en la portada de la web, en este orden. Si una foto está unida a un producto, al tocarla se abre ese producto.
      </p>

      <section className="mt-8 overflow-hidden rounded-3xl bg-panel ring-1 ring-black/10">
        <p className="flex items-center gap-2 px-5 pt-4 pb-3 text-[12px] font-bold tracking-[0.16em] text-on-panel-muted uppercase">
          <span className="size-2 rounded-full bg-[#1f9d55]" />
          Vista previa
        </p>
        <div inert>{preview.length > 0 ? <PhotoMarquee photos={preview} duration={Math.max(30, preview.length * 6)} label="Vista previa del carrusel" /> : <div className="h-32 sm:h-40" />}</div>
        <div className="h-4" />
      </section>

      <div className="mt-5">
        <FormSection
          step={<Images size={17} />}
          title="Fotos del carrusel"
          hint="Conviene que sean verticales: se muestran en formato 4:5 y se recortan los bordes que sobren."
        >
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              handleFiles(e.dataTransfer.files)
            }}
            className={`-m-2 rounded-2xl p-2 transition-colors duration-200 ${dragging ? 'bg-[#f6efdc] ring-2 ring-gold' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p className="text-[14px] text-muted">Con las flechas cambiás el orden. Arrastrá fotos acá para sumarlas.</p>
              <span className={`shrink-0 text-[13px] tabular-nums ${room === 0 ? 'font-semibold text-gold-ink' : 'text-muted'}`}>
                {photos.length} de {MAX_CAROUSEL}
              </span>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {photos.map((photo, i) => (
                <li key={photo.key} className="min-w-0">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#f5f6f8] ring-1 ring-black/10">
                    <img src={photo.src} alt={`Foto ${i + 1} del carrusel`} loading="lazy" className="size-full object-cover" />
                    <span className="absolute top-2 left-2 grid size-7 place-items-center rounded-full bg-white/90 text-[13px] font-bold shadow-sm">{i + 1}</span>
                    <span className="absolute top-2 right-2">
                      <TileButton label={`Quitar foto ${i + 1}`} danger onClick={() => remove(photo.key)}>
                        <X size={15} weight="bold" />
                      </TileButton>
                    </span>
                    <div className="absolute inset-x-2 bottom-2 flex justify-between">
                      <TileButton label={`Mover foto ${i + 1} antes`} disabled={i === 0} onClick={() => move(i, -1)}>
                        <CaretLeft size={15} weight="bold" />
                      </TileButton>
                      <TileButton label={`Mover foto ${i + 1} después`} disabled={i === photos.length - 1} onClick={() => move(i, 1)}>
                        <CaretRight size={15} weight="bold" />
                      </TileButton>
                    </div>
                  </div>
                  <label className="mt-2 block">
                    <span className="text-[12px] font-semibold text-muted">Al tocarla lleva a</span>
                    <select
                      value={photo.product ?? ''}
                      onChange={(e) => setProduct(photo.key, e.target.value)}
                      className="mt-1 h-10 w-full cursor-pointer truncate rounded-lg bg-[#f5f6f8] px-2.5 text-[13px] font-medium ring-1 ring-black/[0.08] focus:ring-2 focus:ring-gold-ink focus:outline-none"
                    >
                      <option value="">Ningún producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.published ? '' : ' (oculto)'}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
              {room > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => inputRef.current.click()}
                    disabled={Boolean(progress)}
                    className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#c9cad1] bg-[#f5f6f8] px-3 text-center text-[14px] font-semibold text-muted transition-colors hover:border-ink hover:text-ink disabled:cursor-wait"
                  >
                    {progress ? (
                      <>
                        <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {progress.total > 1 ? `Subiendo ${Math.min(progress.done + 1, progress.total)} de ${progress.total}…` : 'Preparando foto…'}
                      </>
                    ) : (
                      <>
                        <span className="grid size-11 place-items-center rounded-full bg-white text-ink shadow-[0_6px_16px_-8px_rgb(0_0_0/0.3)]">
                          {photos.length ? <Plus size={20} weight="bold" /> : <UploadSimple size={20} />}
                        </span>
                        Agregar fotos
                        <span className="text-[12px] font-normal">Podés elegir varias</span>
                      </>
                    )}
                  </button>
                </li>
              )}
            </ul>

            {notice && <p className="mt-3 text-[13px] font-medium text-[#c0392b]">{notice}</p>}
            {tooFew && <p className="mt-3 text-[13px] font-medium text-[#b9770e]">Poné al menos {MIN_CAROUSEL} fotos para que el carrusel se vea bien.</p>}
          </div>
        </FormSection>
      </div>

      {createPortal(
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5">
          <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl bg-white/90 p-2.5 shadow-[0_-8px_40px_-12px_rgb(0_0_0/0.25)] ring-1 ring-black/[0.06] backdrop-blur-md sm:p-3">
            <p className="hidden min-w-0 items-center gap-2 pl-2 text-[14px] font-medium sm:flex">
              <span className={`size-2 shrink-0 rounded-full ${dirty ? 'bg-[#e2a03f]' : 'bg-[#1f9d55]'}`} />
              <span className={dirty ? '' : 'text-muted'}>{dirty ? 'Hay cambios sin guardar' : 'Todo guardado'}</span>
            </p>
            <a
              href="#inicio"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-12 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-muted hover:bg-[#eceef1] hover:text-ink sm:ml-auto md:inline-flex"
            >
              <ArrowSquareOut size={17} />
              Ver en la web
            </a>
            <button
              type="button"
              onClick={discard}
              disabled={!dirty || saving}
              className="btn btn-outline min-h-12 px-5 text-[14px] tracking-normal normal-case disabled:opacity-40 max-md:sm:ml-auto"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving || tooFew || Boolean(progress)}
              className="btn btn-primary min-h-12 flex-1 px-6 text-[14px] tracking-normal normal-case disabled:opacity-40 sm:flex-none"
            >
              <Check size={18} weight="bold" />
              {saving ? 'Guardando…' : 'Guardar carrusel'}
            </button>
          </div>
        </div>,
        document.body,
      )}

      <ConfirmDialog
        open={leaveTo != null}
        title="¿Salir sin guardar?"
        confirmLabel="Salir sin guardar"
        cancelLabel="Seguir editando"
        danger
        onCancel={() => setLeaveTo(null)}
        onConfirm={() => {
          savedRef.current = true
          const target = leaveTo
          setLeaveTo(null)
          window.location.hash = target
        }}
      >
        Los cambios que hiciste en el carrusel se van a perder.
      </ConfirmDialog>
    </div>
  )
}
