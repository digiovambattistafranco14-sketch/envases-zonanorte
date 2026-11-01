import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { formatPriceRange, priceRange } from '../lib/pricing.js'

// Si un grupo tiene una sola opción no hay nada que elegir: ya viene elegida.
const initialChoices = (product) => Object.fromEntries(product.options.filter((g) => g.values.length === 1).map((g) => [g.id, g.values[0].id]))

// Estado de "elegir opciones y cantidad y agregar", compartido por la tarjeta
// del catálogo y la vista de detalle.
export function useProductOrder(product) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [choices, setChoices] = useState(() => initialChoices(product))
  const [focusImage, setFocusImage] = useState(null) // foto de la última opción elegida
  const [showMissing, setShowMissing] = useState(false)
  const [added, setAdded] = useState(false)

  const missing = product.options.filter((g) => !choices[g.id])
  const priceText = formatPriceRange(priceRange(product, choices))

  // Confirmación breve en el botón después de agregar.
  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(timer)
  }, [added])

  const choose = (group, valueId) => {
    setChoices(({ [group.id]: _previous, ...rest }) => (valueId ? { ...rest, [group.id]: valueId } : rest))
    const image = group.values.find((v) => v.id === valueId)?.image
    if (image) setFocusImage(image)
  }

  const add = () => {
    if (missing.length) {
      setShowMissing(true)
      return
    }
    setShowMissing(false)
    addItem(product.id, choices, qty)
    setAdded(true)
    setQty(1)
  }

  return { qty, setQty, choices, choose, missing, showMissing, focusImage, priceText, added, add }
}
