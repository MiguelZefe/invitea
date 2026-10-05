# WhatsApp por evento: bloqueo de esquema

## Evidencia y alcance

Auditoría local del 13 de septiembre de 2026. El usuario informa como resultado
de la auditoría anterior: «El proyecto Supabase respondió, pero la consulta de
metadatos devolvió HTTP 401. No se pudo verificar el esquema remoto».
Esta es evidencia comunicada por el usuario, no una respuesta HTTP obtenida en
esta sesión. No hay aquí una captura sanitizada independiente de esa respuesta.
No se repitió la solicitud ni se infiere de ese estado HTTP ninguna definición
de tabla o permiso efectivo.

Se leyeron AGENTS.md, README.md, docs/whatsapp-real-local.md y las guías locales
de Next.js de componentes Server/Client y Vitest en node_modules/next/dist/docs.
No se encontró estructura local de migraciones, archivos SQL ni configuración
versionada de Supabase. Los clientes TypeScript no constituyen un esquema.

Evidencia parcial del código:

- README y src/lib/public-invitation-data.ts esperan una relación events.
  Su selección pública enumera campos actuales esperados, sin campos WhatsApp.
- src/types/event.ts declara un contrato de aplicación, no tipos generados del
  catálogo remoto. Sus campos WhatsApp opcionales solo preparan el código local.
- src/app/dashboard/nueva/actions.ts inserta directamente en events;
  src/app/dashboard/[slug]/editar/actions.ts actualiza directamente esa relación.
  Ambas usan validateInvitationForm; no se conectó validateEventWhatsApp.
- Se referencian get_public_guest_invitation y submit_public_rsvp, pero no están
  disponibles sus definiciones SQL, permisos, dependencias ni configuración.
- El código espera también event_guests y rsvps. No verifica su estructura real.
- No hay definiciones locales suficientes de vistas, triggers, RLS o GRANT.

## Propuesta no ejecutable

Sobre la relación real de eventos, una vez identificada: whatsapp_number como
texto opcional/nullable, sin número predeterminado; whatsapp_primary como
booleano con valor seguro false. No es DDL ni una migración aprobada.

Se conserva el contrato local existente: entrada internacional explícita con +,
código de país, espacios y guiones; salida solo dígitos, de 8 a 15, primer dígito
distinto de cero. Rechaza letras, extensiones, prefijos 00 y formatos ambiguos.
No comprueba titularidad ni existencia de una cuenta WhatsApp. La prioridad
requiere número válido y booleano estrictamente true. Un evento sin configuración
no hereda destinatario ni prioridad de otro.

El número de la demo permanece exclusivamente en DemoRSVP y sus pruebas; los
consumidores de ese componente son las rutas demo. No es valor predeterminado
del contrato de eventos ni se añadió a eventos reales.

## Metadatos exactos necesarios antes de preparar SQL

Proporcionar solo definiciones de esquema sanitizadas, nunca filas de usuarios,
invitados, mensajes, teléfonos reales, tokens o claves:

1. Esquema y nombre cualificado de la relación real de eventos, tipo de relación
   (tabla/vista), propietario y versión de PostgreSQL.
2. Lista completa de columnas: nombre, tipo cualificado, nulabilidad, default,
   identity/generated; PK, UNIQUE, CHECK, FK con acciones e índices actuales.
3. Estructura y herramienta de migraciones; convención de nombres, historial de
   versiones aplicadas y baseline correspondiente al entorno objetivo.
4. Firmas y definiciones completas de funciones/RPC de creación y edición, si
   existen; confirmar si las escrituras directas locales son el flujo vigente.
5. Definiciones de get_public_guest_invitation y submit_public_rsvp: argumentos,
   retornos, lenguaje, SECURITY DEFINER/INVOKER, search_path y propietario.
6. Definiciones de vistas, vistas materializadas, funciones, triggers y consultas
   públicas que dependan de eventos, incluidas dependencias de tipos compuestos
   o SELECT *, y esquemas expuestos por la API.
7. Estado ENABLE/FORCE RLS y todas las políticas aplicables: nombre, roles,
   comando, modo permisivo/restrictivo, USING y WITH CHECK.
8. GRANT/REVOKE efectivos y privilegios por defecto para esquemas, tablas,
   columnas, secuencias y funciones; roles anon, authenticated y roles de
   servidor implicados, sin credenciales.
9. Relaciones y dependencias con propietarios, invitados, RSVP, métricas,
   historial y check-in que una modificación del contrato pudiera afectar.

## Orden seguro futuro y reversión

1. Revisar los metadatos y resolver discrepancias entre código e inventario real.
2. Diseñar y revisar migración aditiva, restricciones, permisos públicos mínimos
   y compatibilidad de funciones/vistas. No usar un destinatario de demostración
   ni rellenar números en eventos existentes.
3. Preparar respaldo y reversión conforme a la herramienta real; ensayar en un
   entorno aislado con datos ficticios y verificar propietario/evento/rol.
4. Solo con autorización futura, aplicar primero la ampliación compatible del
   esquema; después las selecciones explícitas y las acciones validadas; por
   último habilitar los controles del dashboard y la preferencia.
5. Verificar defaults, eventos anteriores, aislamiento, permisos y que WhatsApp
   no inserte RSVP ni altere métricas antes de habilitarlo a usuarios.

Ante un fallo, revertir primero la aplicación a lecturas/escrituras anteriores
y deshabilitar la opción. Mantener inicialmente las columnas aditivas para no
perder configuración; restaurar definiciones/permisos previos si se cambiaron.
Eliminar columnas solo tras revisar dependencias, preservar datos y obtener
autorización explícita. No se entrega SQL de reversión sin esquema verificado.

## Preparación local y límites de prueba

Se reutilizan isWhatsAppNumber, normalizeWhatsAppInput y validateEventWhatsApp.
Se extraen canWhatsAppBePrimary y encodeWhatsAppMessage al mismo módulo puro.
WeddingRSVP usa estas funciones; conserva su validación y el flujo RSVP existente.
PublicInvitation, las consultas, inserciones, actualizaciones y RPC no cambian.
Abrir WhatsApp tiene un botón sin href, validación previa, protección de un
segundo entre intentos y avisos de apertura. Los campos inválidos se conservan.
Un retorno null de window.open con noopener no demuestra que la pestaña falló;
el aviso es condicional y RSVP continúa disponible.

Las pruebas unitarias y de manejadores de componentes usan hooks, respuestas
Supabase y window.open simulados. No son integración remota, montaje DOM real,
validación nativa del navegador ni prueba de entrega de WhatsApp. La llamada a
submit_public_rsvp permanece únicamente en el envío RSVP separado.

En esta sesión no se consultaron filas personales, no se ejecutaron RPC remotas
ni escrituras en Supabase. No se instalaron dependencias, cambiaron variables de
entorno ni realizaron commits, push, despliegues o validación en navegador.

Siguiente bloque pequeño: revisar exclusivamente los metadatos sanitizados de
los puntos 1 a 9 y acordar el contrato de migración; continuar bloqueando SQL y
persistencia hasta que esa evidencia sea suficiente.

## Estado inicial de Git

Rama: codex/liam-visual-effects; commit: c3839f582396d5797588b6545fd4fc9e095e1422.
18 modificados y 16 nuevos, todos preexistentes.

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
?? docs/whatsapp-real-local.md
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


## Verificación final

- npm test: 15 archivos y 176 pruebas aprobadas; código de salida 0.
- npm run lint: aprobado sin errores ni advertencias; código de salida 0.
- node node_modules/typescript/bin/tsc --noEmit: aprobado; código de salida 0.
- npm run build: aprobado con Next.js 16.3.3; código de salida 0. Compilación
  en 7,9 minutos, TypeScript interno en 2,3 minutos y 20 páginas generadas.
  Las rutas de invitaciones reales quedaron dinámicas. La duración prolongada
  no se presenta como un fallo ni se atribuye a una causa no demostrada.
- git diff --check: sin errores de whitespace. Git emitió avisos de conversión
  LF/CRLF sobre archivos locales preexistentes; no se normalizaron esos archivos.
- Comparación SHA-256 con el estado inicial: de los 34 archivos preexistentes
  modificados/nuevos, solo variaron src/lib/event-whatsapp.ts,
  src/lib/event-whatsapp.test.ts y src/components/wedding-demo/WeddingRSVP.tsx.
- Nuevos documentos: docs/whatsapp-schema-blocker.md y
  docs/whatsapp-local-delivery.md. Este último contiene los bloques completos
  de los archivos cambiados en esta sesión, con rutas para copiar en VS Code.

Las pruebas conservadas cubren número válido, normalización, formatos y extensiones
inválidos, ausencia de número, prioridad sin número, acción principal/alternativa,
respuestas afirmativa y negativa, cantidad condicional, mensaje opcional,
codificación, pases personalizados, doble pulsación, fallos de apertura,
ausencia de llamadas RPC/fetch en la acción WhatsApp e aislamiento entre eventos.
Las nuevas pruebas cubren límites de longitud, prioridad estrictamente booleana
y el formateador puro extraído. No hubo validación en navegador ni integración real.
