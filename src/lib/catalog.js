import { useSyncExternalStore } from 'react'
import { products as seedProducts } from '../data/products.js'
import { PHOTOS_BUCKET, getSupabase, hasSupabase, restSelect } from './supabase.js'

// Catálogo de productos: de acá lee toda la web y acá escribe el panel de
// administración.
//
// - Con Supabase configurado (ver lib/supabase.js) los productos viven en la
//   base de datos y las fotos en Supabase Storage. Se guarda una copia en el
//   navegador para que la web se muestre al instante en la próxima visita.
// - Sin Supabase (MODO DEMO) los cambios quedan solo en este navegador.

export const DEMO_MODE = !hasSupabase

const STORAGE_KEY = hasSupabase ? 'efzn-catalogo-cache' : 'efzn-catalogo-v1'

const normalize = (p, i = 0) => ({
  published: true,
  alsoIn: [],
  variants: [],
  specs: [],
  price: null,
  image: '',
  gallery: [], // fotos extra (además de la principal), hasta 9
  imageFit: 'contain',
  description: '',
  sortOrder: i,
  ...p,
})

// Fila de la base (snake_case) <-> producto de la web (camelCase).
const fromRow = (r) =>
  normalize({
    id: r.id,
    name: r.name,
    category: r.category,
    alsoIn: r.also_in ?? [],
    description: r.description ?? '',
    image: r.image ?? '',
    gallery: r.gallery ?? [],
    imageFit: r.image_fit ?? 'contain',
    price: r.price,
    variants: r.variants ?? [],
    specs: r.specs ?? [],
    published: r.published,
    sortOrder: r.sort_order ?? 0,
  })
const toRow = (p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  also_in: p.alsoIn,
  description: p.description,
  image: p.image,
  gallery: p.gallery,
  image_fit: p.imageFit,
  price: p.price,
  variants: p.variants,
  specs: p.specs,
  published: p.published,
  sort_order: p.sortOrder,
})

function loadCached() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved.map(normalize)
  } catch {
    // Sin almacenamiento o datos dañados: se usa el catálogo original.
  }
  return seedProducts.map(normalize)
}

let products = loadCached()
let published = products.filter((p) => p.published)
const listeners = new Set()

export class CatalogError extends Error {}

// Reemplaza el catálogo en memoria y lo guarda en el navegador.
function commit(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // En modo demo el navegador es el único lugar donde se guarda: hay que avisar.
    if (DEMO_MODE) throw new CatalogError('No hay más espacio en este navegador. Probá con una foto más liviana.')
  }
  products = next
  published = next.filter((p) => p.published)
  listeners.forEach((l) => l())
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Todos los productos (panel de administración). */
export const useAllProducts = () => useSyncExternalStore(subscribe, () => products)
/** Solo los publicados (web pública). */
export const usePublishedProducts = () => useSyncExternalStore(subscribe, () => published)

export const getProduct = (id) => products.find((p) => p.id === id)

const bySortOrder = (a, b) => a.sortOrder - b.sortOrder
let adminLoaded = false // el panel ya trajo todo: la lista pública no lo pisa

// Web pública: trae los productos publicados apenas carga la página.
if (hasSupabase) {
  restSelect('products', 'select=*&published=eq.true&order=sort_order')
    .then((rows) => !adminLoaded && commit(rows.map(fromRow)))
    .catch(() => {
      // Sin conexión: queda la copia guardada (o el catálogo original).
    })
}

/** Panel: trae todos los productos, también los ocultos (requiere sesión). */
export async function loadAdminCatalog() {
  if (!hasSupabase) return
  const supabase = await getSupabase()
  const { data, error } = await supabase.from('products').select('*').order('sort_order')
  if (error) throw new CatalogError('No pudimos traer los productos. Revisá la conexión y recargá la página.')
  adminLoaded = true
  commit(data.map(fromRow))
}

function friendly(error) {
  if (error?.code === '42501' || /row-level security|permission/i.test(error?.message ?? '')) {
    return new CatalogError('Tu usuario no tiene permiso para modificar productos.')
  }
  return new CatalogError('No se pudo guardar. Revisá la conexión y probá de nuevo.')
}

// Identificador legible a partir del nombre: "Frasco 500 cc" -> "frasco-500-cc".
export function slugify(text) {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'producto'
}

function uniqueId(name) {
  const base = slugify(name)
  let id = base
  for (let n = 2; products.some((p) => p.id === id); n += 1) id = `${base}-${n}`
  return id
}

const nextSortOrder = () => products.reduce((max, p) => Math.max(max, p.sortOrder), -1) + 1

// Guarda un producto (nuevo o existente) y lo deja en el lugar que le toca.
async function store(product, position) {
  const previous = getProduct(product.id)
  let saved = normalize(product)
  if (hasSupabase) {
    const supabase = await getSupabase()
    const { data, error } = await supabase.from('products').upsert(toRow(saved)).select().single()
    if (error) throw friendly(error)
    saved = fromRow(data)
  }
  const exists = products.some((p) => p.id === saved.id)
  if (exists) commit(products.map((p) => (p.id === saved.id ? saved : p)))
  else commit([...products.slice(0, position), saved, ...products.slice(position)].sort(bySortOrder))
  if (previous) removeUnusedPhotos(photosOf(previous))
  return saved
}

/** Crea o actualiza un producto. Devuelve el producto guardado. */
export async function saveProduct(draft) {
  const exists = draft.id && products.some((p) => p.id === draft.id)
  if (exists) return store(draft)
  return store({ ...draft, id: uniqueId(draft.name), sortOrder: nextSortOrder() }, products.length)
}

export async function duplicateProduct(id) {
  const original = getProduct(id)
  if (!original) return null
  const copy = {
    ...original,
    id: uniqueId(`${original.name} copia`),
    name: `${original.name} (copia)`,
    published: false,
    sortOrder: original.sortOrder,
  }
  return store(copy, products.findIndex((p) => p.id === id) + 1)
}

export async function deleteProduct(id) {
  const product = getProduct(id)
  if (hasSupabase) {
    const supabase = await getSupabase()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw friendly(error)
  }
  commit(products.filter((p) => p.id !== id))
  if (product) removeUnusedPhotos(photosOf(product))
}

export async function setPublished(id, value) {
  const product = getProduct(id)
  if (product) await store({ ...product, published: value })
}

/** Modo demo: vuelve al catálogo original de la web. */
export async function resetCatalog() {
  if (!DEMO_MODE) return
  commit(seedProducts.map(normalize))
}

/* ---------- Fotos ---------- */

// Nombre del archivo dentro del bucket, si la foto está en Supabase Storage.
function storagePath(image) {
  const marker = `/storage/v1/object/public/${PHOTOS_BUCKET}/`
  const index = image?.indexOf(marker) ?? -1
  return index === -1 ? null : decodeURIComponent(image.slice(index + marker.length))
}

const photosOf = (product) => [product.image, ...product.gallery].filter(Boolean)

// Otras partes de la web que también usan fotos del bucket (el carrusel).
const otherPhotoUsers = new Set()
export const addPhotoUser = (getUrls) => otherPhotoUsers.add(getUrls)

// Borra de Storage las fotos que ya no usa nadie (las copias comparten fotos
// con el original). Si falla no pasa nada: solo ocupan lugar.
export async function removeUnusedPhotos(urls) {
  if (!hasSupabase) return
  const inUse = new Set([...products.flatMap(photosOf), ...[...otherPhotoUsers].flatMap((getUrls) => getUrls())])
  const paths = urls.filter((url) => !inUse.has(url)).map(storagePath).filter(Boolean)
  if (!paths.length) return
  const supabase = await getSupabase()
  supabase.storage.from(PHOTOS_BUCKET).remove(paths).catch(() => {})
}

const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82))

/**
 * Prepara una foto subida desde el panel: la achica a 1000 px, la pasa a WebP
 * y la sube a Supabase Storage (en modo demo queda dentro del producto).
 * Devuelve { url, fit }: fit sugiere 'contain' si el fondo es blanco (foto de
 * estudio) o 'cover' si es una foto ambientada.
 */
export async function uploadImage(file) {
  if (!file.type.startsWith('image/')) throw new CatalogError('El archivo no es una imagen.')
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new CatalogError('No pudimos abrir esa imagen. Probá con una JPG o PNG.')
  })
  // Se trabaja sobre una copia de hasta 1600 px (para recortar sin perder nitidez).
  const work = drawOnWhite(bitmap, Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height)))
  bitmap.close()
  const studio = hasWhiteBorder(work.getContext('2d'), work)
  const fit = studio ? 'contain' : 'cover'
  // Foto de estudio: se recorta el blanco que sobra para que el producto se vea grande.
  const canvas = studio ? trimWhite(work) : drawOnWhite(work, Math.min(1, 1000 / Math.max(work.width, work.height)))

  if (!hasSupabase) return { url: canvas.toDataURL('image/webp', 0.82), fit }

  const blob = await toBlob(canvas)
  const extension = blob.type === 'image/webp' ? 'webp' : 'png' // Safari no genera WebP
  const path = `${crypto.randomUUID()}.${extension}`
  const supabase = await getSupabase()
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
  if (error) throw new CatalogError('No se pudo subir la foto. Revisá la conexión y probá de nuevo.')
  return { url: supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl, fit }
}

// Copia la imagen (escalada) sobre fondo blanco: las PNG transparentes quedan sobre blanco.
function drawOnWhite(source, scale) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

// Recorta el fondo blanco alrededor del producto, deja un margen chico y lo
// centra en un recuadro 4:5 (la forma de las tarjetas), de hasta 1000 px de alto.
function trimWhite(source) {
  const { width, height } = source
  const { data } = source.getContext('2d').getImageData(0, 0, width, height)
  let top = height
  let left = width
  let right = -1
  let bottom = -1
  const step = width * height > 1_000_000 ? 2 : 1
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      if (Math.min(data[i], data[i + 1], data[i + 2]) < 236) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }
  if (right < 0) return drawOnWhite(source, Math.min(1, 1000 / Math.max(width, height))) // toda blanca

  const margin = Math.round(Math.max(right - left, bottom - top) * 0.06)
  left = Math.max(0, left - margin)
  top = Math.max(0, top - margin)
  right = Math.min(width - 1, right + margin)
  bottom = Math.min(height - 1, bottom + margin)
  const cropW = right - left + 1
  const cropH = bottom - top + 1

  // Recuadro 4:5 que contiene el recorte.
  const ASPECT = 4 / 5
  let boxW = cropW
  let boxH = cropH
  if (cropW / cropH > ASPECT) boxH = Math.round(cropW / ASPECT)
  else boxW = Math.round(cropH * ASPECT)
  const scale = Math.min(1, 1000 / boxH)

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(boxW * scale)
  canvas.height = Math.round(boxH * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingQuality = 'high'
  const drawW = cropW * scale
  const drawH = cropH * scale
  ctx.drawImage(source, left, top, cropW, cropH, (canvas.width - drawW) / 2, (canvas.height - drawH) / 2, drawW, drawH)
  return canvas
}

// ¿El borde de la foto es casi todo blanco? (foto de estudio)
function hasWhiteBorder(ctx, { width, height }) {
  const band = Math.max(2, Math.round(Math.min(width, height) * 0.02))
  const strips = [
    ctx.getImageData(0, 0, width, band),
    ctx.getImageData(0, height - band, width, band),
    ctx.getImageData(0, 0, band, height),
    ctx.getImageData(width - band, 0, band, height),
  ]
  let white = 0
  let total = 0
  for (const { data } of strips) {
    for (let i = 0; i < data.length; i += 16) {
      total += 1
      if (Math.min(data[i], data[i + 1], data[i + 2]) > 232) white += 1
    }
  }
  return white / total > 0.85
}
