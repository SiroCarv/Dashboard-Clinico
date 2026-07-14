// Baja (hard delete) de cuentas de Psicólogo (Superadmin)
// el borrado desasigna automáticamente al psicólogo
// de todas sus instituciones antes de eliminarlo (no bloquea pidiendo
// desasignación manual).
//
// Orden de borrado, obligatorio por la cadena de Foreign Keys (todas
// ON DELETE NO ACTION):
//   1) psicologo_institucion (referencia a usuarios.id)
//   2) public.usuarios       (referencia a auth.users.id)
//   3) auth.users            (identidad, vía Admin API)

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
      return respuestaError(403, 'Solo un superadministrador puede eliminar cuentas de psicólogo.');
    }

    const body = await req.json();
    const id = body?.id;
    if (!id) {
      return respuestaError(400, 'Falta el id del psicólogo a eliminar.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existente, error: existenteError } = await supabaseAdmin
      .from('usuarios')
      .select('id, rol')
      .eq('id', id)
      .single();

    if (existenteError || !existente) {
      return respuestaError(404, 'No se encontró la cuenta de psicólogo.');
    }
    if (existente.rol !== 'psicologo') {
      return respuestaError(400, 'Esta cuenta no corresponde a un psicólogo.');
    }

    // 1) Quitar sus asignaciones a instituciones (evita bloqueo de FK en el paso 2)
    const { error: asignacionesError } = await supabaseAdmin
      .from('psicologo_institucion')
      .delete()
      .eq('psicologo_id', id);

    if (asignacionesError) {
      return respuestaError(500, 'No se pudieron quitar las asignaciones a instituciones del psicólogo.');
    }

    // 2) Borrar el perfil de negocio
    const { error: perfilDeleteError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (perfilDeleteError) {
      const mensaje = perfilDeleteError.code === '23503'
        ? 'No se pudo eliminar: existen registros clínicos vinculados a este usuario.'
        : 'No se pudo eliminar el perfil del psicólogo.';
      return respuestaError(500, mensaje);
    }

    // 3) Borrar la identidad de Auth (ya no hay fila en usuarios que lo bloquee)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authDeleteError) {
      return respuestaError(
        500,
        'El perfil se eliminó, pero la cuenta de autenticación no pudo borrarse. Contacta a soporte técnico.'
      );
    }

    return respuestaOk({ id });
  } catch (err) {
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});