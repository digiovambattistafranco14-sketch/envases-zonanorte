import { useEffect, useState } from 'react'
import { ArrowCounterClockwise, ArrowSquareOut, Info, Package, SignOut } from '../../components/icons.jsx'
import LogoSeal from '../../components/LogoSeal.jsx'
import { site } from '../../config/site.js'
import { signOut, useSession } from '../../lib/adminAuth.js'
import { DEMO_MODE, loadAdminCatalog, resetCatalog } from '../../lib/catalog.js'
import { adminHref } from '../../lib/router.js'
import AdminLogin from './AdminLogin.jsx'
import ProductEditor from './ProductEditor.jsx'
import ProductList from './ProductList.jsx'
import { ConfirmDialog, ToastProvider, useToast } from './ui.jsx'

function TopBar({ email }) {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 rounded-2xl bg-panel pr-2 pl-3 text-on-panel shadow-[0_18px_40px_-24px_rgb(0_0_0/0.7)] sm:pr-3 sm:pl-4">
        <a href={adminHref.list} className="flex min-w-0 items-center gap-3">
          <LogoSeal eager sizes="48px" className="h-11 w-auto shrink-0" alt="" />
          <span className="min-w-0 leading-tight">
            <span className="block text-[11px] font-bold tracking-[0.2em] text-gold-light uppercase">Panel</span>
            <span className="block truncate text-[15px] font-semibold max-sm:hidden">{site.fullName}</span>
            <span className="block truncate text-[15px] font-semibold sm:hidden">Productos</span>
          </span>
        </a>

        <nav className="ml-auto flex items-center gap-1">
          <a
            href={adminHref.list}
            className="hidden min-h-10 items-center gap-2 rounded-xl px-3.5 text-[14px] font-semibold text-on-panel hover:bg-white/10 md:inline-flex"
          >
            <Package size={18} />
            Productos
          </a>
          <a
            href="#inicio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-[14px] font-semibold text-on-panel hover:bg-white/10"
          >
            <ArrowSquareOut size={18} />
            <span className="max-sm:hidden">Ver la web</span>
          </a>
          <span className="mx-1 hidden h-6 w-px bg-white/15 sm:block" />
          <button
            type="button"
            onClick={signOut}
            title={email}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-[14px] font-semibold text-on-panel-muted hover:bg-white/10 hover:text-white"
          >
            <SignOut size={18} />
            <span className="max-sm:hidden">Salir</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

function DemoBanner() {
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="mx-auto mt-4 max-w-6xl">
      <div className="flex flex-col gap-3 rounded-2xl bg-[#f6efdc] px-4 py-3 text-[14px] text-gold-ink ring-1 ring-[#e8d9ae] sm:flex-row sm:items-center">
        <p className="flex gap-2.5 leading-relaxed">
          <Info size={18} weight="bold" className="mt-0.5 shrink-0" />
          <span>
            <strong className="font-semibold">Modo demo.</strong> Los cambios se guardan solo en este navegador. Cuando conectemos la base de datos los va a ver
            todo el mundo.
          </span>
        </p>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 self-start rounded-lg px-3 font-semibold ring-1 ring-current/25 hover:bg-white/60 sm:ml-auto sm:self-auto"
        >
          <ArrowCounterClockwise size={16} weight="bold" />
          Restaurar catálogo original
        </button>
      </div>

      <ConfirmDialog
        open={confirming}
        title="¿Restaurar el catálogo original?"
        confirmLabel="Sí, restaurar"
        danger
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          setConfirming(false)
          await resetCatalog()
          toast('Catálogo restaurado')
        }}
      >
        Se borran los productos que cargaste en esta prueba y vuelven los de la web.
      </ConfirmDialog>
    </div>
  )
}

function Loading({ children = 'Cargando…' }) {
  return (
    <div className="grid min-h-[50vh] place-items-center text-[15px] font-semibold text-muted">
      <span className="flex items-center gap-2.5">
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {children}
      </span>
    </div>
  )
}

export default function AdminApp({ route }) {
  const session = useSession()
  const email = session?.email
  // Con Supabase el panel trae todos los productos (también los ocultos) al entrar.
  const [catalog, setCatalog] = useState({ email: null, error: '' })
  const ready = DEMO_MODE || catalog.email === email

  useEffect(() => {
    document.title = `Panel | ${site.fullName}`
  }, [])

  useEffect(() => {
    if (!email || DEMO_MODE) return
    let cancelled = false
    loadAdminCatalog()
      .then(() => !cancelled && setCatalog({ email, error: '' }))
      .catch((err) => !cancelled && setCatalog({ email: null, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [email])

  if (session === undefined) return <Loading />
  if (!session) return <AdminLogin />

  let content
  if (catalog.error && !ready) content = <p className="rounded-2xl bg-[#fdecec] px-5 py-4 font-medium text-[#a93226]">{catalog.error}</p>
  else if (!ready) content = <Loading>Cargando productos…</Loading>
  else if (route.view === 'list') content = <ProductList />
  // key: al pasar de un producto a otro el formulario arranca de cero.
  else content = <ProductEditor key={route.productId ?? 'nuevo'} productId={route.productId} />

  return (
    <ToastProvider>
      <div className="min-h-dvh pb-16">
        <TopBar email={session.email} />
        <div className="px-3 sm:px-5">
          {DEMO_MODE && <DemoBanner />}
          <main className="mx-auto max-w-6xl pt-8 sm:pt-10">{content}</main>
        </div>
      </div>
    </ToastProvider>
  )
}
