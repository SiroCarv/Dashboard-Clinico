// supabase/functions/notificar-caso-nuevo/index.ts
//
// SCRUM-52 · Alerta al psicólogo por caso nuevo
//
// A este Edge Function NO lo llama el navegador de nadie: lo dispara el
// trigger `trg_notificar_alerta_caso_nuevo` (de la tabla
// `evaluaciones_instrumento`) apenas un docente registra un caso nuevo
// con un psicólogo asignado (SCRUM-51). Por eso la autorización no se
// valida contra una sesión de usuario, sino contra la propia
// service_role key: solo quien la tiene (el trigger, vía Vault) puede
// invocar este endpoint.
//
// Envío por SMTP (Gmail personal) — SOLO PARA PRUEBAS, decisión
// explícita del cliente al implementar esta historia. El "from" queda
// forzado a ser la misma cuenta autenticada, porque Gmail no permite
// suplantar el remitente. Antes de producción real, migrar a un
// proveedor transaccional o a un correo institucional propio: el
// bloque de envío (única sección marcada abajo) es lo único que
// cambiaría.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

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
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const gmailUser = Deno.env.get('GMAIL_SMTP_USER');
  const gmailAppPassword = Deno.env.get('GMAIL_SMTP_APP_PASSWORD');
  const siteUrl = Deno.env.get('SITE_URL');

  // Chequeo de secreto compartido (no hay usuario logueado en este flujo).
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    return respuestaError(401, 'No autorizado.');
  }

  try {
    const body = await req.json();
    const idPaciente = body?.id_paciente;
    const psicologoId = body?.psicologo_id;

    if (!idPaciente || !psicologoId) {
      return respuestaError(400, 'Faltan id_paciente o psicologo_id.');
    }

    if (!gmailUser || !gmailAppPassword || !siteUrl) {
      return respuestaError(500, 'Configuración incompleta: faltan GMAIL_SMTP_USER, GMAIL_SMTP_APP_PASSWORD o SITE_URL.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: psicologo, error: errorPsicologo } = await supabaseAdmin
      .from('usuarios')
      .select('nombre, email')
      .eq('id', psicologoId)
      .eq('rol', 'psicologo')
      .single();

    if (errorPsicologo || !psicologo?.email) {
      return respuestaError(404, 'No se encontró un correo válido para ese psicólogo.');
    }

    const { data: paciente } = await supabaseAdmin
      .from('usuarios')
      .select('nombre')
      .eq('id', idPaciente)
      .single();

    const nombrePsicologo = psicologo.nombre || 'Psicólogo/a';
    const nombreAlumno = paciente?.nombre || 'un alumno';
    // Sin contenido clínico en el correo, a propósito — política del
    // proyecto de no exponer diagnósticos fuera del Dashboard.
    const enlace = `${siteUrl}/dashboard/informe/${idPaciente}`;

    // ---- ÚNICO BLOQUE QUE CAMBIA SI EL DÍA DE MAÑANA SE CAMBIA DE PROVEEDOR ----
    const clienteSmtp = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailAppPassword,
        },
      },
    });

    try {
      await clienteSmtp.send({
        from: gmailUser,
        to: psicologo.email,
        subject: 'Nuevo caso por revisar',
        content: `Hola ${nombrePsicologo},\n\nUn docente acaba de registrar un caso nuevo a nombre de ${nombreAlumno}, asignado a vos para su revisión.\n\nVer el caso: ${enlace}\n\nEste es un aviso automático del Observatorio de Salud Mental.`,
        html: `
          <p>Hola ${nombrePsicologo},</p>
          <p>Un docente acaba de registrar un caso nuevo a nombre de <strong>${nombreAlumno}</strong>, asignado a vos para su revisión.</p>
          <p><a href="${enlace}">Ver el caso en el Dashboard Clínico</a></p>
          <p>Este es un aviso automático del Observatorio de Salud Mental.</p>
        `,
      });
    } finally {
      await clienteSmtp.close();
    }
    // ---- FIN DEL BLOQUE DE ENVÍO ----

    return respuestaOk({ enviado: true });
  } catch (err) {
    console.error('notificar-caso-nuevo: error inesperado', err);
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});
