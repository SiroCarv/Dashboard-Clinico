// Lecturas y la única escritura (calificar) del panel de la Docente
// Supervisora. Igual que pacientesService, este archivo nunca filtra "a
// mano" por pasante o institución: las políticas RLS y las funciones de
// resumen de la base (resumen_trabajo_pasantes, resumen_instrumentos_
// pasante, personas_atendidas_pasante) devuelven filas SOLO si quien llama
// es la supervisora, y solo de las cuentas marcadas como pasantes.
//
// Por qué los conteos vienen de funciones de la base y no de sumar en el
// navegador: una institución puede tener cientos de personas con varias
// evaluaciones cada una; traerlas todas solo para contarlas sería lento y
// toparía con el máximo de filas por respuesta (ver leerEnTandas).
//
// Alcance de las cifras: la base asigna una evaluación a la INSTITUCIÓN de
// la persona, no a un psicólogo en particular. Hoy cada institución tiene un
// solo psicólogo/a, así que coincide; si un centro de salud tuviera varias
// pasantes, cada una vería las cifras del centro completo. La excepción
// exacta son los formularios habilitados, que sí guardan quién los habilitó.
import { supabase } from '../../../core/api/supabaseClient';
import { leerEnTandas } from '../../../shared/utils/leerEnTandas';

export const supervisionPasantiasService = {
  /** Una fila por pasante, con sus totales, para la lista del panel. */
  async listarPasantes() {
    const { data, error } = await supabase.rpc('resumen_trabajo_pasantes');
    if (error) throw error;

    return (data ?? []).map((fila) => ({
      id: fila.pasante_id,
      nombre: fila.nombre,
      email: fila.email,
      turno: fila.turno_psicologo,
      instituciones: fila.instituciones,
      totalPersonas: Number(fila.total_personas),
      totalEvaluaciones: Number(fila.total_evaluaciones),
      evaluacionesConAlerta: Number(fila.evaluaciones_con_alerta),
      ultimaEvaluacion: fila.ultima_evaluacion,
      formulariosHabilitados: Number(fila.formularios_habilitados),
      cantidadCalificaciones: Number(fila.cantidad_calificaciones),
      ultimaNota: fila.ultima_nota,
      fechaUltimaNota: fila.fecha_ultima_nota,
    }));
  },

  /**
   * Perfil de UNA pasante y sus instituciones, o `null` si no existe o no
   * está marcada como pasante (la base no deja ver a las demás cuentas, y
   * no se distingue "no existe" de "sin acceso").
   */
  async obtenerPasante(idPasante) {
    const [perfil, asignaciones] = await Promise.all([
      supabase
        .from('usuarios')
        .select('id, nombre, email, turno_psicologo')
        .eq('id', idPasante)
        .eq('rol', 'psicologo')
        .maybeSingle(),
      supabase
        .from('psicologo_institucion')
        .select('institucion:instituciones(id, nombre, tipo_institucion)')
        .eq('psicologo_id', idPasante),
    ]);

    if (perfil.error) throw perfil.error;
    if (asignaciones.error) throw asignaciones.error;
    if (!perfil.data) return null;

    return {
      id: perfil.data.id,
      nombre: perfil.data.nombre,
      email: perfil.data.email,
      turno: perfil.data.turno_psicologo,
      instituciones: (asignaciones.data ?? [])
        .map((a) => a.institucion)
        .filter(Boolean)
        .map((i) => ({ id: i.id, nombre: i.nombre, tipoInstitucion: i.tipo_institucion ?? null })),
    };
  },

  /** Evaluaciones de las instituciones de la pasante, por tipo de formulario. */
  async resumenPorInstrumento(idPasante) {
    const { data, error } = await supabase.rpc('resumen_instrumentos_pasante', {
      p_pasante_id: idPasante,
    });
    if (error) throw error;

    return (data ?? []).map((fila) => ({
      tipoInstrumento: fila.tipo_instrumento,
      totalEvaluaciones: Number(fila.total_evaluaciones),
      evaluacionesConAlerta: Number(fila.evaluaciones_con_alerta),
      ultimaEvaluacion: fila.ultima_evaluacion,
    }));
  },

  /**
   * Personas de las instituciones de la pasante, con cuántas evaluaciones
   * tiene cada una. Se lee por tandas porque un centro puede superar el
   * máximo de filas por respuesta; la función de la base ordena por nombre
   * + id, el orden total estable que exige leerEnTandas.
   */
  async personasAtendidas(idPasante) {
    const filas = await leerEnTandas(
      (desde, hasta) =>
        supabase.rpc('personas_atendidas_pasante', { p_pasante_id: idPasante }).range(desde, hasta),
      { claveUnica: (fila) => fila.persona_id }
    );

    return filas.map((fila) => ({
      id: fila.persona_id,
      nombre: fila.nombre,
      rol: fila.rol,
      institucion: fila.institucion,
      totalEvaluaciones: Number(fila.total_evaluaciones),
      tieneAlerta: Boolean(fila.tiene_alerta),
      ultimaEvaluacion: fila.ultima_evaluacion,
    }));
  },

  /**
   * Formularios cuyo último cambio de estado (habilitar o deshabilitar) lo
   * hizo esta pasante: la base guarda en `habilitado_por` a quien hizo el
   * último cambio, así que es el registro más directo de su trabajo de campo.
   */
  async formulariosHabilitados(idPasante) {
    const { data, error } = await supabase
      .from('formularios_habilitados')
      .select('tipo_instrumento, habilitado, actualizado_en, institucion:instituciones(nombre)')
      .eq('habilitado_por', idPasante)
      .order('actualizado_en', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((fila) => ({
      tipoInstrumento: fila.tipo_instrumento,
      habilitado: fila.habilitado,
      actualizadoEn: fila.actualizado_en,
      institucion: fila.institucion?.nombre ?? null,
    }));
  },

  /** Historial de calificaciones de la pasante, de la más reciente a la más antigua. */
  async calificaciones(idPasante) {
    const { data, error } = await supabase
      .from('calificaciones_pasante')
      .select('id, nota, observacion, fecha_registro')
      .eq('pasante_id', idPasante)
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Registra una calificación nueva. No se envía quién califica: la base lo
   * toma de la sesión (columna con valor por defecto) y la política exige
   * que la pasante esté marcada como tal. Las calificaciones no se editan
   * ni se borran.
   */
  async calificar({ pasanteId, nota, observacion }) {
    const { data, error } = await supabase
      .from('calificaciones_pasante')
      .insert({ pasante_id: pasanteId, nota, observacion })
      .select('id, nota, observacion, fecha_registro')
      .single();

    if (error) throw error;
    return data;
  },
};
