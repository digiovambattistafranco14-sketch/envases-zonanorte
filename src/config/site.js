// Datos del negocio. Todo lo que cambia seguido se edita acá.
export const site = {
  name: 'Envases & Frascos',
  zone: 'Zona Norte',
  fullName: 'Envases & Frascos Zona Norte',
  whatsapp: {
    number: '5491168449701', // formato internacional sin "+" ni espacios
    display: '+54 9 11 6844-9701',
  },
  // Mail de consultas. Dejar vacío para ocultarlo (las consultas igual llegan por WhatsApp).
  email: '',
  // Local. El mapa (public/img/mapa-local.webp) se genera con scripts/build-map.mjs.
  location: {
    address: 'Chile 2120, Virreyes',
    // Enlace a la ficha del local en Google Maps (abre el lugar exacto, también en la app).
    mapsUrl: 'https://maps.google.com/?cid=15157389288778019700',
  },
  // Texto de envíos del footer (va debajo de "Realizamos envíos").
  shipping: 'Zona Norte, puntos de encuentro, Capital Federal y a todo el país (consultar).',
  // Dejar vacío para ocultar el ícono en el footer.
  social: {
    instagram: 'https://www.instagram.com/envases_zona_norte1/',
    facebook: 'https://www.facebook.com/envaseszonanorte',
  },
}

export const navLinks = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#rubros', label: 'Rubros' },
  { href: '#consultas', label: 'Consultas' },
  { href: '#contacto', label: 'Contacto' },
]
