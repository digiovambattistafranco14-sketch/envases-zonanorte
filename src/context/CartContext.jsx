import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { getProduct, useAllProducts } from '../lib/catalog.js'
import { chosenValue, unitPrice } from '../lib/pricing.js'

const STORAGE_KEY = 'efzn-cart-v1'
export const MAX_QTY = 99999

const CartContext = createContext(null)

const lineKey = (productId, choices) => [productId, ...Object.keys(choices).sort().map((k) => choices[k])].join('::')
export const clampQty = (n) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(n)) || 1))

function reducer(items, action) {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.productId, action.choices)
      if (items.some((i) => i.key === key)) {
        return items.map((i) => (i.key === key ? { ...i, qty: clampQty(i.qty + action.qty) } : i))
      }
      return [...items, { key, productId: action.productId, choices: action.choices, qty: clampQty(action.qty) }]
    }
    case 'setQty':
      return items.map((i) => (i.key === action.key ? { ...i, qty: clampQty(action.qty) } : i))
    case 'remove':
      return items.filter((i) => i.key !== action.key)
    case 'clear':
      return []
    default:
      return items
  }
}

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Descarta productos que ya no existen en el catálogo.
    return Array.isArray(saved) ? saved.filter((i) => getProduct(i.productId)) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, loadItems)
  const [isOpen, setIsOpen] = useState(false)
  const catalog = useAllProducts() // si un producto se edita o se borra, el carrito se actualiza
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Sin almacenamiento (modo privado): el carrito vive solo en memoria.
    }
  }, [items])

  const value = useMemo(() => {
    const lines = items.flatMap((item) => {
      const product = catalog.find((p) => p.id === item.productId)
      if (!product) return []
      // Los carritos guardados antes de las opciones tienen variantId y versionId.
      const choices = item.choices ?? { tamano: item.variantId, version: item.versionId }
      const chosen = product.options.flatMap((group) => {
        const value = chosenValue(group, choices)
        return value ? [{ group, value }] : []
      })
      const detail = chosen.map(({ group, value }) => `${group.name}: ${value.label}`).join(', ')
      const price = unitPrice(product, choices)
      return [{
        ...item,
        product,
        image: chosen.map(({ value }) => value.image).filter(Boolean).at(-1) || product.image,
        name: detail ? `${product.name} (${detail})` : product.name,
        unitPrice: price,
        subtotal: price == null ? null : price * item.qty,
      }]
    })
    const hasUnpriced = lines.some((l) => l.subtotal == null)
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      // null = hay al menos un producto sin precio; el total se cotiza por WhatsApp.
      total: hasUnpriced ? null : lines.reduce((sum, l) => sum + l.subtotal, 0),
      isOpen,
      openCart,
      closeCart,
      addItem: (productId, choices, qty) => dispatch({ type: 'add', productId, choices, qty }),
      setQty: (key, qty) => dispatch({ type: 'setQty', key, qty }),
      removeItem: (key) => dispatch({ type: 'remove', key }),
      clearCart: () => dispatch({ type: 'clear' }),
    }
  }, [items, catalog, isOpen, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
