import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from './icons.jsx'
import { site } from '../config/site.js'

// Un enlace "mailto:" no hace nada si la compu no tiene un programa de correo
// configurado (lo más común: se usa Gmail en el navegador). Por eso se ofrece
// elegir dónde escribir, o copiar la dirección.
function emailOptions({ subject = '', body = '' }) {
  const to = site.email
  const q = encodeURIComponent
  return [
    { label: 'Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${q(to)}&su=${q(subject)}&body=${q(body)}`, external: true },
    { label: 'Outlook / Hotmail', href: `https://outlook.live.com/mail/0/deeplink/compose?to=${q(to)}&subject=${q(subject)}&body=${q(body)}`, external: true },
    { label: 'App de correo', href: `mailto:${to}?subject=${q(subject)}&body=${q(body)}` },
  ]
}

// Menú que se abre debajo de quien lo llama (que tiene que estar en un contenedor relative).
export default function EmailMenu({ open, onClose, subject, body, dark = false, align = 'left' }) {
  const ref = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setCopied(false)
    const onPointer = (e) => !ref.current?.parentElement?.contains(e.target) && onClose()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    ref.current?.querySelector('a,button')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      setTimeout(onClose, 1200)
    } catch {
      // Sin permiso para copiar: la dirección queda a la vista en el menú.
    }
  }

  const item = `flex min-h-11 w-full cursor-pointer items-center rounded-lg px-3 text-left text-[15px] font-medium transition-colors ${
    dark ? 'text-on-panel hover:bg-white/10' : 'text-ink hover:bg-black/5'
  }`

  return (
    <div
      ref={ref}
      role="menu"
      className={`absolute top-full z-30 mt-2 w-64 rounded-2xl p-1.5 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.5)] ring-1 ${align === 'right' ? 'right-0' : 'left-0'} ${
        dark ? 'bg-[#1b1b1d] ring-gold/40' : 'bg-white ring-black/10'
      }`}
    >
      <p className={`px-3 pt-2 pb-1 text-[12px] font-semibold ${dark ? 'text-on-panel/55' : 'text-muted'}`}>Escribir a {site.email} desde:</p>
      {emailOptions({ subject, body }).map((option) => (
        <a
          key={option.label}
          role="menuitem"
          href={option.href}
          onClick={onClose}
          {...(option.external && { target: '_blank', rel: 'noopener noreferrer' })}
          className={item}
        >
          {option.label}
        </a>
      ))}
      <button type="button" role="menuitem" onClick={copy} className={`${item} gap-2`}>
        {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
        {copied ? 'Dirección copiada' : 'Copiar dirección'}
      </button>
    </div>
  )
}
