// Edición de cuentas de Psicólogo (Superadmin)
// Si el correo cambia, se sincroniza primero contra auth.users vía
// admin.updateUserById para que usuarios.email y auth.users.email nunca
// queden desincronizados (la causa raíz del bug de "email en blanco"

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      return respuestaError(403, 'Solo un superadministrador puede editar cuentas de psicólogo.');
    }

    const body = await req.json();
    const id = body?.id;
    const nombre = (body?.nombre ?? '').trim();
    const email = (body?.email ?? '').trim().toLowerCase();

    if (!id || !nombre || !email) {
      return respuestaError(400, 'Id, nombre y correo son obligatorios.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existente, error: existenteError } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, rol')
      .eq('id', id)
      .single();

    if (existenteError || !existente) {
      return respuestaError(404, 'No se encontró la cuenta de psicólogo.');
    }
    if (existente.rol !== 'psicologo') {
      return respuestaError(400, 'Esta cuenta no corresponde a un psicólogo.');
    }

    // Si el correo cambió, sincronizar primero con Auth; si falla, no se toca la tabla
    if (email !== existente.email) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, { email });
      if (authUpdateError) {
        const mensaje = authUpdateError.message?.toLowerCase().includes('already')
          ? 'Ese correo ya está en uso por otra cuenta.'
          : 'No se pudo actualizar el correo de autenticación.';
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
      return respuestaError(500, 'No se pudo actualizar el perfil del psicólogo.');
    }

    return respuestaOk(perfilActualizado);
  } catch (err) {
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});