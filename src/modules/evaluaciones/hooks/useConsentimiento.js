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
