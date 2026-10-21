// Catálogo. Para sumar un producto: agregar un objeto a `products` y su foto
// optimizada en public/img/productos/ (ver scripts/optimize-images.mjs).
//
// image: nombre base de la foto (sin tamaño ni extensión).
// price: número en pesos, o null para mostrar "Precio a consultar".
// variants: opcional. Cada variante puede tener su propio price.
// specs: características que se muestran en la vista de detalle.
// category: rubro principal. alsoIn: otros rubros donde también aparece.
// imageFit: 'cover' (foto ambientada, llena el recuadro) o 'contain' (foto de
// estudio con fondo blanco: se ve entera y el fondo se funde con el recuadro).

// Rubros, en el orden que pidió el cliente: son las opciones de "Elegí tu
// rubro" en el inicio. image: miniatura de la opción (public/img/galeria/).
export const categories = [
  { id: 'alimenticio', label: 'Alimenticio', image: 'frascos-gigante-corcho' },
  { id: 'limpieza', label: 'Artículos de limpieza', short: 'Limpieza', image: 'botella-venecia' },
  { id: 'cosmetica', label: 'Cosmética', image: 'potes-ambar' },
  { id: 'deco-hogar', label: 'Deco Hogar', image: 'ambiente-difusor-tallado' },
  { id: 'laboratorio', label: 'Laboratorio', image: 'vasito-medidor' },
  { id: 'perfumeria', label: 'Perfumería', image: 'potes-nacar-ovoide' },
  { id: 'varios', label: 'Varios', image: 'vasos-cilindricos' },
]

export const products = [
  // Alimenticio
  {
    id: 'frasco-gigante-corcho',
    name: 'Frasco Gigante con tapa de corcho 110 mm',
    category: 'alimenticio',
    description: 'Frasco de vidrio con tapa de corcho de 110 mm. Para galletitas, cápsulas y alimentos secos.',
    image: 'frascos-gigante-corcho',
    imageFit: 'cover',
    price: null,
    variants: [
      { id: '1500cc', label: '1.500 cc', price: null },
      { id: '3000cc', label: '3.000 cc', price: null },
    ],
    specs: [
      { label: 'Artículo', value: 'Alimenticio' },
      { label: 'Modelo', value: 'Gigante' },
      { label: 'Capacidades', value: '1.500 y 3.000 cc' },
      { label: 'Material', value: 'Vidrio' },
      { label: 'Tapa', value: 'Corcho de 110 mm' },
    ],
  },
  {
    id: 'frasco-tapa-plastica',
    name: 'Frasco de vidrio con tapa plástica',
    category: 'alimenticio',
    description: 'Frasco de vidrio con tapa plástica, en 1.500 y 3.000 cc. Para conservas y alimentos secos.',
    image: 'frascos-tapa-plastica',
    imageFit: 'cover',
    price: null,
    variants: [
      { id: '1500cc', label: '1.500 cc', price: null },
      { id: '3000cc', label: '3.000 cc', price: null },
    ],
    specs: [
      { label: 'Artículo', value: 'Alimenticio' },
      { label: 'Capacidades', value: '1.500 y 3.000 cc' },
      { label: 'Material', value: 'Vidrio' },
      { label: 'Tapa', value: 'Plástica' },
    ],
  },
  {
    id: 'frasco-pvc-gigante',
    name: 'Frasco PVC Gigante con tapa blanca',
    category: 'alimenticio',
    description: 'Frasco de PVC transparente con tapa blanca, en 1.500 y 3.000 cc.',
    image: 'frasco-pvc-gigante',
    imageFit: 'contain',
    price: null,
    variants: [
      { id: '1500cc', label: '1.500 cc', price: null },
      { id: '3000cc', label: '3.000 cc', price: null },
    ],
    specs: [
      { label: 'Artículo', value: 'Alimenticio' },
      { label: 'Modelo', value: 'Gigante' },
      { label: 'Capacidades', value: '1.500 y 3.000 cc' },
      { label: 'Material', value: 'PVC' },
      { label: 'Tapa', value: 'Blanca' },
    ],
  },
  // Perfumería
  {
    id: 'pote-nacar-ovoide',
    name: 'Pote Nácar T / Ovoide',
    category: 'perfumeria',
    description: 'Pote color nácar de forma ovoide, en cuatro tamaños. Para perfumería y cosmética.',
    image: 'potes-nacar-ovoide',
    imageFit: 'contain',
    price: null,
    variants: [
      { id: '60cc', label: '60 cc', price: null },
      { id: '30cc', label: '30 cc', price: null },
      { id: '20cc', label: '20 cc', price: null },
      { id: '15cc', label: '15 cc', price: null },
    ],
    specs: [
      { label: 'Artículo', value: 'Perfumería' },
      { label: 'Modelo', value: 'Nácar T / Ovoide' },
      { label: '60 cc', value: 'Alto 4 cm, base 5 cm' },
      { label: '30 cc', value: 'Alto 3,5 cm, base 3,5 cm' },
      { label: '20 cc', value: 'Alto 3 cm, base 3 cm' },
      { label: '15 cc', value: 'Alto 2,5 cm, base 2,5 cm' },
    ],
  },
  // Cosmética
  {
    id: 'pote-toro-ambar',
    name: 'Pote Toro Ámbar',
    category: 'cosmetica',
    alsoIn: ['laboratorio'],
    description: 'Pote ámbar con tapa negra a rosca. Para cremas, bálsamos y ungüentos.',
    image: 'potes-ambar-tapa-negra',
    imageFit: 'contain',
    price: null,
    variants: [
      { id: '100cc', label: '100 cc', price: null },
      { id: '50cc', label: '50 cc', price: null },
      { id: '30cc', label: '30 cc', price: null },
      { id: '15cc', label: '15 cc', price: null },
    ],
    specs: [
      { label: 'Modelo', value: 'Toro Ámbar' },
      { label: 'Capacidades', value: '100, 50, 30 y 15 cc' },
      { label: 'Color', value: 'Ámbar' },
      { label: 'Tapa', value: 'Negra, a rosca' },
    ],
  },
  {
    id: 'botella-venecia-250-gatillo',
    name: 'Botella Venecia Ámbar 250 cc con gatillo',
    category: 'cosmetica',
    alsoIn: ['limpieza'],
    description: 'Botella de 250 cc con gatillo mini trigger. Para brumas, textiles y capilares.',
    image: 'botella-venecia-250-gatillo',
    imageFit: 'contain',
    price: null,
    specs: [
      { label: 'Artículo', value: 'Cosmética' },
      { label: 'Modelo', value: 'Venecia Ámbar' },
      { label: 'Capacidad', value: '250 cc' },
      { label: 'Cierre', value: 'Gatillo mini trigger' },
    ],
  },
  {
    id: 'dispenser-vidrio-bomba',
    name: 'Dispenser de vidrio con bomba',
    category: 'cosmetica',
    alsoIn: ['limpieza'],
    description: 'Frasco de vidrio labrado con válvula dosificadora cromada. Para jabón o crema.',
    image: 'dispenser-vidrio-bomba',
    imageFit: 'cover',
    price: null,
    specs: [
      { label: 'Artículo', value: 'Cosmética' },
      { label: 'Material', value: 'Vidrio labrado' },
      { label: 'Cierre', value: 'Válvula dosificadora cromada' },
    ],
  },
  // Deco Hogar
  {
    id: 'difusor-cubo-110-dorado',
    name: 'Difusor Cubo 110 cc capuchón dorado',
    category: 'deco-hogar',
    description: 'Frasco cubo de vidrio de 110 cc con capuchón dorado para varillas aromáticas.',
    image: 'difusor-cubo-110-dorado',
    imageFit: 'contain',
    price: null,
    specs: [
      { label: 'Artículo', value: 'Deco Hogar' },
      { label: 'Modelo', value: 'Cubo' },
      { label: 'Capacidad', value: '110 cc' },
      { label: 'Material', value: 'Vidrio' },
      { label: 'Cierre', value: 'Capuchón dorado' },
    ],
  },
  {
    id: 'difusor-cubo-plateado',
    name: 'Difusor Cubo capuchón plateado',
    category: 'deco-hogar',
    description: 'Frasco cubo de vidrio con capuchón plateado para varillas aromáticas.',
    image: 'difusor-cubo-plateado',
    imageFit: 'cover',
    price: null,
    specs: [
      { label: 'Artículo', value: 'Deco Hogar' },
      { label: 'Modelo', value: 'Cubo' },
      { label: 'Material', value: 'Vidrio' },
      { label: 'Cierre', value: 'Capuchón plateado' },
    ],
  },
  {
    id: 'boticario-chato-fume',
    name: 'Difusor Boticario Chato 200 cc fumé',
    category: 'deco-hogar',
    description: 'Frasco de vidrio fumé de 200 cc con tapón de corcho, para difusores de varillas.',
    image: 'boticario-chato-fume',
    imageFit: 'contain',
    price: null,
    specs: [
      { label: 'Artículo', value: 'Deco Hogar' },
      { label: 'Modelo', value: 'Boticario Chato' },
      { label: 'Capacidad', value: '200 cc' },
      { label: 'Color', value: 'Fumé' },
      { label: 'Cierre', value: 'Tapón de corcho' },
    ],
  },
  // Laboratorio
  {
    id: 'vasito-medidor-15ml',
    name: 'Vasito medidor posológico 15 ml',
    category: 'laboratorio',
    description: 'Vasito plástico translúcido para dosificar jarabes y líquidos.',
    image: 'vasito-medidor-15ml',
    imageFit: 'contain',
    price: null,
    specs: [
      { label: 'Artículo', value: 'Laboratorio' },
      { label: 'Capacidad', value: '15 ml' },
      { label: 'Uso', value: 'Medidor posológico' },
    ],
  },
  // Varios
  {
    id: 'vaso-cilindrico-vidrio',
    name: 'Vaso cilíndrico de vidrio',
    category: 'varios',
    description: 'Vaso de vidrio cilíndrico en cuatro medidas, de 6 x 10 a 6 x 22.',
    image: 'vasos-cilindricos',
    imageFit: 'cover',
    price: null,
    variants: [
      { id: '6x10', label: '6 x 10', price: null },
      { id: '6x15', label: '6 x 15', price: null },
      { id: '6x20', label: '6 x 20', price: null },
      { id: '6x22', label: '6 x 22', price: null },
    ],
    specs: [
      { label: 'Material', value: 'Vidrio' },
      { label: 'Medidas', value: '6 x 10, 6 x 15, 6 x 20 y 6 x 22' },
    ],
  },
]

export const getProduct = (id) => products.find((p) => p.id === id)
export const getCategory = (id) => categories.find((c) => c.id === id)
export const getCategoryLabel = (id) => getCategory(id)?.label ?? ''

export const isInCategory = (product, id) => product.category === id || Boolean(product.alsoIn?.includes(id))
