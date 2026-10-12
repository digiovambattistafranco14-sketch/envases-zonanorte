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
// dir: 'productos' (original) o 'retocadas' (salida de scripts/retouch.py).
const products = [
  { dir: 'productos', file: `${WA}11.43.23.jpeg`, name: 'potes-ambar-tapa-negra', crop: { left: 0, top: 470, width: 576, height: 350 }, whiten: true },
  { dir: 'retocadas', file: 'botella-venecia.png', name: 'botella-venecia-250-gatillo' },
  { dir: 'productos', file: `${WA}11.43.24.jpeg`, name: 'difusor-cubo-110-dorado', crop: { left: 60, top: 215, width: 480, height: 540 }, whiten: true },
  { dir: 'retocadas', file: 'dispenser-vidrio.png', name: 'dispenser-vidrio-bomba' },
  { dir: 'productos', file: `${WA}11.45.41.jpeg`, name: 'difusor-cubo-plateado', crop: { left: 318, top: 40, width: 320, height: 400 } },
  { dir: 'productos', file: `${WA}11.45.41.jpeg`, name: 'hero-envases', widths: [700, 1400] },
]

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

// El logo original es un JPEG cuadrado con el sello cortado en los bordes.
// Se enmascara en círculo (fondo transparente), se enfoca y se exporta en
// varios tamaños para que se vea nítido en pantallas de alta densidad.
async function buildLogo() {
  const size = 640
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}"/></svg>`
  )
  const base = await sharp(src('logo', 'logo.jfif'))
    .resize(size, size)
    .sharpen({ sigma: 1.1 })
    .modulate({ saturation: 1.08 })
    .linear(1.06, -6)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  for (const w of [96, 192, 512]) {
    await sharp(base).resize(w, w, { kernel: 'lanczos3' }).webp({ quality: 92 }).toFile(out('logo', `logo-${w}.webp`))
  }
  await sharp(base).resize(180, 180).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'))
  await sharp(base).resize(64, 64).png().toFile(path.join(root, 'public', 'favicon.png'))
  console.log('ok logo')
}

await mkdir(out('logo'), { recursive: true })
await mkdir(out('productos'), { recursive: true })
await buildProducts()
await buildLogo()
