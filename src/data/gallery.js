// Fotos iniciales del carrusel de la portada (public/img/galeria/, ver
// scripts/optimize-images.mjs). Se cambian desde el panel (#/admin/carrusel);
// estas se usan hasta que se guarde el carrusel por primera vez.
// product: id del producto al que lleva el clic.
const photo = (name, product = null) => ({ src: `/img/galeria/${name}.webp`, product })

export const carouselPhotos = [
  photo('ambiente-piano'),
  photo('boticario-chato-fume', 'boticario-chato-fume'),
  photo('frascos-gigante-corcho', 'frasco-gigante-corcho'),
  photo('potes-ambar', 'pote-toro-ambar'),
  photo('ambiente-escritorio'),
  photo('frasco-pvc-gigante', 'frasco-pvc-gigante'),
  photo('difusor-cubo-plateado', 'difusor-cubo-plateado'),
  photo('potes-nacar-ovoide', 'pote-nacar-ovoide'),
  photo('ambiente-difusor-tallado'),
  photo('botella-venecia', 'botella-venecia-250-gatillo'),
  photo('frascos-tapa-plastica', 'frasco-tapa-plastica'),
  photo('vasito-medidor', 'vasito-medidor-15ml'),
  photo('dispenser-vidrio', 'dispenser-vidrio-bomba'),
  photo('difusor-cubo-dorado', 'difusor-cubo-110-dorado'),
  photo('vasos-cilindricos', 'vaso-cilindrico-vidrio'),
]
