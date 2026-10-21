import { useSyncExternalStore } from 'react'

// Rubro elegido en la sección "Elegí tu rubro" del inicio. Lo comparten la
// sección y el menú del celular, así tocar un rubro en el menú lo selecciona.
export const ALL = 'todos'

let current = ALL
const listeners = new Set()

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setCatalogCategory(id) {
  if (id === current) return
  current = id
  listeners.forEach((listener) => listener())
}

export const useCatalogCategory = () => useSyncExternalStore(subscribe, () => current)
