// Catálogo. Para sumar un producto: agregar un objeto a `products` y su foto
// optimizada en public/img/productos/ (ver scripts/optimize-images.mjs).
//
// image: nombre base de la foto (sin tamaño ni extensión).
// price: número en pesos, o null para mostrar "Precio a consultar".
// variants: opcional. Cada variante puede tener su propio price.
// specs: características que se muestran en la vista de detalle.
// imageFit: 'cover' (foto ambientada, llena el recuadro) o 'contain' (foto de
// estudio con fondo blanco: se ve entera y el fondo se funde con el recuadro).

export const categories = [
  { id: 'potes', label: 'Potes' },
  { id: 'cosmetica', label: 'Cosmética' },
  { id: 'deco-hogar', label: 'Deco Hogar' },
]

export const products = [
  {
    id: 'pote-toro-ambar',
    name: 'Pote Toro Ámbar',
    category: 'potes',
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
]

export const getProduct = (id) => products.find((p) => p.id === id)
export const getCategoryLabel = (id) => categories.find((c) => c.id === id)?.label ?? ''
