import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'

// Estado de "elegir tamaño + cantidad y agregar", compartido por la tarjeta
// del catálogo y la vista de detalle.
export function useProductOrder(product) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? null)
  const [added, setAdded] = useState(false)

  const variant = product.variants?.find((v) => v.id === variantId)
  const price = variant?.price ?? product.price ?? null

  // Confirmación breve en el botón después de agregar.
  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(timer)
  }, [added])

  const add = () => {
    addItem(product.id, variantId, qty)
    setAdded(true)
    setQty(1)
  }

  return { qty, setQty, variantId, setVariantId, price, added, add }
}
