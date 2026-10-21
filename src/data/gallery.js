// Fotos de los carruseles del inicio (public/img/galeria/, ver
// scripts/optimize-images.mjs). product: id del producto al que lleva el clic.
const photo = (name, alt, product) => ({ src: `/img/galeria/${name}.webp`, alt, product })

export const galleryTop = [
  photo('ambiente-piano', 'Difusor de vidrio tallado sobre un piano'),
  photo('boticario-chato-fume', 'Difusor Boticario Chato fumé con tapón de corcho', 'boticario-chato-fume'),
  photo('frascos-gigante-corcho', 'Frascos gigantes con tapa de corcho', 'frasco-gigante-corcho'),
  photo('potes-ambar', 'Potes ámbar con tapa negra en cuatro tamaños', 'pote-toro-ambar'),
  photo('ambiente-escritorio', 'Difusor de varillas en un escritorio'),
  photo('frasco-pvc-gigante', 'Frascos de PVC con tapa blanca', 'frasco-pvc-gigante'),
  photo('difusor-cubo-plateado', 'Difusor cubo con capuchón plateado', 'difusor-cubo-plateado'),
  photo('potes-nacar-ovoide', 'Potes color nácar en cuatro tamaños', 'pote-nacar-ovoide'),
]

export const galleryBottom = [
  photo('ambiente-difusor-tallado', 'Difusor de vidrio tallado con varillas'),
  photo('botella-venecia', 'Botella negra con gatillo', 'botella-venecia-250-gatillo'),
  photo('frascos-tapa-plastica', 'Frascos de vidrio con tapa plástica', 'frasco-tapa-plastica'),
  photo('vasito-medidor', 'Vasito medidor posológico de 15 ml', 'vasito-medidor-15ml'),
  photo('dispenser-vidrio', 'Dispenser de vidrio con bomba', 'dispenser-vidrio-bomba'),
  photo('difusor-cubo-dorado', 'Difusor cubo con capuchón dorado', 'difusor-cubo-110-dorado'),
  photo('vasos-cilindricos', 'Vasos cilíndricos de vidrio', 'vaso-cilindrico-vidrio'),
]
