# Dashboard Clínico

Aplicación web de psicología clínica para UNIFRANZ. Gestiona registro de instituciones, recepción de encuestas clínicas (PHQ-9), cálculo automático de diagnóstico y paneles diferenciados por rol.

## Roles

- **Superadmin** — gestiona instituciones y asignación de psicólogos (`PanelMaestro`).
- **Psicólogo** — accede a su dashboard clínico.
- **Paciente** — completa el flujo de encuesta diagnóstica.

## Stack Tecnológico

- **Frontend:** React 19 + Vite, React Router 7
- **Estilos:** Tailwind CSS v4
- **Backend / DB:** Supabase (PostgreSQL) — autenticación, RLS y trigger de cálculo de diagnóstico en base de datos
- **Lint:** ESLint 10 + `eslint-plugin-react-hooks`

## Arquitectura

El proyecto sigue **Domain-Driven Design (DDD)**. Cada dominio de negocio vive de forma aislada en `src/modules/`, y solo se comunica con otros módulos a través de su archivo `index.js` (API pública). La infraestructura y los componentes verdaderamente genéricos viven en `src/core/` y `src/shared/`.

```
src/
├── core/
│   ├── api/supabaseClient.js       # Cliente único de Supabase
│   └── security/                   # RutaProtegida, RutaPublica, mapa de rutas por rol
├── modules/
│   ├── autenticacion/              # Login, registro, recuperar/restablecer contraseña, cierre de sesión
│   ├── instituciones/              # Panel Maestro: CRUD de instituciones, asignación de psicólogos
│   ├── evaluaciones/                # Wizard PHQ-9 del paciente (consentimiento → encuesta → confirmación)
│   └── dashboard_clinico/          # Panel del psicólogo
└── shared/
    ├── assets/                     # Recursos compartidos (logo, etc.)
    └── components/                 # BarraSuperior y demás UI reutilizable entre módulos
```

**Regla de aislamiento:** ningún módulo importa directamente de otro. Un módulo que necesita algo de otro dominio (ej. `instituciones` usando `BotonCerrarSesion` de `autenticacion`) lo hace exclusivamente vía el `index.js` del módulo origen.

## Base de datos (Supabase)

Tablas principales: `usuarios`, `instituciones`, `psicologo_institucion`, `historial_evaluaciones`.

- El diagnóstico (`Leve` / `Moderado` / `Severo`) y la alerta de riesgo se calculan **exclusivamente** mediante el trigger `trg_calcular_diagnostico` (`BEFORE INSERT`) — el frontend nunca envía ni puede falsificar estos valores.
- Row Level Security activo en las 4 tablas. `historial_evaluaciones` deniega lectura por defecto (sin política de `SELECT`); el acceso del psicólogo a los historiales está planificado para el Sprint 3.
- Foreign keys configuradas en `NO ACTION`: eliminar una institución o usuario con relaciones activas falla explícitamente en vez de propagar el borrado o dejar huérfanos.

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

## Estado del proyecto

- ✅ **Sprint 1:** Autenticación completa (login, registro, recuperar contraseña, guardas de ruta por rol).
- ✅ **Sprint 2:** Recepción de evaluaciones, cálculo de diagnóstico por trigger, cierre de sesión, gestión de instituciones — auditados y con RLS corregido.
- 🚧 **Sprint 3 (en curso):** política de `SELECT` de `historial_evaluaciones` para el dashboard del psicólogo, alta de cuentas de psicólogo vía Edge Function.