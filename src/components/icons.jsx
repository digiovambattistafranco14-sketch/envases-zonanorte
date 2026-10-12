import { ICON_PATHS } from './icons.generated.js'

// Íconos de Phosphor con la misma interfaz que su librería de React
// (size, weight, className), pero incluyendo solo los que usa el sitio.
function createIcon(name) {
  function Icon({ size = 24, weight = 'regular', className, ...rest }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden="true"
        className={className}
        dangerouslySetInnerHTML={{ __html: ICON_PATHS[`${name}/${weight}`] ?? ICON_PATHS[`${name}/regular`] }}
        {...rest}
      />
    )
  }
  Icon.displayName = name
  return Icon
}

export const ArrowLeft = createIcon('arrow-left')
export const ArrowRight = createIcon('arrow-right')
export const ChatsCircle = createIcon('chats-circle')
export const Check = createIcon('check')
export const FacebookLogo = createIcon('facebook-logo')
export const InstagramLogo = createIcon('instagram-logo')
export const MagnifyingGlass = createIcon('magnifying-glass')
export const MapPin = createIcon('map-pin')
export const Minus = createIcon('minus')
export const Package = createIcon('package')
export const Plus = createIcon('plus')
export const SealCheck = createIcon('seal-check')
export const ShoppingCartSimple = createIcon('shopping-cart-simple')
export const Trash = createIcon('trash')
export const WhatsappLogo = createIcon('whatsapp-logo')
export const X = createIcon('x')
