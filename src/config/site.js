// Datos del negocio. Todo lo que cambia seguido se edita acá.
export const site = {
  name: 'Envases & Frascos',
  zone: 'Zona Norte',
  fullName: 'Envases & Frascos Zona Norte',
  whatsapp: {
    number: '5491168449701', // formato internacional sin "+" ni espacios
    display: '+54 9 11 6844-9701',
  },
  // Dejar vacío para ocultar el ícono en el footer.
  social: {
    instagram: '',
    facebook: '',
  },
  coverage: [
    'Vicente López',
    'San Isidro',
    'San Fernando',
    'Tigre',
    'San Martín',
    'Pilar',
    'Escobar',
    'Malvinas Argentinas',
    'San Miguel',
    'José C. Paz',
  ],
  mapEmbedUrl:
    'https://www.google.com/maps?q=Zona+Norte,+Gran+Buenos+Aires,+Argentina&z=10&output=embed',
}

export const navLinks = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#catalogo', label: 'Catálogo' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#contacto', label: 'Contacto' },
]
