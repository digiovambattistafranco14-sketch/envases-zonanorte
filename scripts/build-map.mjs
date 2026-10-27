// Genera public/img/mapa-local.webp: el mapa de la zona del local (Chile 2120,
// Virreyes) armado con mosaicos de OpenStreetMap. Se corre una sola vez (o si
// el local se muda): node scripts/build-map.mjs
// El mapa queda dentro de la web: no depende de Google ni de claves.
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LAT = -34.4664134
const LON = -58.5843309
const ZOOM = 17
const WIDTH = 1200 // px del mapa final (se muestra a la mitad: nítido en pantallas retina)
const HEIGHT = 800
const TILE = 256

// Posición del local en píxeles del mapa mundial a este zoom.
const n = 2 ** ZOOM
const px = ((LON + 180) / 360) * n * TILE
const rad = (LAT * Math.PI) / 180
const py = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n * TILE

const left = Math.round(px - WIDTH / 2)
const top = Math.round(py - HEIGHT / 2)
const firstX = Math.floor(left / TILE)
const firstY = Math.floor(top / TILE)
const lastX = Math.floor((left + WIDTH - 1) / TILE)
const lastY = Math.floor((top + HEIGHT - 1) / TILE)

const tiles = []
for (let x = firstX; x <= lastX; x += 1) {
  for (let y = firstY; y <= lastY; y += 1) {
    const response = await fetch(`https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`, {
      headers: { 'User-Agent': 'EnvasesZonaNorte-web/1.0 (mapa del local, generado una vez)' },
    })
    if (!response.ok) throw new Error(`Mosaico ${x},${y}: ${response.status}`)
    tiles.push({ input: Buffer.from(await response.arrayBuffer()), left: x * TILE - left, top: y * TILE - top })
  }
}

// Los mosaicos de los bordes quedan parcialmente afuera: se arma un lienzo más
// grande y después se recorta.
const pad = TILE
const canvas = sharp({ create: { width: WIDTH + pad * 2, height: HEIGHT + pad * 2, channels: 3, background: '#f2efe9' } })
const composed = await canvas
  .composite(tiles.map((t) => ({ input: t.input, left: t.left + pad, top: t.top + pad })))
  .png()
  .toBuffer()

await sharp(composed)
  .extract({ left: pad, top: pad, width: WIDTH, height: HEIGHT })
  .modulate({ saturation: 0.55 }) // colores más suaves, que combinen con la web
  .webp({ quality: 80 })
  .toFile(path.join(root, 'public', 'img', 'mapa-local.webp'))

console.log(`ok: ${tiles.length} mosaicos, local en el centro (${WIDTH / 2}, ${HEIGHT / 2})`)
