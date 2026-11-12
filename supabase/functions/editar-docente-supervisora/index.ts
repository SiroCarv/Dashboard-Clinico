// Edita la cuenta ÚNICA de Docente Supervisora: nombre, correo y,
// opcionalmente, una contraseña temporal nueva. Solo la puede invocar un
// superadmin.
//
// Por qué admite cambiar la contraseña (a diferencia de editar-jefe-centro):
// como este rol es único, si algún día cambia la persona a cargo se reutiliza
// la MISMA cuenta (para conservar el historial de calificaciones) y hay que
// poder dejarle una contraseña nueva a quien entra, para que la anterior
// deje de servir. Si `password` no viene, no se toca.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mismo mínimo que la pantalla (LONGITUD_MINIMA_PASSWORD en el frontend).
const LONGITUD_MINIMA_PASSWORD = 8;

function respuestaError(status: number, mensaje: string) {
  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function respuestaOk(data: unknown) {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return respuestaError(401, 'Falta el header de autorización.');
    }

    const supabaseCaller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseCaller.auth.getUser();
    if (userError || !userData?.user) {
      return respuestaError(401, 'Sesión inválida o expirada.');
    }

    const { data: perfilCaller, error: perfilError } = await supabaseCaller
      .from('usuarios')
      .select('rol')
      .eq('id', userData.user.id)
      .single();

    if (perfilError || perfilCaller?.rol !== 'superadmin') {
      return respuestaError(403, 'Solo un superadministrador puede editar la cuenta de Docente Supervisora.');
    }

    const body = await req.json();
    const id = body?.id;
    const nombre = (body?.nombre ?? '').trim();
    const email = (body?.email ?? '').trim().toLowerCase();
    // Vacío o ausente = no cambiar la contraseña.
    const passwordNueva = typeof body?.password === 'string' ? body.password : '';

    if (!id || !nombre || !email) {
      return respuestaError(400, 'Id, nombre y correo son obligatorios.');
    }
    if (passwordNueva && passwordNueva.length < LONGITUD_MINIMA_PASSWORD) {
      return respuestaError(400, `La contraseña nueva debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existente, error: existenteError } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, rol')
      .eq('id', id)
      .single();

    if (existenteError || !existente) {
      return respuestaError(404, 'No se encontró la cuenta de Docente Supervisora.');
    }
    if (existente.rol !== 'docente_supervisora') {
      return respuestaError(400, 'Esta cuenta no corresponde a la Docente Supervisora.');
    }

    // Auth primero: si falla (ej. correo ya en uso), no se toca la tabla.
    const cambiosAuth: { email?: string; password?: string } = {};
    if (email !== existente.email) cambiosAuth.email = email;
    if (passwordNueva) cambiosAuth.password = passwordNueva;

    if (Object.keys(cambiosAuth).length > 0) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, cambiosAuth);
      if (authUpdateError) {
        const mensaje = authUpdateError.message?.toLowerCase().includes('already')
          ? 'Ese correo ya está en uso por otra cuenta.'
          : 'No se pudo actualizar el acceso de la cuenta (correo o contraseña).';
        return respuestaError(400, mensaje);
      }
    }

    const { data: perfilActualizado, error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({ nombre, email })
      .eq('id', id)
      .select('id, email, nombre, created_at')
      .single();

    if (updateError) {
      return respuestaError(500, 'No se pudo actualizar el perfil de la Docente Supervisora.');
    }

    return respuestaOk(perfilActualizado);
  } catch (err) {
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});
