# Revisión de fuente de esquema para WhatsApp

## Resultado y procedencia

No se encontró un archivo local identificado expresamente como esquema
sanitizado para esta auditoría. No se utilizó ningún esquema ni se confirmó
ninguna tabla remota. La revisión de migración se detiene por esta ausencia.

Se inventariaron archivos versionados y nuevos y nombres de archivos locales
fuera de .git, .next y node_modules, buscando esquema, schema, sanitización,
migraciones y SQL. El único candidato por nombre fue
docs/whatsapp-schema-blocker.md: es un informe de bloqueo, no un esquema.
No se abrieron archivos de credenciales ni archivos confidenciales.

Se revisaron AGENTS.md, README.md, las guías locales de Next.js sobre
Server/Client Components y Vitest, docs/whatsapp-schema-blocker.md,
docs/whatsapp-local-delivery.md, src/lib/event-whatsapp.ts y
src/components/wedding-demo/WeddingRSVP.tsx. Los bloques de la entrega anterior
coinciden con sus cuatro archivos fuente. Esa entrega es evidencia de código
local y documentación, no de estructura SQL.

El HTTP 401 sigue siendo un antecedente informado por el usuario y recogido
en el informe anterior. No se repitió la consulta ni se obtuvo evidencia remota.

## Clasificación de evidencia

- Confirmado localmente: el contrato TypeScript permite whatsapp_number
  opcional/null y whatsapp_primary opcional; la prioridad exige número válido
  y preferencia estrictamente true. WeddingRSVP usa false cuando falta la
  preferencia y mantiene el envío RSVP separado de la apertura de WhatsApp.
- Confirmado localmente: entrada internacional con +, espacios y guiones;
  salida de 8 a 15 dígitos, primero distinto de cero; rechazo de extensiones
  y letras. Es validación sintáctica, sin prueba de existencia de cuenta.
- Inferencia del código/documentación: events representa los eventos;
  event_guests y rsvps participan en invitados y respuestas. Estos nombres
  no confirman tabla real, esquema SQL, propietario ni permisos.
- Ausente: tabla real, esquema, propietario, columnas y tipos SQL actuales.
- Ausente: confirmación del flujo remoto de creación y edición. El informe
  anterior describe escrituras locales directas; no demuestra su contrato SQL.
- Ausente: compatibilidad de selecciones explícitas del dashboard y selección
  pública con el esquema. El informe previo indica que la selección pública
  no incluye WhatsApp; no se modificó ni se validó contra un catálogo remoto.
- Ausente: definiciones, retornos y permisos de get_public_guest_invitation
  y submit_public_rsvp. WeddingRSVP referencia esta última en el envío RSVP.
- Ausente: políticas RLS, grants, vistas, triggers y dependencias reales con
  propietarios, invitados, RSVP, métricas, historial y check-in.
- Ausente: estructura autorizada e historial de migraciones del proyecto.
- Contradictorio: no hay contradicción de esquema demostrable porque falta la
  fuente de contraste. Esto no equivale a confirmar compatibilidad.
  Los recuentos históricos de Git del informe anterior corresponden a otra
  etapa; el inventario de esta revisión se registra abajo.

## Evaluación suspendida y propuesta conceptual

No se fija una tabla destino ni se crea SQL ejecutable o definitivo.

El contrato funcional propone número opcional sin destinatario predeterminado
y preferencia inicialmente false. Como propuesta pendiente de esquema:
número de tipo texto nullable y preferencia booleana no nula con default false.
La restricción futura deberá impedir prioridad true con número nulo, vacío
o inválido y contemplar explícitamente los valores nulos; no se redacta DDL.

No hay evidencia que justifique un índice nuevo. La necesidad de índices,
triggers, vistas, RPC, grants o políticas queda sin determinar hasta revisar
sus definiciones y usos. No se afirma que puedan permanecer sin cambios.

La intención para eventos existentes es número ausente y prioridad false, sin
insertar teléfonos ni activar WhatsApp. El impacto real, bloqueos y
compatibilidad requieren la versión y el esquema reales.

Dependencias futuras a revisar: validación compartida de formularios, acciones
de creación/edición, selección explícita de edición y lectura pública, tipos
locales y cualquier función/vista/permiso que exponga eventos. No se autoriza
cambiar RSVP, selección vigente, métricas, historial ni check-in.

Orden conceptual: confirmar esquema e historial; revisar una ampliación
compatible y su reversión; ensayar con datos ficticios; obtener autorización
antes de cualquier aplicación remota; después adaptar creación, edición y
lecturas. Para revertir, retirar primero el uso de los campos en la aplicación
y preservar inicialmente las columnas y su configuración. No eliminar columnas
ni restaurar permisos sin inventario de dependencias y autorización.

## Información faltante necesaria

Proporcionar un archivo expresamente identificado para esta auditoría, solo
con metadatos sanitizados, indicando origen, fecha y entorno lógico sin URL:

1. Nombre cualificado, tipo de relación, propietario y versión de PostgreSQL.
2. Columnas, tipos, nulabilidad, defaults, identity/generated, PK, UNIQUE,
   CHECK, FK y acciones, e índices de la relación de eventos.
3. Herramienta, estructura, convenciones, baseline e historial de migraciones.
4. Flujo vigente de creación/edición y definiciones de sus funciones/RPC,
   o confirmación de que se usan escrituras directas.
5. Definiciones de las RPC públicas: firmas, retornos, lenguaje, propietario,
   SECURITY DEFINER/INVOKER, search_path y permisos.
6. Vistas, funciones, triggers, tipos compuestos, consultas dependientes y
   esquemas expuestos por la API.
7. ENABLE/FORCE RLS y políticas completas: roles, comandos, modo,
   USING y WITH CHECK.
8. GRANT/REVOKE efectivos y privilegios por defecto sobre esquemas, tablas,
   columnas, secuencias y funciones para los roles implicados.
9. Relaciones y dependencias con propietarios, invitados, RSVP, métricas,
   historial y check-in.

No proporcionar filas personales, teléfonos reales, claves, credenciales,
tokens ni URLs privadas. Sin estos datos no es seguro elegir un destino,
restricciones, permisos, compatibilidad o reversión de una migración.

## Estado inicial de Git

Rama: codex/liam-visual-effects.
Commit: c3839f582396d5797588b6545fd4fc9e095e1422.
18 modificados y 18 nuevos preexistentes:

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

## Alcance de esta revisión

Único archivo nuevo: docs/whatsapp-schema-review.md, este informe.
Se conservan los documentos anteriores como registro de su etapa.
No se modificó código de aplicación, pruebas, configuración ni dependencias.
No se creó SQL, consultaron filas, ejecutaron RPC remotas ni escribió en
Supabase. No hubo cambios de entorno, commits, push, despliegues ni navegador.

Siguiente paso: recibir el archivo sanitizado y revisar su suficiencia.
La aplicación de cualquier cambio remoto continúa pendiente de autorización.

## Verificación de esta sesión

- npm test: 15 archivos, 176 pruebas aprobadas; salida 0.
- npm run lint: aprobado sin errores ni advertencias; salida 0.
- node node_modules/typescript/bin/tsc --noEmit: aprobado; salida 0.
- Build no ejecutado: no hubo cambios de código de aplicación.
- Comparación SHA-256 del inventario de fuentes y documentos: ningún archivo
  preexistente cambió; el único añadido es este informe. No se inspeccionaron
  valores de entorno. TypeScript puede actualizar su caché local ignorada.

Son comprobaciones locales, no validación del esquema remoto ni del navegador.
