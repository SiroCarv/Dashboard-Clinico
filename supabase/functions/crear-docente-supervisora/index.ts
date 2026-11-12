// Crea la cuenta ÚNICA de Docente Supervisora (rol 'docente_supervisora').
// Solo la puede invocar un superadmin. Igual que crear-jefe-centro, el alta
// en Auth necesita la service_role key, que solo existe del lado servidor.
//
// "Única": se revisa acá antes de crear (mensaje claro) y, además, la base
// tiene un índice único parcial (usuarios_una_docente_supervisora) que
// rechaza una segunda fila aunque dos altas lleguen al mismo tiempo — ese
// caso responde 23505 y se explica con el mismo mensaje.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mismo mínimo que la pantalla (LONGITUD_MINIMA_PASSWORD en el frontend).
const LONGITUD_MINIMA_PASSWORD = 8;

const MENSAJE_YA_EXISTE =
  'Ya existe una cuenta de Docente Supervisora. Este rol es único: edita la cuenta existente en vez de crear otra.';

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
      return respuestaError(403, 'Solo un superadministrador puede crear la cuenta de Docente Supervisora.');
    }

    const body = await req.json();
    const nombre = (body?.nombre ?? '').trim();
    const email = (body?.email ?? '').trim().toLowerCase();
    const password = body?.password ?? '';

    if (!nombre || !email || !password) {
      return respuestaError(400, 'Nombre, correo y contraseña temporal son obligatorios.');
    }
    if (password.length < LONGITUD_MINIMA_PASSWORD) {
      return respuestaError(400, `La contraseña temporal debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`);
    }

    // Cliente con service_role para las operaciones privilegiadas
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existente, error: existenteError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('rol', 'docente_supervisora')
      .maybeSingle();

    if (existenteError) {
      return respuestaError(500, 'No se pudo verificar si ya existe una Docente Supervisora.');
    }
    if (existente) {
      return respuestaError(400, MENSAJE_YA_EXISTE);
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
      .insert([{ id: nuevoId, rol: 'docente_supervisora', email, nombre }])
      .select('id, email, nombre, created_at')
      .single();

    if (perfilInsertError) {
      // Compensación: no dejar un usuario de Auth huérfano sin perfil de negocio
      await supabaseAdmin.auth.admin.deleteUser(nuevoId);
      // 23505 = otra operación acaba de crear la cuenta única (índice de la base)
      const esDuplicada = perfilInsertError.code === '23505';
      return respuestaError(
        esDuplicada ? 400 : 500,
        esDuplicada ? MENSAJE_YA_EXISTE : 'No se pudo crear el perfil de la Docente Supervisora. La operación fue revertida.'
      );
    }

    return respuestaOk(perfil);
  } catch (err) {
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});
