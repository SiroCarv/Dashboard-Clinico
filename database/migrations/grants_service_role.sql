-- service_role tenía solo REFERENCES/TRIGGER/TRUNCATE en psicologo_institucion
-- e instituciones (le faltaban SELECT/INSERT/UPDATE/DELETE). Evadir RLS
-- (bypassrls del rol) no reemplaza los GRANTs base de la tabla — son dos
-- capas de permisos distintas en Postgres. Esto rompía el paso 1 de
-- eliminar-psicologo (borrar asignaciones antes de borrar el perfil).
--
-- Idempotente: un GRANT repetido no falla.

grant select, insert, update, delete on public.psicologo_institucion to service_role;
grant select, insert, update, delete on public.instituciones to service_role;