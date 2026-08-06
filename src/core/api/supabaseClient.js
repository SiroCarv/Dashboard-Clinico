// Cliente único de Supabase para toda la app. Cualquier módulo que
// necesite hablar con la base de datos, Auth o Edge Functions importa
// este mismo `supabase` — nunca se crea un segundo cliente en ningún
// otro archivo, para no terminar con dos sesiones de Auth corriendo en
// paralelo dentro de la misma pestaña.
//
// Las credenciales vienen de variables de entorno (`.env`, con prefijo
// VITE_ para que Vite las exponga al navegador) y son la clave pública
// "anon": no dan acceso a nada que las políticas RLS de cada tabla no
// permitan explícitamente. Nunca se usa acá la service_role key —esa
// solo existe del lado servidor, dentro de las Edge Functions
// (supabase/functions/).
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
