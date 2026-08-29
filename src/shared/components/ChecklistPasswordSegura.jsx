// Checklist visual de requisitos de contraseña segura, reutilizado en
// toda pantalla que cree una cuenta con contraseña (Registro de
// estudiante, Registro de docente, Alta de psicólogo por superadmin).
// Puramente de presentación: recibe `requisitos` ya calculado por
// `validarPasswordSegura()` y no conoce nada de Supabase ni del flujo
// que lo usa — por eso vive en `shared/` y no en cada módulo.
//
// A propósito NO usa rojo para los requisitos aún no cumplidos —
// mientras la persona todavía está escribiendo, un ítem incompleto no es
// un error, así que se muestra en gris neutro (mismo tono que el resto
// de la app usa para "ayuda", no para "inválido"). Rojo queda reservado
// para cuando el envío ya fue rechazado por no cumplir los requisitos.
import { LONGITUD_MINIMA_PASSWORD } from '../utils/validarPasswordSegura';

const ITEMS = [
  { clave: 'longitud', etiqueta: `Al menos ${LONGITUD_MINIMA_PASSWORD} caracteres` },
  { clave: 'mayuscula', etiqueta: 'Una letra mayúscula (A-Z)' },
  { clave: 'minuscula', etiqueta: 'Una letra minúscula (a-z)' },
  { clave: 'numero', etiqueta: 'Un número (0-9)' },
  { clave: 'especial', etiqueta: 'Un símbolo (ej. $ # ! ? @ _)' },
];

export function ChecklistPasswordSegura({ requisitos }) {
  return (
    <ul className="mt-1.5 space-y-0.5 text-xs">
      {ITEMS.map(({ clave, etiqueta }) => {
        const cumplido = requisitos[clave];
        return (
          <li key={clave} className={cumplido ? 'text-green-600 font-semibold' : 'text-gray-400'}>
            {cumplido ? '✓' : '○'} {etiqueta}
          </li>
        );
      })}
    </ul>
  );
}