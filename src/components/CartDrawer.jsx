import { useEffect, useRef, useState } from 'react'
import { ShoppingCartSimple, Trash, WhatsappLogo, X } from './icons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../lib/format.js'
import { lockScroll } from '../lib/smoothScroll.js'
import { buildOrderMessage, whatsappUrl } from '../lib/whatsapp.js'
import { productImageUrl } from './ProductImage.jsx'
import QuantityStepper from './QuantityStepper.jsx'

const CUSTOMER_KEY = 'efzn-customer-v1'

function loadCustomer() {
  try {
    return { name: '', phone: '', ...JSON.parse(localStorage.getItem(CUSTOMER_KEY)) }
  } catch {
    return { name: '', phone: '' }
  }
}

function validate({ name, phone }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Ingresá tu nombre.'
  if (phone.replace(/\D/g, '').length < 8) errors.phone = 'Ingresá un teléfono válido, con código de área.'
  return errors
}

function Field({ id, label, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`field-input ${error ? 'ring-2 ring-red-600' : ''}`}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

function CartLine({ line }) {
  const { setQty, removeItem } = useCart()
  return (
    <li className="flex gap-4 py-4">
      <img
        src={productImageUrl(line.product.image)}
        loading="lazy"
        alt=""
        className={`size-20 shrink-0 rounded-xl bg-stage ${
          line.product.imageFit === 'contain' ? 'img-studio p-1' : 'object-cover'
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="leading-snug font-medium">{line.name}</p>
          <button
            type="button"
            onClick={() => removeItem(line.key)}
            aria-label={`Quitar ${line.name}`}
            className="-mt-2 -mr-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:text-ink"
          >
            <Trash size={18} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <QuantityStepper
            value={line.qty}
            onChange={(qty) => setQty(line.key, qty)}
            label={`Cantidad de ${line.name}`}
            size="sm"
          />
          <p className={line.subtotal == null ? 'text-sm text-muted' : 'font-semibold'}>
            {formatPrice(line.subtotal)}
          </p>
        </div>
      </div>
    </li>
  )
}

export default function CartDrawer() {
  const { isOpen, closeCart, lines, count, total, clearCart } = useCart()
  const [customer, setCustomer] = useState(loadCustomer)
  const [errors, setErrors] = useState({})
  const panel = useRef(null)
  const closeButton = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const opener = document.activeElement
    lockScroll(true)
    closeButton.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      lockScroll(false)
      opener?.focus?.()
    }
  }, [isOpen, closeCart])

  const updateField = (field) => (e) => {
    const next = { ...customer, [field]: e.target.value }
    setCustomer(next)
    if (errors[field]) setErrors(validate(next))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(customer)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      panel.current?.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    const clean = { name: customer.name.trim(), phone: customer.phone.trim() }
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(clean))
    } catch {
      // Sin almacenamiento disponible: no se recuerdan los datos.
    }
    const message = buildOrderMessage({ ...clean, lines, total })
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
      inert={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/55 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-titulo"
        className={`absolute inset-y-0 right-0 z-60 flex w-full max-w-md flex-col bg-bg shadow-2xl transition-transform duration-500 ease-out-soft ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="carrito-titulo" className="font-display text-2xl font-medium tracking-tight">
            Tu pedido
            {count > 0 && (
              <span className="ml-2 font-sans text-base font-normal text-muted">
                {count} {count === 1 ? 'unidad' : 'unidades'}
              </span>
            )}
          </h2>
          <button
            ref={closeButton}
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="grid size-11 cursor-pointer place-items-center rounded-full bg-surface ring-1 ring-black/10 transition-shadow duration-200 hover:ring-black/40"
          >
            <X size={18} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-gold/15 text-gold-ink">
              <ShoppingCartSimple size={28} />
            </span>
            <p className="mt-5 text-lg font-semibold">Tu carrito está vacío</p>
            <p className="mt-2 max-w-[32ch] text-muted">
              Sumá productos desde el catálogo para armar tu pedido.
            </p>
            <a href="#catalogo" onClick={closeCart} className="btn btn-primary mt-6">
              Ver catálogo
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5">
              <ul className="divide-y divide-line">
                {lines.map((line) => (
                  <CartLine key={line.key} line={line} />
                ))}
              </ul>
              <button
                type="button"
                onClick={clearCart}
                className="mb-4 min-h-10 cursor-pointer text-sm text-muted underline underline-offset-4 hover:text-ink"
              >
                Vaciar carrito
              </button>

              <fieldset className="flex flex-col gap-4 border-t border-line py-5">
                <legend className="sr-only">Tus datos</legend>
                <p className="font-semibold">Tus datos</p>
                <Field
                  id="pedido-nombre"
                  label="Nombre"
                  type="text"
                  autoComplete="name"
                  value={customer.name}
                  onChange={updateField('name')}
                  error={errors.name}
                />
                <Field
                  id="pedido-telefono"
                  label="Teléfono de contacto"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="11 2345-6789"
                  value={customer.phone}
                  onChange={updateField('phone')}
                  error={errors.phone}
                />
              </fieldset>
            </div>

            <div className="border-t border-line bg-surface px-5 pt-4 pb-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-muted">Total estimado</p>
                <p className="text-xl font-semibold">{total == null ? 'A consultar' : formatPrice(total)}</p>
              </div>
              {total == null && (
                <p className="mt-1 text-sm text-muted">
                  Te confirmamos el precio por WhatsApp al recibir tu pedido.
                </p>
              )}
              <button type="submit" className="btn btn-primary mt-4 w-full">
                <WhatsappLogo size={20} weight="bold" />
                Enviar pedido por WhatsApp
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  )
}
