import { useSyncExternalStore } from 'react'
import { getSupabase, hasSupabase } from './supabase.js'

// Sesión del panel de administración.
// - Con Supabase: entra solo el usuario creado en Supabase (Authentication >
//   Users) y la sesión queda abierta en ese navegador hasta tocar "Salir".
// - MODO DEMO: entra cualquier email y contraseña, hasta cerrar la pestaña.
//
// useSession() devuelve undefined mientras se fija si hay sesión, null si no
// hay, o { email }.

const DEMO_KEY = 'efzn-admin-sesion'
const listeners = new Set()
let session
let started = false

function set(next) {
  session = next
  listeners.forEach((l) => l())
}

function readDemo() {
  try {
    const email = sessionStorage.getItem(DEMO_KEY)
    return email ? { email } : null
  } catch {
    return null
  }
}

// Se arranca recién cuando se abre el panel (la web pública no lo necesita).
function start() {
  if (started) return
  started = true
  if (!hasSupabase) {
    session = readDemo()
    return
  }
  getSupabase().then((supabase) => {
    supabase.auth.getSession().then(({ data }) => set(data.session ? { email: data.session.user.email } : null))
    supabase.auth.onAuthStateChange((_event, current) => {
      const email = current?.user.email
      if (email !== session?.email) set(current ? { email } : null)
    })
  })
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSession() {
  start()
  return useSyncExternalStore(subscribe, () => session)
}

export async function signIn(email, password) {
  if (!email.trim() || !password) throw new Error('Completá el email y la contraseña.')
  if (!hasSupabase) {
    try {
      sessionStorage.setItem(DEMO_KEY, email.trim())
    } catch {
      // Sin almacenamiento la sesión dura lo que dure la página.
    }
    set({ email: email.trim() })
    return
  }
  const supabase = await getSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    throw new Error(
      error.status === 400 ? 'El email o la contraseña no son correctos.' : 'No pudimos conectarnos. Revisá internet y probá de nuevo.',
    )
  }
}

export async function signOut() {
  if (!hasSupabase) {
    try {
      sessionStorage.removeItem(DEMO_KEY)
    } catch {
      // nada que borrar
    }
    set(null)
    return
  }
  const supabase = await getSupabase()
  await supabase.auth.signOut()
  set(null)
}
