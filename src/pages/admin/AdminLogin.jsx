import { useState } from 'react'
import { ArrowLeft, Info, LockSimple } from '../../components/icons.jsx'
import LogoSeal from '../../components/LogoSeal.jsx'
import { signIn } from '../../lib/adminAuth.js'
import { DEMO_MODE } from '../../lib/catalog.js'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="glow-dark flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[26rem]">
        <div className="rounded-[28px] bg-white p-7 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.8)] sm:p-9">
          <LogoSeal eager sizes="96px" className="mx-auto h-24 w-auto" alt="" />
          <h1 className="mt-6 text-center font-display text-[2rem] leading-tight font-medium tracking-tight">Panel de administración</h1>
          <p className="mt-2 text-center text-[15px] text-balance text-muted">Entrá para cargar y editar los productos de la web.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="admin-email" className="text-[15px] font-semibold">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input mt-2"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="text-[15px] font-semibold">
                Contraseña
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input mt-2"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-3 text-[14px] font-medium text-[#a93226]">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
              <LockSimple size={17} weight="bold" />
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          {DEMO_MODE && (
            <p className="mt-6 flex gap-2.5 rounded-xl bg-[#f6efdc] px-4 py-3 text-[13px] leading-relaxed text-gold-ink">
              <Info size={18} weight="bold" className="mt-px shrink-0" />
              Modo demo: entrás con cualquier email y contraseña. Al conectar Supabase solo va a poder entrar el dueño.
            </p>
          )}
        </div>

        <a
          href="#inicio"
          className="mt-6 flex items-center justify-center gap-2 text-[14px] font-semibold text-on-panel-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={15} weight="bold" />
          Volver a la web
        </a>
      </div>
    </div>
  )
}
