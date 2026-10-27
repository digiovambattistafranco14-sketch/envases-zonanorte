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
    mapsUrl:
      'https://www.google.com/maps/place/Envases+Zona+Norte/@-34.4664134,-58.5843309,17z/data=!4m6!3m5!1s0x95bca50dd9faddcd:0xd259dd4037ecb374!8m2!3d-34.4664134!4d-58.5843309',
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
