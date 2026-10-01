# Dashboard Clínico

Aplicación web del Observatorio de Salud Mental de UNIFRANZ. Permite aplicar cuestionarios clínicos (estrés, ansiedad, depresión, GSHS, clima de aula, cuidado familiar, riesgo suicida y bullying), calcular sus resultados y alertas automáticamente, y consultarlos en paneles diferenciados por rol, con exportación a Excel.

## Roles

| Rol | Acceso |
|---|---|
| Superadministrador | Panel Maestro (instituciones, psicólogos y su asignación) y Panel Consolidado de resultados de todas las instituciones. |
| Psicólogo/a | Dashboard clínico de su institución: indicadores por formulario, listado de pacientes, informe consolidado por paciente, indicadores GSHS, habilitación de formularios y exportación a Excel. |
| Estudiante (`paciente`) | Responde solo los formularios que su psicólogo/a habilitó para su institución. Entra con su código de estudiante y contraseña, sin correo. |
| Docente | Registra reportes de seguimiento sobre alumnos y consulta el historial de los que envió. |
| Persona particular | Responde sus 5 formularios propios (estrés, ansiedad, depresión, cuidado primario de salud familiar y riesgo suicida), sin pertenecer a una institución. |

La prueba del estudiante se aplica de forma presencial en aula. La plataforma ya no pide consentimiento ni asentimiento; esa autorización se gestiona fuera del sistema. El código anterior se conserva en la rama `backup/consentimiento-v1` (y en el tag `consentimiento-v1`).

## Stack tecnológico

- **Frontend:** React 19 + Vite, React Router 7.
- **Estilos:** Tailwind CSS v4 (plugin de Vite) y fuente Montserrat (`@fontsource`).
- **Backend / base de datos:** Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions).
- **Exportación:** SheetJS (`xlsx`) para generar los archivos Excel en el navegador.
- **Calidad:** ESLint 10 con `eslint-plugin-react-hooks`.
- **Despliegue:** Vercel (`vercel.json` redirige todas las rutas a `index.html`).

## Arquitectura

El proyecto sigue **Domain-Driven Design**: cada dominio de negocio vive aislado en `src/modules/` con sus propios componentes, páginas, hooks, servicios y datos. Lo genérico vive en `src/core/` y `src/shared/`.

```
src/
├── core/
│   ├── api/                 # Cliente único de Supabase
│   └── security/            # RutaProtegida, RutaPublica, GuardianDeSesion y mapa de ruta por defecto de cada rol
├── modules/
│   ├── autenticacion/       # Login, registro, recuperar/restablecer contraseña, cierre de sesión
│   ├── instituciones/       # Panel Maestro: instituciones y asignación de psicólogos
│   ├── psicologos/          # Alta, edición y baja de psicólogos (vía Edge Functions)
│   ├── evaluaciones/        # Formularios clínicos, envío de respuestas y habilitación por institución
│   ├── dashboard_clinico/   # Dashboard del psicólogo, Panel Consolidado, informes y exportación a Excel
│   ├── casos_docente/       # Reportes de seguimiento del docente
│   ├── personas-particulares/ # Registro e ingreso de personas particulares
│   └── observatorio/        # Página pública de bienvenida
└── shared/                  # Componentes, utilidades, tema de colores y recursos comunes
```

**Regla de aislamiento:** ningún módulo importa directamente de otro. Si necesita algo de otro dominio, lo toma del `index.js` (API pública) del módulo de origen.

## Base de datos (Supabase)

Tablas principales del esquema `public`, todas con Row Level Security activo:

- `usuarios`: extiende a `auth.users` con el rol, la institución y los datos del perfil.
- `instituciones`: colegios y otras instituciones, cada una con un código de registro único.
- `psicologo_institucion`: asignación de psicólogos a instituciones.
- `evaluaciones_instrumento`: una fila por formulario enviado por una persona.
- `formularios_habilitados`: formularios que cada institución tiene abiertos para sus estudiantes.
- `reportes_docente`: reportes de seguimiento del docente (inmutables).
- `gshs_indicadores_riesgo`: configuración de los indicadores de riesgo del GSHS.
- `consentimientos`: registros históricos de la versión anterior; la aplicación ya no los usa.

Reglas importantes:

- El resultado de cada formulario y la alerta de riesgo se calculan **solo en la base de datos**, mediante triggers. El navegador nunca envía ni puede falsificar esos valores.
- Las evaluaciones enviadas no se pueden modificar ni borrar.
- Las claves foráneas usan `NO ACTION`: borrar un registro con relaciones activas falla de forma explícita en vez de dejar datos huérfanos.
- El SQL no se versiona en este repositorio. Las migraciones se ejecutan manualmente en el editor SQL de Supabase.

## Edge Functions (`supabase/functions/`)

| Función | Qué hace |
|---|---|
| `crear-psicologo`, `editar-psicologo`, `eliminar-psicologo` | Gestión de cuentas de psicólogo. Usan la `service_role` para no cerrar la sesión del superadministrador. |
| `registrar-estudiante` | Registro de estudiantes sin correo: el servidor asigna el código de estudiante. |
| `notificar-riesgo-alto` | Envía una alerta por correo cuando una respuesta llega al nivel más alto de su formulario. La dispara un trigger de la base. |
| `notificar-caso-nuevo` | Avisa al psicólogo cuando un docente registra un caso nuevo. La dispara un trigger de la base. |

Las funciones se despliegan manualmente en Supabase.

## Puesta en marcha

```bash
npm install
```

Crear un archivo `.env` en la raíz con las credenciales del proyecto de Supabase:

```
VITE_SUPABASE_URL=https://<tu-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run lint      # ESLint
npm run preview   # previsualizar el build
```