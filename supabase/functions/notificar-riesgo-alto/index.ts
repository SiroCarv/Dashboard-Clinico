// supabase/functions/notificar-riesgo-alto/index.ts
//
// Alerta por correo cuando una respuesta llega al NIVEL MÁS ALTO de su
// formulario (ansiedad grave, depresión severa, riesgo suicida alto, etc.;
// el criterio vive en la base, función es_riesgo_alto).
//
// A esta función NO la llama el navegador: la dispara el trigger
// `trg_notificar_riesgo_alto` de `evaluaciones_instrumento` apenas se guarda
// una respuesta marcada como riesgo alto. Por eso no se valida contra una
// sesión de usuario sino contra la service_role key (solo el trigger, vía
// Vault, la tiene) — igual que `notificar-caso-nuevo`.
//
// Destinatarios (sin repetir correos):
//   - el/la psicólogo/a de la institución de la persona
//   - el/la psicólogo/a asignado/a a la persona o revisor de esa respuesta
//   - TODOS los superadministradores (reciben todas las alertas)
// Aplica a estudiantes, casos registrados por docentes y personas
// particulares.
//
// El correo NO lleva contenido clínico (ni formulario, ni resultado): solo
// quién es la persona y un enlace al Dashboard, donde ya hay control de
// acceso. Mismo criterio que `notificar-caso-nuevo`.
//
// Envío por SMTP (Gmail personal) — SOLO PARA PRUEBAS, igual que
// `notificar-caso-nuevo`. Antes de producción real conviene un proveedor
// transaccional; lo único que cambiaría es el bloque de envío marcado abajo.

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

// Los nombres los escriben las propias personas: se escapan antes de ir al HTML.
function escaparHtml(texto: string) {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

type Destinatario = { nombre: string | null; email: string; esSuperadmin: boolean };

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const gmailUser = Deno.env.get('GMAIL_SMTP_USER');
  const gmailAppPassword = Deno.env.get('GMAIL_SMTP_APP_PASSWORD');
  const siteUrl = Deno.env.get('SITE_URL');

  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    return respuestaError(401, 'No autorizado.');
  }

  try {
    const body = await req.json();
    const idPaciente = body?.id_paciente;
    const idEvaluacion = body?.id_evaluacion;

    if (!idPaciente) {
      return respuestaError(400, 'Falta id_paciente.');
    }
    if (!gmailUser || !gmailAppPassword || !siteUrl) {
      return respuestaError(500, 'Configuración incompleta: faltan GMAIL_SMTP_USER, GMAIL_SMTP_APP_PASSWORD o SITE_URL.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: persona, error: errorPersona } = await supabaseAdmin
      .from('usuarios')
      .select('nombre, rol, institucion_id, psicologo_asignado_id, codigo_estudiante, institucion:instituciones(nombre)')
      .eq('id', idPaciente)
      .single();

    if (errorPersona || !persona) {
      return respuestaError(404, 'No se encontró a la persona de la alerta.');
    }

    // Psicólogos a avisar: institución + asignado + revisor de esta respuesta.
    const idsPsicologos = new Set<string>();
    if (persona.psicologo_asignado_id) idsPsicologos.add(persona.psicologo_asignado_id);

    if (persona.institucion_id) {
      const { data: vinculos } = await supabaseAdmin
        .from('psicologo_institucion')
        .select('psicologo_id')
        .eq('institucion_id', persona.institucion_id);
      (vinculos ?? []).forEach((v) => idsPsicologos.add(v.psicologo_id));
    }

    if (idEvaluacion) {
      const { data: evaluacion } = await supabaseAdmin
        .from('evaluaciones_instrumento')
        .select('psicologo_revisor_id')
        .eq('id_evaluacion', idEvaluacion)
        .maybeSingle();
      if (evaluacion?.psicologo_revisor_id) idsPsicologos.add(evaluacion.psicologo_revisor_id);
    }

    const destinatarios = new Map<string, Destinatario>();

    if (idsPsicologos.size > 0) {
      const { data: psicologos } = await supabaseAdmin
        .from('usuarios')
        .select('nombre, email')
        .in('id', [...idsPsicologos])
        .eq('rol', 'psicologo');
      (psicologos ?? []).forEach((p) => {
        if (p.email) destinatarios.set(p.email.toLowerCase(), { nombre: p.nombre, email: p.email, esSuperadmin: false });
      });
    }

    // Los superadministradores reciben TODAS las alertas. Si un correo es a
    // la vez psicólogo y superadmin, queda como superadmin (un solo correo).
    const { data: superadmins } = await supabaseAdmin
      .from('usuarios')
      .select('nombre, email')
      .eq('rol', 'superadmin');
    (superadmins ?? []).forEach((s) => {
      if (s.email) destinatarios.set(s.email.toLowerCase(), { nombre: s.nombre, email: s.email, esSuperadmin: true });
    });

    if (destinatarios.size === 0) {
      return respuestaError(404, 'No hay destinatarios con correo para esta alerta.');
    }

    const nombrePersona = persona.nombre || persona.codigo_estudiante || 'una persona';
    const nombreInstitucion = (persona.institucion as { nombre?: string } | null)?.nombre ?? null;
    const esParticular = persona.rol === 'persona_particular';
    const rutaPsicologo = esParticular
      ? `/dashboard/informe-particular/${idPaciente}`
      : `/dashboard/informe/${idPaciente}`;

    let enviados = 0;
    let fallidos = 0;

    // ---- ÚNICO BLOQUE QUE CAMBIA SI EL DÍA DE MAÑANA SE CAMBIA DE PROVEEDOR ----
    const clienteSmtp = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: { username: gmailUser, password: gmailAppPassword },
      },
    });

    try {
      for (const dest of destinatarios.values()) {
        const enlace = dest.esSuperadmin ? `${siteUrl}/panel-resultados` : `${siteUrl}${rutaPsicologo}`;
        const saludo = dest.nombre || 'Hola';
        const lugar = nombreInstitucion ? ` (${nombreInstitucion})` : '';
        const textoEnlace = dest.esSuperadmin ? 'Ver resultados en el Dashboard' : 'Ver el informe en el Dashboard';

        try {
          await clienteSmtp.send({
            from: gmailUser,
            to: dest.email,
            subject: 'Alerta: una respuesta alcanzó el nivel más alto',
            content: `${saludo},\n\nUna respuesta de ${nombrePersona}${lugar} alcanzó el nivel más alto de alerta de su formulario y requiere revisión.\n\n${textoEnlace}: ${enlace}\n\nEste es un aviso automático del Observatorio de Salud Mental.`,
            html: `
              <p>${escaparHtml(saludo)},</p>
              <p>Una respuesta de <strong>${escaparHtml(nombrePersona)}</strong>${escaparHtml(lugar)} alcanzó el nivel más alto de alerta de su formulario y requiere revisión.</p>
              <p><a href="${enlace}">${textoEnlace}</a></p>
              <p>Este es un aviso automático del Observatorio de Salud Mental.</p>
            `,
          });
          enviados++;
        } catch (errEnvio) {
          // Un correo que falla no debe impedir que los demás se envíen.
          fallidos++;
          console.error('notificar-riesgo-alto: no se pudo enviar a un destinatario', errEnvio);
        }
      }
    } finally {
      await clienteSmtp.close();
    }
    // ---- FIN DEL BLOQUE DE ENVÍO ----

    if (enviados === 0) {
      return respuestaError(502, 'No se pudo enviar ningún correo de alerta.');
    }
    return respuestaOk({ enviados, fallidos });
  } catch (err) {
    console.error('notificar-riesgo-alto: error inesperado', err);
    return respuestaError(500, `Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
  }
});
