# Paquete de auditoría de metadatos de Supabase

## Alcance y seguridad

docs/supabase-schema-audit.sql contiene únicamente sentencias SELECT sobre
pg_catalog e information_schema. No es una migración y no se ejecutó contra
Supabase durante su preparación. No lee filas de negocio ni invoca RPC,
funciones de negocio, variables de entorno o credenciales.

El HTTP 401 anterior no se reintentó. Se conservaron los archivos existentes.
Se revisaron AGENTS.md, README, las guías locales de Next.js sobre componentes
Server/Client y Vitest, y los documentos y código de WhatsApp solicitados.

Los propios metadatos pueden incluir secretos en expresiones o nombres.
Por eso no se exportan cuerpos de funciones/vistas, condiciones de políticas,
argumentos de triggers, configuración de rutinas, comentarios, límites de
partición, valores de enum ni expresiones arbitrarias de defaults.
Q02 solo revela defaults exactos true, false, NULL, 0 o 1; el resto queda
marcado como [REDACTED_EXPRESSION]. No se evalúan esos defaults.

Esta primera exportación identifica objetos y relaciones. No es un esquema
completo ni suficiente por sí sola para redactar una migración. Las expresiones
omitidas, search_path, opciones de vistas, semántica de dominios/enum y cuerpos
de rutinas deberán revisarse y sanitizarse manualmente en otro bloque.
No reemplazar los marcadores por texto sensible para completar la entrega.

## Ejecución manual

1. Abre tú el proyecto correcto en Supabase y su SQL Editor. No compartas su URL.
2. Lee ambos archivos. Copia únicamente Q01, desde su SELECT hasta su punto
   y coma, en una consulta nueva del editor y ejecútala con tu rol disponible.
3. Revisa los candidatos. public es solo el alcance inicial, no una tabla ni
   un esquema confirmados. Los filtros por nombre no prueban función de negocio.
4. Ejecuta las demás consultas individualmente, por su identificador Qxx.
   No ejecutes todo el archivo como un solo lote: un fallo podría ocultar
   resultados de otras consultas.
5. Si confirmas otro esquema de aplicación, reemplaza el literal 'public'
   en la consulta correspondiente y repítela. No sustituyas los FROM/JOIN de
   catálogo por tablas reales. Si el nombre requiere comillas especiales y no
   sabes representarlo, anótalo como pendiente; no construyas SQL por concatenación.
6. Para referencias FK o funciones de trigger fuera del alcance inicial, repite
   únicamente las consultas de metadatos necesarias con ese esquema confirmado.
   No amplíes a tablas de usuarios, vault u otros datos de negocio.
7. Anota Qxx, esquema usado, resultado completo/vacío/truncado o error, y fecha.
   Si la interfaz limita resultados, usa su opción disponible para obtener el
   resultado completo o marca explícitamente la truncación; no la ocultes.

## Mapa de consultas

- Q01: candidatos de relaciones, esquemas, propietarios por OID y estado RLS.
- Q02 y Q19: columnas, tipos, nulabilidad y defaults limitados.
- Q03: restricciones, FK, números de columnas y acciones referenciales.
- Q04: índices, columnas, unicidad y presencia de predicados/expresiones.
- Q05-Q06: rutinas candidatas a RPC, parámetros, retornos y tipos.
- Q07: vistas y materializadas, sin leerlas ni exportar su definición.
- Q08: triggers y función vinculada, incluidos los internos.
- Q09: políticas RLS, roles y presencia de USING/WITH CHECK.
- Q10-Q12: ACL de objetos/columnas y privilegios por defecto.
- Q13-Q14: roles pseudonimizados y membresías, sin credenciales.
- Q15 y Q18: dependencias registradas y mapa de catálogos.
- Q16: herencia y particiones, sin límites de partición.
- Q17: ubicación de candidatos de migración, sin leer su historial.

relation_kind: r=tabla, p=tabla particionada, v=vista, m=materializada,
f=tabla externa, S=secuencia. routine_kind: f=función, p=procedimiento,
a=agregado, w=ventana. constraint_type: p=PK, u=UNIQUE, f=FK, c=CHECK,
x=exclusión; otros códigos deben conservarse sin reinterpretar.
command_code de RLS: r=lectura, a=inserción, w=actualización, d=borrado,
*=todos. Son metadatos, no comandos que deban ejecutarse.
role_oid 0 representa PUBLIC en ACL/políticas. Conservarlo como 0.
Las claves de índices con valor 0 indican expresiones omitidas.

## Exportación y sanitización

Exporta cada resultado, si el editor ofrece esa opción, o copia exclusivamente
la cuadrícula con sus encabezados a un editor de texto local. No copies
capturas completas del panel, cabeceras HTTP, datos del proyecto, logs ni
resultados de consultas anteriores. Revisa localmente antes de compartir.

Conserva todos los encabezados de salida exactamente como aparecen, incluidos:
schema_name, relation_oid, relation_name, column_number, column_name, type_oid,
type_name, owner_oid, routine_oid, constraint_oid, index_oid, policy_oid,
role_oid, grantor_oid, grantee_oid, privilege_type, is_grantable y los campos
de dependencias. Conserva también todos los demás encabezados, tipos, códigos,
booleanos, arrays y marcadores de omisión. No confundas null, vacío y omitido.

Mantén los nombres técnicos de columnas necesarios para analizar el contrato,
incluidos los identificadores de eventos, relaciones y campos de WhatsApp si
existen. No rellenes columnas ausentes. Los OID son identificadores de catálogo,
no identificadores de filas personales; permiten enlazar las consultas.

Si un nombre de objeto, esquema, columna o argumento contiene un nombre de
persona, correo, teléfono, identificador privado o URL, reemplaza ese valor por
un alias estable, por ejemplo OBJETO_PRIVADO_A. Usa el mismo alias en todas
las secciones y anota que fue reemplazado. Conserva la correspondencia original
solo en privado. Si no puedes sanitizar un resultado con confianza, no lo
compartas y marca la sección como pendiente.

Elimina o reemplaza cualquier clave, token, URL privada, contraseña, cadena de
conexión, credencial, dato personal o literal sensible que aparezca en nombres
o errores. Nunca pegues claves ni credenciales, tampoco para resolver permisos.
No compartas archivos .env, exports de usuarios ni volcados completos.
Los roles no técnicos se presentan como role_OID: conserva ese alias, no añadas
el nombre original si identifica a una persona. Los propietarios se enlazan
con Q13 por OID.

Guarda SOLO la versión revisada en docs/supabase-schema-sanitized.txt.
No se crea ese archivo ahora ni se simulan resultados. No guardes una exportación
sin revisar en el repositorio. Devuelve el archivo sanitizado junto con la
plantilla siguiente; no hagas commit ni push.

## Permisos, cobertura y límites

Si aparece permission denied, detén esa consulta, anota Qxx y un mensaje
sanitizado (incluye SQLSTATE si está disponible), y ejecuta la siguiente por
separado. No cambies roles, permisos o políticas; no uses claves de servicio.
Un resultado vacío o denegado no demuestra que el objeto no exista.

La visibilidad de information_schema depende del rol. Q13/Q14 y algunos
catálogos podrían estar restringidos. No se comprobó la versión ni los permisos
del servidor; si una columna de catálogo no existe, registra la incompatibilidad
y continúa. No se promete validación SQL real a partir de pruebas de TypeScript.

Las ACL no prueban por sí solas el acceso efectivo: faltan contexto de sesión,
herencia de roles, opciones de membresía específicas de versión y condiciones
RLS. Las ACL nulas usan defaults incorporados; pg_default_acl describe defaults
para objetos futuros, no permisos retroactivos sobre los existentes.

pg_depend no descubre todas las referencias en cuerpos de funciones ni SQL
dinámico. Las FK, vistas y triggers ayudan a reconstruir dependencias; no prueban
que no existan otras. Q17 busca nombres candidatos, no confirma herramienta,
historial aplicado, baseline ni estructura de migraciones del repositorio.
No se deben consultar filas de tablas de migración para completar este paquete.

## Plantilla para devolver, sin suposiciones

Procedencia local del archivo:
Fecha de extracción:
Entorno lógico (sin URL ni identificador privado):
Versión PostgreSQL conocida (o desconocida):
Rol técnico/alias utilizado:
Consultas ejecutadas y alcance por esquema:
Consultas vacías, truncadas, denegadas o incompatibles:

Tabla de eventos y evidencia:
Esquema y propietario/OID:
Columnas y tipos:
Defaults y elementos omitidos:
Restricciones:
Índices:
Funciones/RPC y definiciones pendientes:
Vistas/materialized views y definiciones pendientes:
Triggers:
Políticas RLS y expresiones pendientes:
Grants/ACL y límites de interpretación:
Dependencias:
Estructura de migraciones y evidencia:
Discrepancias o elementos desconocidos:
Valores/nombres reemplazados (solo alias, no originales):

[Q01: encabezados y resultados sanitizados]
[Q02-Q19: una sección identificada por cada consulta]
[Elementos omitidos que requieren revisión posterior]

## Estado inicial local

Rama: codex/liam-visual-effects.
Commit: c3839f582396d5797588b6545fd4fc9e095e1422.
18 archivos modificados y 19 nuevos preexistentes:

```text
 M docs/arquitectura.md
 M docs/changelog.md
 M src/app/dashboard/[slug]/checkin/actions.ts
 M src/app/dashboard/[slug]/checkin/page.tsx
 M src/app/dashboard/[slug]/invitados/actions.ts
 M src/app/dashboard/[slug]/invitados/page.tsx
 M src/app/dashboard/[slug]/page.tsx
 M src/app/invitacion/[slug]/page.tsx
 M src/app/liam-alejandro/page.tsx
 M src/components/Navbar.tsx
 M src/components/baby-shower/BabyShowerInvitation.tsx
 M src/components/baby-shower/BabyVoiceMessage.tsx
 M src/components/dashboard/CheckInPanel.tsx
 M src/components/dashboard/EventMetrics.tsx
 M src/components/dashboard/ManualGuestSearch.tsx
 M src/components/wedding-demo/DemoRSVP.tsx
 M src/components/wedding-demo/WeddingRSVP.tsx
 M src/types/event.ts
?? docs/whatsapp-local-delivery.md
?? docs/whatsapp-real-local.md
?? docs/whatsapp-schema-blocker.md
?? docs/whatsapp-schema-review.md
?? public/invitea-logo.svg
?? src/app/icon.svg
?? src/components/PublicInvitation.tsx
?? src/components/baby-shower/BabyVoiceMessage.test.ts
?? src/components/dashboard/LoadError.tsx
?? src/components/dashboard/load-errors.test.ts
?? src/components/wedding-demo/DemoRSVP.test.ts
?? src/components/wedding-demo/WeddingRSVP.test.ts
?? src/lib/current-rsvp.test.ts
?? src/lib/current-rsvp.ts
?? src/lib/event-whatsapp.test.ts
?? src/lib/event-whatsapp.ts
?? src/lib/invitation-presentation.ts
?? src/lib/public-invitation-data.ts
?? src/lib/public-invitation.test.ts
```

## Verificación y entrega

- npm test: 15 archivos y 176 pruebas aprobadas, salida 0.
- npm run lint: aprobado sin errores ni advertencias, salida 0.
- node node_modules/typescript/bin/tsc --noEmit: aprobado, salida 0.
- Sin build: solo se crearon estos dos documentos.
- SQL revisado estáticamente; no ejecutado ni validado contra PostgreSQL remoto.
- No hubo consultas al proyecto, RPC, lectura de filas, cambios de entorno,
  instalación de dependencias, migración, commits, push o despliegues.

Solo se crean docs/supabase-schema-audit.sql y docs/supabase-schema-audit.md.
El paquete queda pendiente de ejecución manual y exportación sanitizada.

## Referencias públicas utilizadas

- [Rutinas y configuración](https://www.postgresql.org/docs/current/catalog-pg-proc.html).
- [Políticas RLS](https://www.postgresql.org/docs/current/catalog-pg-policy.html).
- [Funciones de catálogo y ACL](https://www.postgresql.org/docs/current/functions-info.html).
- [Dependencias](https://www.postgresql.org/docs/current/catalog-pg-depend.html).
- [Índices](https://www.postgresql.org/docs/current/catalog-pg-index.html).
- [Columnas visibles](https://www.postgresql.org/docs/current/infoschema-columns.html).
- [Privilegios por defecto](https://www.postgresql.org/docs/current/catalog-pg-default-acl.html).
