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

// Freno a quien prueba contraseñas: después de 5 intentos fallidos hay que
// esperar 30 s, y la espera se duplica con cada nuevo error (hasta 15 min).
// Supabase además limita los intentos de su lado.
const ATTEMPTS_KEY = 'efzn-admin-intentos'
const FREE_ATTEMPTS = 5

function readAttempts() {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) ?? { fails: 0, until: 0 }
  } catch {
    return { fails: 0, until: 0 }
  }
}

function writeAttempts(value) {
  try {
    if (value) localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(value))
    else localStorage.removeItem(ATTEMPTS_KEY)
  } catch {
    // Sin almacenamiento solo queda el límite de Supabase.
  }
}

function registerFailure() {
  const fails = readAttempts().fails + 1
  const extra = fails - FREE_ATTEMPTS
  const until = extra >= 0 ? Date.now() + Math.min(30_000 * 2 ** extra, 15 * 60_000) : 0
  writeAttempts({ fails, until })
}

const waitText = (ms) => {
  const seconds = Math.ceil(ms / 1000)
  return seconds > 90 ? `${Math.ceil(seconds / 60)} minutos` : `${seconds} segundos`
}

export async function signIn(email, password) {
  if (!email.trim() || !password) throw new Error('Completá el email y la contraseña.')
  const { until } = readAttempts()
  if (until > Date.now()) throw new Error(`Demasiados intentos fallidos. Esperá ${waitText(until - Date.now())} y probá de nuevo.`)
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
    if (error.status === 400) {
      registerFailure()
      throw new Error('El email o la contraseña no son correctos.')
    }
    if (error.status === 429) throw new Error('Demasiados intentos. Esperá unos minutos y probá de nuevo.')
    throw new Error('No pudimos conectarnos. Revisá internet y probá de nuevo.')
  }
  writeAttempts(null)
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
