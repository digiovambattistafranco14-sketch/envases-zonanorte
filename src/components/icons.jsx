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

export const ArrowCounterClockwise = createIcon('arrow-counter-clockwise')
export const ArrowLeft = createIcon('arrow-left')
export const ArrowRight = createIcon('arrow-right')
export const ArrowSquareOut = createIcon('arrow-square-out')
export const CaretDown = createIcon('caret-down')
export const CaretUp = createIcon('caret-up')
export const ChatsCircle = createIcon('chats-circle')
export const Check = createIcon('check')
export const Copy = createIcon('copy')
export const Eye = createIcon('eye')
export const EyeSlash = createIcon('eye-slash')
export const FacebookLogo = createIcon('facebook-logo')
export const Image = createIcon('image')
export const Info = createIcon('info')
export const InstagramLogo = createIcon('instagram-logo')
export const LockSimple = createIcon('lock-simple')
export const MagnifyingGlass = createIcon('magnifying-glass')
export const MapPin = createIcon('map-pin')
export const Minus = createIcon('minus')
export const Package = createIcon('package')
export const PencilSimple = createIcon('pencil-simple')
export const Plus = createIcon('plus')
export const SealCheck = createIcon('seal-check')
export const ShoppingCartSimple = createIcon('shopping-cart-simple')
export const SignOut = createIcon('sign-out')
export const Storefront = createIcon('storefront')
export const Trash = createIcon('trash')
export const UploadSimple = createIcon('upload-simple')
export const WarningCircle = createIcon('warning-circle')
export const WhatsappLogo = createIcon('whatsapp-logo')
export const X = createIcon('x')
export const Star = createIcon('star')
export const CaretLeft = createIcon('caret-left')
export const CaretRight = createIcon('caret-right')
export const Images = createIcon('images')
export const MagnifyingGlassPlus = createIcon('magnifying-glass-plus')
export const Truck = createIcon('truck')
export const Flame = createIcon('flame')
