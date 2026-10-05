# WhatsApp real: preparación local, integración de datos bloqueada

Estado inicial: rama `codex/liam-visual-effects`, commit `c3839f5`.
Antes del bloque había 17 archivos modificados y 13 nuevos. El estado completo
y sus hashes SHA-256 se registraron en la sesión antes de editar. Había 129 pruebas
aprobadas, incluidos los cambios anteriores de la demo.

Inventario inicial (`M`: modificado, `?`: nuevo sin seguimiento):

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
? public/invitea-logo.svg
? src/app/icon.svg
? src/components/PublicInvitation.tsx
? src/components/baby-shower/BabyVoiceMessage.test.ts
? src/components/dashboard/LoadError.tsx
? src/components/dashboard/load-errors.test.ts
? src/components/wedding-demo/DemoRSVP.test.ts
? src/components/wedding-demo/WeddingRSVP.test.ts
? src/lib/current-rsvp.test.ts
? src/lib/current-rsvp.ts
? src/lib/invitation-presentation.ts
? src/lib/public-invitation-data.ts
? src/lib/public-invitation.test.ts
```

## Contrato propuesto, no aplicado

- `events.whatsapp_number`: texto nullable, por evento, sin valor por defecto.
  Entrada explícita con `+` y código de país; espacios y guiones se eliminan.
  Contrato local: de 8 a 15 dígitos, primero distinto de cero. No admite letras,
  extensiones ni prefijos locales/00. Es validación sintáctica, no prueba de
  asignación del número, país ni disponibilidad de una cuenta WhatsApp.
- `events.whatsapp_primary`: booleano, valor seguro propuesto `false`.
  Solo puede activarse con un número válido. Sin número se mantiene el RSVP.

No se creó una migración: no existe estructura de migraciones, esquema SQL ni
configuración de Supabase versionada que permita integrarla al proyecto con
seguridad. Tampoco están versionadas las RPC, restricciones o RLS. No se consultó
ni modificó el servicio remoto.

## Disponible localmente

Tipo opcional de evento, validador independiente `validateEventWhatsApp`, paso de
props desde `PublicInvitation` y acción en el único formulario real compartido.
Con datos simulados, WhatsApp puede ser principal o alternativo. El botón valida,
codifica solo campos públicos, abre con `noopener,noreferrer` y limita intentos
consecutivos a uno por segundo. No llama a Supabase ni cambia métricas.

Una apertura devuelve a veces null por `noopener`, incluso cuando tuvo éxito.
Se muestra un aviso condicional para usar RSVP si no abrió; no se afirma una
detección fiable de bloqueo. Excepciones de apertura tienen un aviso explícito.

## Pendiente por el bloqueo del esquema

No se añadieron controles que aparenten guardar una configuración inexistente.
Creación y edición, sus acciones de servidor y la lista pública de campos
permanecen sin cambios. La opción NO se activa todavía desde eventos remotos.
El validador local no se conecta a `validateInvitationForm` porque sus valores
se envían directamente a Supabase.

Después de recibir el esquema y el flujo de migraciones autorizados:

1. Proponer una migración integrada, nullable/default false, con restricciones
   coherentes y revisión de permisos públicos y de propietario.
2. Añadir controles compartidos en NewInvitationForm/EditInvitationForm,
   precargar el número con `+`, validar en servidor y preparar los dos campos
   para crear/editar. Texto junto al campo: «El número será accesible desde la
   invitación pública. Las respuestas solo por WhatsApp se gestionan fuera del
   panel y no forman parte de sus métricas».
3. Actualizar la selección explícita de edición y PUBLIC_EVENT_FIELDS únicamente
   cuando existan ambos campos, conservando la exclusión de información privada.
4. Verificar aislamiento de propietario/evento, persistencia, restricciones y
   compatibilidad con eventos anteriores antes de habilitar la lectura nueva.

No se cambió la RPC RSVP ni su vinculación, métricas, historial, invitados,
check-in, audio, demo, dependencias o entorno. No hay envío automático ni registro
de mensajes externos. Las pruebas locales usan respuestas simuladas; navegador,
teclado, validación nativa, bloqueo de pestañas y entrega a WhatsApp siguen pendientes.
