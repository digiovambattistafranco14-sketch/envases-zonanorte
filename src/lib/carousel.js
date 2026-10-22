import { useSyncExternalStore } from 'react'
import { carouselPhotos as defaultPhotos } from '../data/gallery.js'
import { CatalogError, DEMO_MODE, addPhotoUser, removeUnusedPhotos } from './catalog.js'
import { getSupabase, hasSupabase, restSelect } from './supabase.js'

// Fotos del carrusel de la portada: [{ src, product }], en orden.
// product: id del producto al que lleva el clic (o null).
//
// Con Supabase se guardan en la tabla settings (clave 'carousel'); si todavía
// no se editaron desde el panel, se usan las de data/gallery.js.
// En MODO DEMO quedan solo en este navegador.

export const MAX_CAROUSEL = 30
export const MIN_CAROUSEL = 3

const STORAGE_KEY = hasSupabase ? 'efzn-carrusel-cache' : 'efzn-carrusel-v1'
const SETTINGS_KEY = 'carousel'

const clean = (list) => list.filter((p) => p?.src).map((p) => ({ src: p.src, product: p.product ?? null }))

function loadCached() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved) && saved.length) return clean(saved)
  } catch {
    // Sin almacenamiento: se usan las fotos de siempre.
  }
  return clean(defaultPhotos)
}

let photos = loadCached()
const listeners = new Set()

function commit(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    if (DEMO_MODE) throw new CatalogError('No hay más espacio en este navegador. Probá con fotos más livianas.')
  }
  photos = next
  listeners.forEach((l) => l())
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useCarousel = () => useSyncExternalStore(subscribe, () => photos)

// Las fotos del carrusel no se borran de Storage aunque un producto deje de usarlas.
addPhotoUser(() => photos.map((p) => p.src))

if (hasSupabase) {
  restSelect('settings', `select=value&key=eq.${SETTINGS_KEY}`)
    .then((rows) => {
      if (Array.isArray(rows[0]?.value) && rows[0].value.length) commit(clean(rows[0].value))
    })
    .catch(() => {
      // Sin conexión (o la tabla todavía no existe): quedan las fotos guardadas.
    })
}

/** Guarda el carrusel completo, en el orden recibido. */
export async function saveCarousel(next) {
  const list = clean(next)
  if (list.length < MIN_CAROUSEL) throw new CatalogError(`El carrusel necesita al menos ${MIN_CAROUSEL} fotos.`)
  const previous = photos
  if (hasSupabase) {
    const supabase = await getSupabase()
    const { error } = await supabase.from('settings').upsert({ key: SETTINGS_KEY, value: list })
    if (error) {
      if (error.code === '42501' || /row-level security|permission/i.test(error.message ?? '')) {
        throw new CatalogError('Tu usuario no tiene permiso para cambiar el carrusel.')
      }
      throw new CatalogError('No se pudo guardar el carrusel. Revisá la conexión y probá de nuevo.')
    }
  }
  commit(list)
  removeUnusedPhotos(previous.map((p) => p.src))
  return list
}
