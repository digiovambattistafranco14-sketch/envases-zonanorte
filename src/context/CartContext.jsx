import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { getProduct } from '../data/products.js'

const STORAGE_KEY = 'efzn-cart-v1'
export const MAX_QTY = 99999

const CartContext = createContext(null)

const lineKey = (productId, variantId) => (variantId ? `${productId}::${variantId}` : productId)
export const clampQty = (n) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(n)) || 1))

function reducer(items, action) {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.productId, action.variantId)
      if (items.some((i) => i.key === key)) {
        return items.map((i) => (i.key === key ? { ...i, qty: clampQty(i.qty + action.qty) } : i))
      }
      return [
        ...items,
        { key, productId: action.productId, variantId: action.variantId ?? null, qty: clampQty(action.qty) },
      ]
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
    const lines = items.map((item) => {
      const product = getProduct(item.productId)
      const variant = product.variants?.find((v) => v.id === item.variantId) ?? null
      const unitPrice = variant?.price ?? product.price ?? null
      return {
        ...item,
        product,
        variant,
        name: variant ? `${product.name} ${variant.label}` : product.name,
        unitPrice,
        subtotal: unitPrice == null ? null : unitPrice * item.qty,
      }
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
      addItem: (productId, variantId, qty) => dispatch({ type: 'add', productId, variantId, qty }),
      setQty: (key, qty) => dispatch({ type: 'setQty', key, qty }),
      removeItem: (key) => dispatch({ type: 'remove', key }),
      clearCart: () => dispatch({ type: 'clear' }),
    }
  }, [items, isOpen, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
