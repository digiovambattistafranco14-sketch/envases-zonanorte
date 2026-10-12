import { site } from '../config/site.js'
import { formatPrice } from './format.js'

export const whatsappUrl = (text) =>
  `https://wa.me/${site.whatsapp.number}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const contactUrl = () =>
  whatsappUrl(`Hola, quería hacer una consulta sobre los productos de ${site.fullName}.`)

// lines: [{ name, qty, subtotal }]. total: número, o null si falta algún precio.
export function buildOrderMessage({ name, phone, lines, total }) {
  const detail = lines
    .map((l) => {
      const price = l.subtotal == null ? 'precio a consultar' : formatPrice(l.subtotal)
      return `- ${l.qty}x ${l.name} (${price})`
    })
    .join('\n')

  return [
    `Hola, mi nombre es ${name}. Me gustaría realizar el siguiente pedido de ${site.fullName}:`,
    '',
    detail,
    '',
    `Total estimado: ${total == null ? 'a consultar' : formatPrice(total)}`,
    `Mi número de contacto es: ${phone}`,
  ].join('\n')
}
