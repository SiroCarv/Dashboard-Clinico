// Alta real de cuentas de Psicólogo (Superadmin).
//
// Corre con la service_role key porque crear un usuario de Auth desde el
// cliente con la clave anónima invalidaría la sesión activa del
// superadministrador que está haciendo la operación — por eso esto es
// una Edge Function y no una llamada directa desde psicologosService.js.
//
// Flujo:
//   1. Verifica que quien llama tiene una sesión válida (con el cliente
//      "caller", atado al JWT del Authorization header).
//   2. Verifica que esa sesión pertenece a un superadmin (consultando
//      `usuarios` con el mismo cliente "caller" — respeta RLS, no hace
//      falta service_role todavía para esto).
//   3. Recién ahí usa el cliente "admin" (service_role) para crear el
//      usuario en Auth y su fila en `usuarios`.
//   4. Si el paso 3b (insert en `usuarios`) falla, revierte el paso 3a
//      (borra el usuario de Auth recién creado) para no dejar una cuenta
//      de Auth huérfana sin perfil de negocio.

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
      return respuestaError(403, 'Solo un superadministrador puede crear cuentas de psicólogo.');
    }

    const body = await req.json();
    const nombre = (body?.nombre ?? '').trim();
    const email = (body?.email ?? '').trim().toLowerCase();
    const password = body?.password ?? '';

    if (!nombre || !email || !password) {
      return respuestaError(400, 'Nombre, correo y contraseña temporal son obligatorios.');
    }
    if (password.length < 6) {
      return respuestaError(400, 'La contraseña temporal debe tener al menos 6 caracteres.');
    }

    // Cliente con service_role para las operaciones privilegiadas
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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
      .insert([{ id: nuevoId, rol: 'psicologo', email, nombre }])
      .select('id, email, nombre, created_at')
      .single();

    if (perfilInsertError) {
      // Compensación: no dejar un usuario de Auth huérfano sin perfil de negocio
      await supabaseAdmin.auth.admin.deleteUser(nuevoId);
      return respuestaError(500, 'No se pudo crear el perfil del psicólogo. La operación fue revertida.');
    }

    return respuestaOk(perfil);
  } catch (err) {
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});
