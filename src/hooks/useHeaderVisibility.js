import { useEffect, useRef, useState } from 'react'
import { onScroll } from '../lib/smoothScroll.js'

const TOP_ZONE = 120 // cerca del tope la cabecera siempre se ve
const THRESHOLD = 8 // px de recorrido antes de reaccionar, para que no parpadee

// hidden: se oculta al bajar y vuelve al subir. scrolled: ya no está en el tope.
// Con "reducir movimiento" no hay eventos y la cabecera queda siempre visible.
export function useHeaderVisibility(locked = false) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)

  useEffect(
    () =>
      onScroll((y) => {
        setScrolled(y > 24)
        const delta = y - lastY.current
        if (y < TOP_ZONE) setHidden(false)
        else if (delta > THRESHOLD) setHidden(true)
        else if (delta < -THRESHOLD) setHidden(false)
        if (Math.abs(delta) > THRESHOLD || y < TOP_ZONE) lastY.current = y
      }),
    []
  )

  return { hidden: hidden && !locked, scrolled }
}
