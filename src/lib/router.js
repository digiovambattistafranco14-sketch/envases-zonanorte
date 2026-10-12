import { useSyncExternalStore } from 'react'

// Rutas por hash: funcionan en cualquier hosting estático sin configurar nada.
//   #/producto/<id>  -> página de producto
//   cualquier otra   -> inicio (los #catalogo, #contacto, etc. son anclas)
const PRODUCT_PREFIX = '#/producto/'

export const productHref = (id) => `${PRODUCT_PREFIX}${id}`

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
  if (hash.startsWith(PRODUCT_PREFIX)) {
    return { page: 'product', productId: decodeURIComponent(hash.slice(PRODUCT_PREFIX.length)) }
  }
  return { page: 'home', anchor: hash.length > 1 ? hash : null }
}
