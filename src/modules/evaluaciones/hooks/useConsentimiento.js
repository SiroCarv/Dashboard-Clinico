// Orquesta TODO el flujo de consentimiento/asentimiento antes de dejar a
// un paciente ver el formulario de instrumentos. Es el "cerebro" que
// consume Encuesta.jsx para decidir qué pantalla mostrar:
//
//   1. faltaFechaNacimiento -> CapturaFechaNacimiento.jsx
//   2. documentoRechazado   -> ConsentimientoDenegado.jsx
//   3. documentoPendiente   -> DocumentoConsentimiento.jsx (puede
//      encadenar dos documentos seguidos si es menor: primero el del
//      tutor, después el asentimiento propio)
//   4. consentimientoCompleto -> recién ahí Encuesta.jsx muestra
//      FormularioInstrumento.jsx
//
// La edad se calcula en el cliente a partir de fecha_nacimiento (nunca se
// pide "tu edad" directo, para no depender de que la persona la escriba
// bien). El corte de rama (menor/mayor) usa EDAD_CORTE_AUTOCONSENTIMIENTO
// de textosConsentimiento.js.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../core/api/supabaseClient';
import { consentimientoService } from '../services/consentimientoService';
import {
  ASENTIMIENTO_MENOR,
  CONSENTIMIENTO_PROPIO_MAYOR,
  CONSENTIMIENTO_TUTOR_MENOR,
  EDAD_CORTE_AUTOCONSENTIMIENTO,
  TIPO_CONSENTIMIENTO,
} from '../data/textosConsentimiento';

// Versión del texto legal que se guarda junto a cada decisión, para
// poder auditar más adelante bajo qué redacción exacta consintió cada
// persona si el documento llega a cambiar.
const VERSION_DOCUMENTO = 'v1-julio-2026';

function calcularEdad(fechaNacimientoISO) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimientoISO);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumpleEsteAnio =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumpleEsteAnio) edad -= 1;
  return edad;
}

// Decide qué documentos hacen falta según la rama de edad (ver nota de
// diseño en textosConsentimiento.js sobre el corte 11-17 / 18+).
function documentosDeLaRama(rama) {
  if (rama === 'mayor') return [CONSENTIMIENTO_PROPIO_MAYOR];
  return [CONSENTIMIENTO_TUTOR_MENOR, ASENTIMIENTO_MENOR];
}

export function useConsentimiento() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [idPaciente, setIdPaciente] = useState(null);
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [decisiones, setDecisiones] = useState([]); // últimas decisiones por tipo
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;
        if (!activo) return;
        setIdPaciente(session.user.id);

        const fecha = await consentimientoService.obtenerFechaNacimientoPropia(session.user.id);
        if (!activo) return;
        setFechaNacimiento(fecha);

        if (fecha) {
          const historial = await consentimientoService.obtenerConsentimientosPropios(session.user.id);
          if (!activo) return;
          setDecisiones(historial);
        }
      } catch (err) {
        console.error('Error al cargar el estado de consentimiento:', err.message);
        if (activo) setError('No se pudo cargar el estado de tu consentimiento informado.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [version]);

  // recargar() fuerza que el efecto de arriba vuelva a correr — se llama
  // después de confirmar la fecha de nacimiento o decidir un documento,
  // para que el hook refleje el estado recién guardado en Supabase (no se
  // "adivina" el resultado en el cliente).
  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  const confirmarFechaNacimiento = useCallback(
    async (fechaISO) => {
      await consentimientoService.registrarFechaNacimiento(fechaISO);
      recargar();
    },
    [recargar]
  );

  const decidirDocumento = useCallback(
    async (tipo, aceptado) => {
      if (!idPaciente) return;
      await consentimientoService.registrarDecision({
        idPaciente,
        tipo,
        aceptado,
        versionDocumento: VERSION_DOCUMENTO,
      });
      recargar();
    },
    [idPaciente, recargar]
  );

  const edad = fechaNacimiento ? calcularEdad(fechaNacimiento) : null;
  const rama = edad === null ? null : edad >= EDAD_CORTE_AUTOCONSENTIMIENTO ? 'mayor' : 'menor';
  const documentosRequeridos = rama ? documentosDeLaRama(rama) : [];

  // Última decisión conocida por tipo de documento (el historial ya viene
  // ordenado por fecha descendente desde el service).
  const ultimaDecisionPorTipo = Object.values(TIPO_CONSENTIMIENTO).reduce((mapa, tipo) => {
    mapa[tipo] = decisiones.find((d) => d.tipo === tipo) ?? null;
    return mapa;
  }, {});

  const documentoRechazado = documentosRequeridos.find(
    (doc) => ultimaDecisionPorTipo[doc.tipo]?.aceptado === false
  );

  const documentoPendiente = documentosRequeridos.find(
    (doc) => ultimaDecisionPorTipo[doc.tipo]?.aceptado !== true
  );

  const consentimientoCompleto =
    documentosRequeridos.length > 0 &&
    documentosRequeridos.every((doc) => ultimaDecisionPorTipo[doc.tipo]?.aceptado === true);

  return {
    cargando,
    error,
    idPaciente,
    faltaFechaNacimiento: !cargando && !fechaNacimiento,
    documentoRechazado,
    documentoPendiente,
    consentimientoCompleto,
    confirmarFechaNacimiento,
    decidirDocumento,
  };
}
