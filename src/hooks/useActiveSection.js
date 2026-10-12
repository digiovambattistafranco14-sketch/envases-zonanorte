import { useEffect, useState } from 'react'

// Devuelve el href (#id) de la sección que cruza la mitad de la pantalla.
// Mientras se pasa por secciones que no están en la lista, conserva la última.
export function useActiveSection(hrefs, enabled = true) {
  const [active, setActive] = useState(hrefs[0])

  useEffect(() => {
    if (!enabled) return
    const sections = hrefs.map((href) => document.getElementById(href.slice(1))).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting)
        if (current) setActive(`#${current.target.id}`)
      },
      { rootMargin: '-45% 0px -55% 0px' }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [hrefs, enabled])

  return active
}
