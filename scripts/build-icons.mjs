// Genera src/components/icons.generated.js con los íconos de Phosphor que usa
// el sitio (solo los pesos necesarios), para no cargar la librería completa.
// Para sumar un ícono: agregarlo a ICONS, correr `npm run icons` y exportarlo
// en src/components/icons.jsx.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assets = path.join(root, 'node_modules', '@phosphor-icons', 'core', 'assets')

const ICONS = [
  'arrow-counter-clockwise',
  'arrow-left',
  'arrow-right',
  'arrow-square-out',
  'caret-down',
  'caret-up',
  'chats-circle',
  'check',
  'copy',
  'eye',
  'eye-slash',
  'facebook-logo',
  'image',
  'info',
  'instagram-logo',
  'lock-simple',
  'magnifying-glass',
  'map-pin',
  'minus',
  'package',
  'pencil-simple',
  'plus',
  'seal-check',
  'shopping-cart-simple',
  'sign-out',
  'storefront',
  'trash',
  'upload-simple',
  'warning-circle',
  'whatsapp-logo',
  'x',
]
const WEIGHTS = ['regular', 'bold', 'light']

const entries = []
for (const name of ICONS) {
  for (const weight of WEIGHTS) {
    const file = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`
    const svg = await readFile(path.join(assets, weight, file), 'utf8')
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    entries.push(`  '${name}/${weight}': ${JSON.stringify(inner)},`)
  }
}

const output = `// Archivo generado por scripts/build-icons.mjs. No editar a mano.
// Íconos de Phosphor (https://phosphoricons.com), licencia MIT.
export const ICON_PATHS = {
${entries.join('\n')}
}
`
await writeFile(path.join(root, 'src', 'components', 'icons.generated.js'), output)
console.log(`ok ${ICONS.length} íconos x ${WEIGHTS.length} pesos`)
