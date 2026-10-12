const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const PRICE_ON_REQUEST = 'Precio a consultar'

export const formatPrice = (value) => (value == null ? PRICE_ON_REQUEST : ars.format(value))
