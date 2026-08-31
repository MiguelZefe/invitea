# Decisiones técnicas

## Next.js App Router

Se mantiene App Router y la convención `proxy.ts` de Next.js 16. Las páginas
privadas siguen autorizando dentro de su propia operación; el proxy se usa
solo para sincronizar la sesión.

## Supabase SSR

Se usa `@supabase/ssr` con clientes separados para navegador, servidor y
proxy. El proxy llama `getClaims()` para validar o refrescar el token y copia
cookies y encabezados ant caché tanto a la solicitud como a la respuesta.

## Autorización por propietario

Las mutaciones administrativas verifican usuario, slug y `owner_id`. Esto
complementa RLS y evita depender de una única capa de autorización.

## RSVP público

El navegador llama una RPC con datos mínimos. La validación final de token,
estado y límite de pases debe permanecer dentro de la transacción de base de
datos.

## Formularios de invitación

Creación y edición comparten validación de campos, longitudes y URLs HTTPS.
La interfaz refleja los mismos límites, pero el servidor sigue siendo la
fuente de verdad.

## Eliminaciones

La eliminación completa de un evento debe convertirse en una función
transaccional de base de datos o en archivado lógico. Hasta definir ese
contrato, no debe suponerse atomicidad entre eventos, invitados y RSVP.

## Pruebas

Vitest es el runner unitario. Los Server Components asíncronos y los flujos
con Supabase real requieren pruebas funcionales o E2E adicionales.
