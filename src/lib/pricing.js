import { PRICE_ON_REQUEST, formatPrice } from './format.js'

// El precio de un producto se arma por partes: precio base + lo que suma cada
// opción elegida (Cc, Color, Cierre...). choices: { idDelGrupo: idDeLaOpción }
//
// Lo que suma una opción puede ser:
// - fijo (value.price). Vacío: no suma nada.
// - según lo elegido en otros grupos (group.dependsOn + value.prices, con un
//   precio por combinación). Vacío: esa combinación es "a consultar".
// Si el último grupo depende de todos los demás, cada combinación completa tiene
// su propio precio: así entra cualquier lista de precios.

const dependsOn = (group) => group.dependsOn ?? []

export const chosenValue = (group, choices) => group.values.find((v) => v.id === choices?.[group.id]) ?? null

// Clave de una combinación dentro de value.prices. No cambia si se reordenan los grupos.
export const comboKey = (ids, choices) => [...ids].sort().map((id) => choices[id]).join('|')

// Todas las combinaciones de los grupos indicados: [{ key, label, choices }].
export function priceCombos(ids, groups) {
  let combos = [{ choices: {}, labels: [] }]
  for (const group of groups.filter((g) => ids.includes(g.id))) {
    const values = group.values.filter((v) => v.label.trim())
    combos = combos.flatMap((c) => values.map((v) => ({ choices: { ...c.choices, [group.id]: v.id }, labels: [...c.labels, v.label.trim()] })))
  }
  return combos.map((c) => ({ key: comboKey(ids, c.choices), label: c.labels.join(' · '), choices: c.choices }))
}

// Lo que suma una opción con lo elegido. null: a consultar (o falta elegir aquello de lo que depende).
export function valuePrice(group, value, choices) {
  if (!dependsOn(group).length) return value.price ?? 0
  return value.prices?.[comboKey(dependsOn(group), choices)] ?? null
}

// Lo menos y lo más que puede salir con lo elegido hasta ahora. null si es a consultar.
export function priceRange(product, choices = {}) {
  const groups = product.options
  const linkedIds = new Set(groups.flatMap(dependsOn))
  const isLinked = (g) => dependsOn(g).length > 0 || linkedIds.has(g.id)
  const candidates = (g) => {
    const chosen = chosenValue(g, choices)
    return chosen ? [chosen] : g.values
  }

  // Los grupos sueltos se suman directo.
  let min = product.price ?? 0
  let max = min
  for (const group of groups.filter((g) => !isLinked(g))) {
    const prices = candidates(group).map((v) => v.price ?? 0)
    min += Math.min(...prices)
    max += Math.max(...prices)
  }

  // Los que dependen entre sí: se prueban todas las combinaciones posibles.
  let assignments = [{}]
  const linked = groups.filter(isLinked)
  for (const group of linked) {
    assignments = assignments.flatMap((a) => candidates(group).map((v) => ({ ...a, [group.id]: v.id })))
  }
  if (linked.length) {
    const totals = assignments.flatMap((assignment) => {
      const prices = linked.map((g) => valuePrice(g, chosenValue(g, assignment), assignment))
      return prices.includes(null) ? [] : [prices.reduce((sum, price) => sum + price, 0)]
    })
    if (!totals.length) return null
    min += Math.min(...totals)
    max += Math.max(...totals)
  }
  return { min, max }
}

export function formatPriceRange(range) {
  if (!range || range.max === 0) return PRICE_ON_REQUEST
  if (range.min === range.max) return formatPrice(range.min)
  if (range.min === 0) return 'Según las opciones'
  return `${formatPrice(range.min)} – ${formatPrice(range.max)}`
}

// Precio de una unidad. null si es a consultar o si todavía falta elegir algo que cambia el precio.
export function unitPrice(product, choices) {
  const range = priceRange(product, choices)
  return range && range.min === range.max && range.max > 0 ? range.max : null
}
