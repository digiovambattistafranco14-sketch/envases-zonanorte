import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Check, WarningCircle, X } from '../../components/icons.jsx'

// Piezas chicas que comparten las pantallas del panel.

/** Interruptor encendido/apagado. */
export function Switch({ checked, onChange, label, size = 'md', disabled = false }) {
  const big = size === 'lg'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onChange(!checked)
      }}
      className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-out-soft disabled:cursor-wait disabled:opacity-60 ${
        big ? 'h-8 w-14' : 'h-7 w-12'
      } ${checked ? 'bg-[#1f9d55]' : 'bg-[#c4c5cc]'}`}
    >
      <span
        className={`absolute top-1 left-1 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-out-soft ${
          big ? 'size-6' : 'size-5'
        } ${checked ? (big ? 'translate-x-6' : 'translate-x-5') : ''}`}
      />
    </button>
  )
}

/** Selector de dos o más opciones en una pastilla (Todos / Publicados / Ocultos). */
export function Segmented({ value, onChange, options, label, stretch = false }) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex gap-1 rounded-xl bg-[#eceef1] p-1 ring-1 ring-black/[0.05] ${stretch ? 'w-full' : ''}`}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold whitespace-nowrap transition-all duration-200 ${
              stretch ? 'flex-1' : ''
            } ${active ? 'bg-white text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]' : 'text-muted hover:text-ink'}`}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** Caja de confirmación (borrar, salir sin guardar...). */
export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel = 'Cancelar', danger = false, onConfirm, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => event.target === ref.current && onCancel()}
      data-lenis-prevent
      className="admin-dialog m-auto w-[min(28rem,calc(100vw-2rem))] rounded-3xl bg-white p-0 text-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.5)]"
    >
      <div className="p-6 sm:p-7">
        <span className={`grid size-12 place-items-center rounded-full ${danger ? 'bg-[#fdecec] text-[#c0392b]' : 'bg-[#f6efdc] text-gold-ink'}`}>
          <WarningCircle size={26} />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-2 text-[15px] leading-relaxed text-muted">{children}</div>
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn btn-outline min-h-11 normal-case tracking-normal text-[15px]">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`btn min-h-11 normal-case tracking-normal text-[15px] ${danger ? 'bg-[#c0392b] text-white hover:bg-[#a93226]' : 'btn-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

/* ---------- Avisos ("Producto guardado") ---------- */

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

/** Ejecuta una acción del panel y, si falla (sin conexión, sin permiso), lo avisa. */
export function useAction() {
  const toast = useToast()
  return useCallback(
    async (action) => {
      try {
        await action()
      } catch (err) {
        toast(err?.message || 'Algo salió mal. Probá de nuevo.', { tone: 'error' })
      }
    },
    [toast],
  )
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const show = useCallback((message, { tone = 'ok', action } = {}) => {
    clearTimeout(timer.current)
    setToast({ message, tone, action, id: Date.now() })
    timer.current = setTimeout(() => setToast(null), 4200)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4 sm:top-24">
        {toast && (
          <div
            key={toast.id}
            className="toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-panel py-3 pr-3 pl-4 text-on-panel shadow-[0_24px_48px_-20px_rgb(0_0_0/0.6)]"
          >
            <span className={`grid size-7 shrink-0 place-items-center rounded-full ${toast.tone === 'error' ? 'bg-[#c0392b]' : 'bg-[#1f9d55]'}`}>
              {toast.tone === 'error' ? <X size={14} weight="bold" /> : <Check size={14} weight="bold" />}
            </span>
            <p className="text-[15px] font-medium">{toast.message}</p>
            {toast.action && (
              <a
                href={toast.action.href}
                target={toast.action.external ? '_blank' : undefined}
                rel={toast.action.external ? 'noopener noreferrer' : undefined}
                className="ml-1 shrink-0 rounded-lg px-3 py-1.5 text-[14px] font-semibold text-gold-light hover:bg-white/10"
              >
                {toast.action.label}
              </a>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Cerrar aviso"
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-on-panel-muted hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

/** Tarjeta de sección del formulario, con número de paso. */
export function FormSection({ step, title, hint, children, id }) {
  return (
    <section id={id} className="rounded-3xl bg-white p-5 ring-1 ring-black/[0.06] sm:p-7">
      <header className="flex items-start gap-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-bold text-white">{step}</span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
          {hint && <p className="mt-1 text-[14px] leading-relaxed text-muted">{hint}</p>}
        </div>
      </header>
      <div className="mt-6">{children}</div>
    </section>
  )
}

/** Etiqueta + campo + mensaje de error. */
export function Field({ label, htmlFor, required = false, error, hint, children, aside }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[15px] font-semibold">
          {label}
          {required && <span className="ml-1 text-[#c0392b]">*</span>}
        </label>
        {aside}
      </div>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-[14px] font-medium text-[#c0392b]">
          <WarningCircle size={16} weight="bold" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-2 text-[13px] text-muted">{hint}</p>
      )}
    </div>
  )
}
