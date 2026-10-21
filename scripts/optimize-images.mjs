// Genera las versiones web (recortadas, nítidas y livianas) a partir de los
// originales de img/. Los originales no se modifican.
// Uso: npm run images
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = (...p) => path.join(root, 'img', ...p)
const out = (...p) => path.join(root, 'public', 'img', ...p)

const WA = 'WhatsApp Image 2026-10-11 at '

// crop = { left, top, width, height } sobre el original; width = ancho final.
// whiten: lleva el fondo casi blanco de la foto a blanco puro, para que en la
// web se funda con el recuadro (mix-blend-multiply).
// Cada foto se exporta en dos anchos (name-480.webp y name-960.webp, salvo que
// se indique `widths`) para que el celular no descargue la versión grande.
// dir: 'productos' u 'instagram' (originales) o 'retocadas' (salida de scripts/retouch.py).
const products = [
  { dir: 'productos', file: `${WA}11.43.23.jpeg`, name: 'potes-ambar-tapa-negra', crop: { left: 0, top: 470, width: 576, height: 350 }, whiten: true },
  { dir: 'retocadas', file: 'botella-venecia.png', name: 'botella-venecia-250-gatillo' },
  { dir: 'productos', file: `${WA}11.43.24.jpeg`, name: 'difusor-cubo-110-dorado', crop: { left: 60, top: 215, width: 480, height: 540 }, whiten: true },
  { dir: 'retocadas', file: 'dispenser-vidrio.png', name: 'dispenser-vidrio-bomba' },
  { dir: 'productos', file: `${WA}11.45.41.jpeg`, name: 'difusor-cubo-plateado', crop: { left: 318, top: 40, width: 320, height: 400 } },
  { dir: 'productos', file: `${WA}11.45.41.jpeg`, name: 'hero-envases', widths: [700, 1400] },
  // Fotos del Instagram de la tienda (recortadas para dejar afuera los textos)
  { dir: 'instagram', file: 'potes-nacar-ovoide.jpg', name: 'potes-nacar-ovoide', crop: { left: 0, top: 160, width: 640, height: 175 }, whiten: true },
  { dir: 'instagram', file: 'vasito-medidor-15ml.jpg', name: 'vasito-medidor-15ml', crop: { left: 40, top: 75, width: 560, height: 480 }, whiten: true },
  { dir: 'instagram', file: 'frasco-pvc-gigante.jpg', name: 'frasco-pvc-gigante', crop: { left: 0, top: 112, width: 581, height: 460 }, whiten: true },
  { dir: 'instagram', file: 'boticario-chato-fume.jpg', name: 'boticario-chato-fume', crop: { left: 0, top: 200, width: 640, height: 440 }, whiten: true },
  { dir: 'instagram', file: 'vasos-cilindricos.jpg', name: 'vasos-cilindricos', crop: { left: 0, top: 30, width: 640, height: 365 } },
  { dir: 'instagram', file: 'frascos-tapa-plastica.jpg', name: 'frascos-tapa-plastica', crop: { left: 0, top: 60, width: 517, height: 415 } },
  { dir: 'instagram', file: 'frascos-gigante-corcho.jpg', name: 'frascos-gigante-corcho', crop: { left: 0, top: 218, width: 512, height: 352 } },
]

// Carrusel de la portada, en 4:5 y a 800 x 1000 (se muestra grande). Las fotos ambientadas salen del Instagram tal
// cual; las de estudio se toman ya recortadas (sin textos) y se centran sobre
// blanco. Va después de buildProducts porque usa sus salidas.
const gallery = [
  { file: src('instagram', 'ambiente-piano.jpg'), name: 'ambiente-piano' },
  { file: out('productos', 'boticario-chato-fume-960.webp'), name: 'boticario-chato-fume', studio: true },
  { file: out('productos', 'frascos-gigante-corcho-960.webp'), name: 'frascos-gigante-corcho' },
  { file: out('productos', 'potes-ambar-tapa-negra-960.webp'), name: 'potes-ambar', studio: true },
  { file: src('instagram', 'ambiente-escritorio.jpg'), name: 'ambiente-escritorio' },
  { file: out('productos', 'frasco-pvc-gigante-960.webp'), name: 'frasco-pvc-gigante', studio: true },
  { file: out('productos', 'difusor-cubo-plateado-960.webp'), name: 'difusor-cubo-plateado' },
  { file: out('productos', 'potes-nacar-ovoide-960.webp'), name: 'potes-nacar-ovoide', studio: true },
  { file: src('instagram', 'ambiente-difusor-tallado.jpg'), name: 'ambiente-difusor-tallado' },
  { file: out('productos', 'botella-venecia-250-gatillo-960.webp'), name: 'botella-venecia', studio: true },
  { file: out('productos', 'frascos-tapa-plastica-960.webp'), name: 'frascos-tapa-plastica' },
  { file: out('productos', 'vasito-medidor-15ml-960.webp'), name: 'vasito-medidor', studio: true },
  { file: out('productos', 'dispenser-vidrio-bomba-960.webp'), name: 'dispenser-vidrio' },
  { file: out('productos', 'difusor-cubo-110-dorado-960.webp'), name: 'difusor-cubo-dorado', studio: true },
  { file: out('productos', 'vasos-cilindricos-960.webp'), name: 'vasos-cilindricos' },
]

async function buildGallery() {
  for (const { file, name, studio } of gallery) {
    const img = studio
      ? sharp(file).resize(704, 880, { fit: 'contain', background: '#ffffff' }).extend({ top: 60, bottom: 60, left: 48, right: 48, background: '#ffffff' })
      : sharp(file).resize(800, 1000, { fit: 'cover', position: 'attention' })
    await img.sharpen({ sigma: 0.6 }).webp({ quality: 78 }).toFile(out('galeria', `${name}.webp`))
  }
  console.log('ok galeria', gallery.length)
}

const DEFAULT_WIDTHS = [480, 960]

async function buildProducts() {
  for (const { dir, file, name, crop, whiten, widths = DEFAULT_WIDTHS } of products) {
    for (const width of widths) {
      let img = sharp(src(dir, file))
      if (crop) img = img.extract(crop)
      if (whiten) img = img.linear(1.07, -6)
      await img
        .resize({ width, kernel: 'lanczos3' })
        .sharpen({ sigma: 0.8 })
        .webp({ quality: 80 })
        .toFile(out('productos', `${name}-${width}.webp`))
    }
    console.log('ok', name)
  }
}

// Logo: sello ovalado sobre fondo blanco. El fondo se vuelve transparente
// según la claridad de cada píxel (sigue el borde real del sello, que no es un
// óvalo perfecto), se amplía con buen filtro y se enfoca, y se exporta en
// varios tamaños para que se vea nítido en pantallas de alta densidad.
const LOGO = { file: 'WhatsApp Image 2026-10-21 at 09.35.57.jpeg', box: { left: 4, top: 1, width: 421, height: 446 } }

async function buildLogo() {
  const scale = 2
  const { data, info } = await sharp(src('logo', LOGO.file))
    .extract(LOGO.box)
    .resize(LOGO.box.width * scale, LOGO.box.height * scale, { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.2 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Blanco del fondo -> transparente; dorado y negro del sello -> opaco.
  const rgba = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const light = Math.min(r, g, b) // el dorado tiene el azul bajo, el blanco no
    rgba[j] = r
    rgba[j + 1] = g
    rgba[j + 2] = b
    rgba[j + 3] = Math.max(0, Math.min(255, Math.round(((242 - light) / 40) * 255)))
  }
  const base = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()

  for (const width of [160, 320, 640]) {
    await sharp(base).resize({ width, kernel: 'lanczos3' }).webp({ quality: 92 }).toFile(out('logo', `sello-${width}.webp`))
  }
  // Íconos de la pestaña y del celular: el sello centrado en un cuadrado transparente.
  const square = async (size) =>
    sharp(base)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
  await (await square(180)).toFile(path.join(root, 'public', 'apple-touch-icon.png'))
  await (await square(64)).toFile(path.join(root, 'public', 'favicon.png'))
  console.log('ok logo')
}

await mkdir(out('logo'), { recursive: true })
await mkdir(out('productos'), { recursive: true })
await mkdir(out('galeria'), { recursive: true })
await buildProducts()
await buildGallery()
await buildLogo()
