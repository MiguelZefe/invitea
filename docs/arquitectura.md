# Arquitectura de INVITEA

## Aplicación

INVITEA usa Next.js con App Router. Las páginas públicas muestran la landing,
la demo y las invitaciones por slug. Las páginas privadas viven bajo
`/dashboard` y vuelven a validar la sesión y la propiedad del evento antes de
leer o modificar información.

Los Client Components se limitan a interacción de interfaz, autenticación en
el navegador, RSVP público y escaneo QR. Las mutaciones administrativas se
ejecutan como Server Actions.

## Autenticación

Supabase Auth mantiene la sesión en cookies mediante `@supabase/ssr`.
`src/proxy.ts` refresca tokens únicamente en rutas relacionadas con auth,
cuenta y dashboard. El proxy no autoriza operaciones: cada página y Server
Action privada obtiene de nuevo el usuario y filtra por `owner_id`.

Los enlaces de confirmación aceptan TokenHash y conservan compatibilidad
temporal con enlaces PKCE anteriores. Los flujos sensibles restringen sus
destinos y orígenes a una allowlist explícita.

## Datos

La aplicación espera las tablas `events`, `event_guests` y `rsvps`. El acceso
público personalizado y el RSVP se delegan a las funciones
`get_public_guest_invitation` y `submit_public_rsvp` para evitar exponer
consultas privadas al navegador.

RLS, funciones, restricciones, índices y cascadas pertenecen al proyecto de
Supabase. Deben versionarse antes de considerar reproducible el entorno.

## Límites de seguridad

* No se usa una service role key en la aplicación web.
* Las claves publicables solo se usan con RLS habilitado.
* Los tokens de invitado se tratan como credenciales y no se registran.
* Los errores internos se registran en servidor y se traducen a mensajes
  públicos genéricos.
* Los ingresos y salidas usan actualizaciones condicionales para impedir
  movimientos duplicados o cruces entre dispositivos. `checked_in_at` conserva
  la entrada más reciente y `checked_in_count` representa la ocupación actual
  del grupo; un valor nulo después de una entrada indica que ya salió.

## Verificación

La suite Vitest cubre helpers de autenticación, marcas de recuperación,
matcher y cookies del proxy, y validación de invitaciones. El cierre de cada
bloque requiere además ESLint, TypeScript y `next build`.
