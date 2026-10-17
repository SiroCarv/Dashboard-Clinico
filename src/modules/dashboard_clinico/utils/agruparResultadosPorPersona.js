// Junta los resultados sueltos del Panel Consolidado del superadmin (uno
// por formulario completado) en un grupo por PERSONA, para que quien hizo
// varios instrumentos aparezca una sola vez con todos sus resultados
// juntos, en vez de repetida y desparramada por la tabla.
//
// Recibe los resultados YA FILTRADOS (institución, psicólogo, formulario,
// fechas) — así, si se filtra por un instrumento, cada persona muestra solo
// los resultados que cumplen el filtro, y las personas sin ninguno no
// aparecen.
//
// Orden: la entrada llega del resultado más reciente al más antiguo (ver
// resultadosGlobalesService.js). Como un Map conserva el orden de
// inserción, las personas quedan ordenadas por su resultado más reciente,
// y dentro de cada una sus resultados también, del más nuevo al más viejo.
//
// Si una persona hizo el mismo formulario más de una vez, cada intento se
// conserva como un resultado aparte — cada uno lleva su propia fecha.
export function agruparResultadosPorPersona(resultados) {
  const porPersona = new Map();

  resultados.forEach((resultado) => {
    // `id_paciente` siempre debería venir. Si faltara, se usa el id del
    // resultado para no mezclar por error a personas distintas en un
    // mismo grupo.
    const clave = resultado.id_paciente ?? `sin-paciente-${resultado.id_evaluacion}`;

    let grupo = porPersona.get(clave);
    if (!grupo) {
      grupo = { clave, paciente: resultado.paciente, registros: [], tieneAlertaActiva: false };
      porPersona.set(clave, grupo);
    }

    grupo.registros.push(resultado);
    if (resultado.alerta_activada) grupo.tieneAlertaActiva = true;
  });

  return Array.from(porPersona.values());
}