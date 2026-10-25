// Edición de cuentas de Jefe/a de Centro de Salud (Superadmin)
// Mismo patrón que editar-psicologo: si el correo cambia, se sincroniza
// primero contra auth.users (admin.updateUserById) para que
// usuarios.email y auth.users.email nunca queden desincronizados.
//
// Además de nombre y correo se puede cambiar el centro de salud. Ese
// cambio pasa por las mismas reglas que el alta (ver crear-jefe-centro):
// el destino debe ser un Centro de Salud y no tener ya otro jefe/a.

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
      return respuestaError(403, 'Solo un superadministrador puede editar cuentas de jefe/a de centro.');
    }

    const body = await req.json();
    const id = body?.id;
    const nombre = (body?.nombre ?? '').trim();
    const email = (body?.email ?? '').trim().toLowerCase();
    const institucionId = body?.institucion_id ?? '';

    if (!id || !nombre || !email || !institucionId) {
      return respuestaError(400, 'Id, nombre, correo y centro de salud son obligatorios.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existente, error: existenteError } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, rol, institucion_id')
      .eq('id', id)
      .single();

    if (existenteError || !existente) {
      return respuestaError(404, 'No se encontró la cuenta de jefe/a de centro.');
    }
    if (existente.rol !== 'jefe_centro') {
      return respuestaError(400, 'Esta cuenta no corresponde a un jefe/a de centro.');
    }

    // Las reglas del centro solo se revisan si el centro cambió: editar
    // solo el nombre o el correo no debe fallar por algo que no se tocó
    // (ej. el centro quedó con otro tipo después de que se creó la cuenta).
    if (institucionId !== existente.institucion_id) {
      const { data: institucion, error: institucionError } = await supabaseAdmin
        .from('instituciones')
        .select('id, tipo_institucion')
        .eq('id', institucionId)
        .maybeSingle();

      if (institucionError || !institucion) {
        return respuestaError(404, 'No se encontró el centro de salud elegido.');
      }
      if (institucion.tipo_institucion !== 'centro_salud') {
        return respuestaError(400, 'El jefe/a solo se puede asignar a una institución de tipo Centro de Salud.');
      }

      const { data: otroJefe, error: otroJefeError } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('rol', 'jefe_centro')
        .eq('institucion_id', institucionId)
        .neq('id', id)
        .maybeSingle();

      if (otroJefeError) {
        return respuestaError(500, 'No se pudo verificar si el centro ya tiene un jefe/a.');
      }
      if (otroJefe) {
        return respuestaError(400, 'Este centro de salud ya tiene un jefe/a asignado/a.');
      }
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
      .update({ nombre, email, institucion_id: institucionId })
      .eq('id', id)
      .select('id, email, nombre, institucion_id, created_at')
      .single();

    if (updateError) {
      // 23505 = otra operación acaba de asignar un jefe/a a ese mismo centro
      // (índice único de la base).
      const mensaje = updateError.code === '23505'
        ? 'Este centro de salud ya tiene un jefe/a asignado/a.'
        : 'No se pudo actualizar el perfil del jefe/a.';
      return respuestaError(updateError.code === '23505' ? 400 : 500, mensaje);
    }

    return respuestaOk(perfilActualizado);
  } catch (err) {
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});
