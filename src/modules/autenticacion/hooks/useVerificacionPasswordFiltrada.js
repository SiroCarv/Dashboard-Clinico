// Chequeo en vivo de "¿esta contraseña aparece en bases de datos
// filtradas?", reutilizado en Registro.jsx, RegistroDocente.jsx y
// RestablecerPassword.jsx.
//
// Antes, este chequeo (esPasswordFiltrada, contra la API de
// HaveIBeenPwned) solo corría al hacer submit: la persona llenaba todo
// el formulario, mandaba, y recién ahí se enteraba de que su elección
// fue rechazada — obligándola a rehacer el formulario entero en cada
// intento. Este hook mueve ese mismo chequeo al campo de contraseña,
// con el mismo patrón de debounce (500ms) que ya usan estas pantallas
// para el código de institución, así la persona ve el resultado apenas
// termina de escribir una opción, sin necesidad de enviar nada.
//
// LARGO_MINIMO evita golpear la API mientras la contraseña todavía es
// obviamente demasiado corta para tener sentido evaluarla — no
// reemplaza ninguna validación de longitud mínima real del formulario,
// solo retrasa cuándo arranca este chequeo en particular.
import { useEffect, useRef, useState } from 'react';
import { esPasswordFiltrada } from '../services/passwordSecurityService';

const DEBOUNCE_MS = 500;
const LARGO_MINIMO = 4;

export function useVerificacionPasswordFiltrada(password) {
  // En vez de una bandera "verificando" separada que habría que
  // sincronizar a mano dentro del efecto (eso es justo lo que prohíbe
  // 'react-hooks/set-state-in-effect': llamar a setState de forma
  // síncrona en el cuerpo del efecto), acá se guarda únicamente el
  // último resultado CONFIRMADO — a qué contraseña corresponde y si
  // estaba filtrada — y todo lo demás se deriva comparándolo contra la
  // contraseña actual en cada render. Si no coinciden, hay una
  // verificación pendiente; no hace falta un estado aparte para eso.
  const [resultado, setResultado] = useState(null); // { password, filtrada } | null

  // Guarda de carrera: si la persona sigue escribiendo mientras una
  // consulta anterior todavía está en vuelo (por ejemplo, la red está
  // lenta), esa respuesta vieja no debe pisar el resultado de la
  // consulta más reciente cuando llegue tarde.
  const idConsultaRef = useRef(0);

  const largoSuficiente = password.length >= LARGO_MINIMO;

  useEffect(() => {
    idConsultaRef.current += 1;
    const idDeEstaConsulta = idConsultaRef.current;

    // Contraseña todavía demasiado corta: no hay nada que lanzar. El
    // valor de retorno de abajo ya resuelve este caso a partir de
    // `largoSuficiente`, sin tocar ningún estado acá.
    if (!largoSuficiente) return;

    const timeoutId = setTimeout(async () => {
      const filtrada = await esPasswordFiltrada(password);

      // Llegó tarde: ya hay una consulta más nueva en curso o resuelta,
      // no correspondemos a la contraseña que la persona tiene escrita
      // en este momento.
      if (idConsultaRef.current !== idDeEstaConsulta) return;

      // Único setState del hook, y ocurre dentro del callback asíncrono
      // que responde a un sistema externo (el timer + la API de
      // HaveIBeenPwned) — el patrón que la regla sí permite.
      setResultado({ password, filtrada });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [password, largoSuficiente]);

  const hayResultadoVigente = largoSuficiente && resultado?.password === password;

  return {
    verificandoPassword: largoSuficiente && !hayResultadoVigente,
    passwordFiltrada: hayResultadoVigente && resultado.filtrada,
    // Se calcula acá (en vez de que cada pantalla repita la misma
    // condición) para que "✓ no aparece filtrada" solo se muestre
    // cuando de verdad corresponde: largo suficiente, resultado vigente
    // para la contraseña actual, y ese resultado fue negativo.
    passwordConfirmadaSinFiltrar: hayResultadoVigente && !resultado.filtrada,
  };
}