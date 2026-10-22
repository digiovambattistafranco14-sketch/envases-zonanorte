import { useSyncExternalStore } from 'react'

// Rutas por hash: funcionan en cualquier hosting estático sin configurar nada.
//   #/producto/<id>  -> página de producto
//   #/admin          -> panel de administración (lista de productos)
//   #/admin/nuevo    -> cargar un producto nuevo
//   #/admin/editar/<id> -> editar un producto
//   #/admin/carrusel -> fotos del carrusel de la portada
//   cualquier otra   -> inicio (los #rubros, #contacto, etc. son anclas)
const PRODUCT_PREFIX = '#/producto/'

export const productHref = (id) => `${PRODUCT_PREFIX}${id}`
export const adminHref = {
  list: '#/admin',
  create: '#/admin/nuevo',
  edit: (id) => `#/admin/editar/${encodeURIComponent(id)}`,
  carousel: '#/admin/carrusel',
}

// Scroll y hash de la página que se está dejando. Se leen antes de avisar a
// React, porque el cambio de página se renderiza de forma sincrónica.
let before = { scrollY: 0, hash: '' }
export const getStateBeforeChange = () => before

const subscribe = (callback) => {
  const onHashChange = (event) => {
    before = { scrollY: window.scrollY, hash: new URL(event.oldURL).hash }
    callback()
  }
  window.addEventListener('hashchange', onHashChange)
  return () => window.removeEventListener('hashchange', onHashChange)
}

const getHash = () => window.location.hash

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, getHash)
  if (hash === '#/admin' || hash.startsWith('#/admin/')) {
    const [, , view = 'list', id] = hash.slice(1).split('/')
    if (view === 'nuevo') return { page: 'admin', view: 'create' }
    if (view === 'carrusel') return { page: 'admin', view: 'carousel' }
    if (view === 'editar' && id) return { page: 'admin', view: 'edit', productId: decodeURIComponent(id) }
    return { page: 'admin', view: 'list' }
  }
  if (hash.startsWith(PRODUCT_PREFIX)) {
    return { page: 'product', productId: decodeURIComponent(hash.slice(PRODUCT_PREFIX.length)) }
  }
  return { page: 'home', anchor: hash.length > 1 ? hash : null }
}
