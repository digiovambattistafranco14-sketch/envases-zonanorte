// Conexión con Supabase (base de datos, fotos y usuario del panel).
// Las claves van en .env.local (en la compu) y en Vercel (en la web publicada):
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
// Esa clave es pública a propósito: lo que cada uno puede hacer lo deciden las
// reglas de la base (supabase/esquema.sql). Sin claves, la web usa el modo demo.

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY)

export const PHOTOS_BUCKET = 'productos'

// La librería de Supabase solo se descarga cuando hace falta (panel de
// administración); la web pública lee el catálogo con un pedido simple.
let clientPromise = null
export function getSupabase() {
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_KEY))
  return clientPromise
}

/** Lectura pública (sin sesión) de una tabla vía la API REST de Supabase. */
export async function restSelect(table, query) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY },
  })
  if (!response.ok) throw new Error(`Supabase ${response.status}`)
  return response.json()
}
