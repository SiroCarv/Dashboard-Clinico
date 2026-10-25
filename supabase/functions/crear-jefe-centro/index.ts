// Alta real de cuentas de Jefe/a de Centro de Salud (Superadmin)
// Se ejecuta con la service_role key por el mismo motivo que
// crear-psicologo: crear un usuario de Auth desde el cliente con la clave
// anónima invalidaría la sesión activa del superadministrador.
//
// Reglas propias de este rol (se validan acá y no en el navegador, porque
// el navegador se puede saltear):
//   - solo se puede asignar a una institución de tipo Centro de Salud;
//   - cada centro tiene un solo jefe/a (si más adelante se permiten
//     varios, basta quitar el chequeo de abajo y el índice único
//     `usuarios_un_jefe_por_centro` de la base).

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

    // Cliente atado a la identidad de quien llama (para verificar sesión y rol)
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
      return respuestaError(403, 'Solo un superadministrador puede crear cuentas de jefe/a de centro.');
    }

    const body = await req.json();
    const nombre = (body?.nombre ?? '').trim();
    const email = (body?.email ?? '').trim().toLowerCase();
    const password = body?.password ?? '';
    const institucionId = body?.institucion_id ?? '';

    if (!nombre || !email || !password || !institucionId) {
      return respuestaError(400, 'Nombre, correo, contraseña temporal y centro de salud son obligatorios.');
    }
    if (password.length < 6) {
      return respuestaError(400, 'La contraseña temporal debe tener al menos 6 caracteres.');
    }

    // Cliente con service_role para las operaciones privilegiadas
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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

    const { data: jefeExistente, error: jefeExistenteError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('rol', 'jefe_centro')
      .eq('institucion_id', institucionId)
      .maybeSingle();

    if (jefeExistenteError) {
      return respuestaError(500, 'No se pudo verificar si el centro ya tiene un jefe/a.');
    }
    if (jefeExistente) {
      return respuestaError(400, 'Este centro de salud ya tiene un jefe/a asignado/a.');
    }

    const { data: nuevoUsuario, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !nuevoUsuario?.user) {
      const mensaje = authError?.message?.toLowerCase().includes('already')
        ? 'Este correo ya está registrado.'
        : 'No se pudo crear la cuenta de autenticación.';
      return respuestaError(400, mensaje);
    }

    const nuevoId = nuevoUsuario.user.id;

    const { data: perfil, error: perfilInsertError } = await supabaseAdmin
      .from('usuarios')
      .insert([{ id: nuevoId, rol: 'jefe_centro', email, nombre, institucion_id: institucionId }])
      .select('id, email, nombre, institucion_id, created_at')
      .single();

    if (perfilInsertError) {
      // Compensación: no dejar un usuario de Auth huérfano sin perfil de negocio
      await supabaseAdmin.auth.admin.deleteUser(nuevoId);
      // 23505 = otra operación acaba de asignar un jefe/a a este mismo centro
      // (índice único de la base): se explica igual que el chequeo de arriba.
      const mensaje = perfilInsertError.code === '23505'
        ? 'Este centro de salud ya tiene un jefe/a asignado/a.'
        : 'No se pudo crear el perfil del jefe/a. La operación fue revertida.';
      return respuestaError(perfilInsertError.code === '23505' ? 400 : 500, mensaje);
    }

    return respuestaOk(perfil);
  } catch (err) {
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});
