# INVITEA v1.0

INVITEA es una plataforma de invitaciones digitales para eventos. Permite a compradores autenticados crear y administrar invitaciones, gestionar invitados y operar el acceso al evento desde un dashboard privado.

## Funcionalidades

- Autenticación de compradores con Supabase.
- Creación, edición y eliminación de invitaciones.
- Invitación pública por slug.
- Plantillas diferenciadas para boda y baby shower.
- Conteo regresivo real compatible con fechas en español e ISO.
- Gestión de invitados y pases máximos.
- Enlaces y códigos QR individuales por invitado.
- Invitaciones públicas personalizadas mediante guest token.
- RSVP ligado al invitado y validado mediante RPC.
- Dashboard de confirmaciones y exportación CSV.
- Check-in manual o mediante cámara, registro de salida y reingreso.
- Prevención de movimientos duplicados y manejo de excepciones RSVP.
- Conteo operativo de personas y grupos actualmente dentro del evento.

## Tecnologías

- Next.js 16 con App Router.
- React 19 y TypeScript.
- Tailwind CSS 4.
- Supabase Auth y PostgreSQL con RLS.
- `qrcode` para generar códigos QR.
- `qr-scanner` para lectura mediante cámara.
- Vercel como plataforma de despliegue.

## Requisitos

- Node.js 20.9 o posterior.
- npm.
- Un proyecto de Supabase configurado.

## Configuración local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env.local`.

3. Completa las variables con las credenciales públicas de tu proyecto Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   AUTH_RECOVERY_MARK_SECRET=
   ```

   `AUTH_RECOVERY_MARK_SECRET` debe ser un secreto aleatorio de al menos 32
   caracteres. Solo se usa en el servidor para proteger el flujo de
   recuperación y nunca debe llevar el prefijo `NEXT_PUBLIC_`.

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

5. Abre `http://localhost:3000`.

La demo de baby shower está disponible en
`http://localhost:3000/demo/baby-shower`. Los eventos cuyo tipo contiene
“Baby shower” seleccionan automáticamente esa plantilla.

`.env.local` contiene configuración local y no debe subirse al repositorio. `.env.example` solo documenta los nombres requeridos y no contiene valores reales.

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run lint     # Análisis estático con ESLint
npm test         # Pruebas unitarias y de regresión
npm run build    # Build y comprobación de TypeScript para producción
npm run start    # Ejecuta localmente el build de producción
```

## Requisitos de Supabase

La base de datos debe incluir, como mínimo:

- `events` relacionado con el comprador mediante `owner_id`.
- `event_guests` relacionado con `events` mediante `event_id`.
- `rsvps` relacionado opcionalmente con `event_guests` mediante `guest_id`.
- Columnas de acceso `checked_in_at` y `checked_in_count`. La primera conserva
  la entrada más reciente; después de una salida, `checked_in_count` vuelve a
  `null` para indicar que el grupo ya no está dentro.
- Políticas RLS para restringir las operaciones privadas al propietario.
- RPC `get_public_guest_invitation` para consultar datos públicos mínimos.
- RPC `submit_public_rsvp` para validar tokens, pases e inserción de RSVP.

No se debe utilizar una service role key en el navegador ni en variables con prefijo `NEXT_PUBLIC_`.

## Despliegue en Vercel

1. Importa el repositorio desde GitHub.
2. Configura Node.js 20.9 o posterior.
3. Agrega las variables de `.env.example` en los entornos Production y Preview.
4. Ejecuta el build de Vercel con `npm run build`.
5. Confirma que Supabase tenga las URLs de producción permitidas cuando corresponda.
6. Realiza una prueba funcional completa en un deployment Preview.
7. Configura el dominio definitivo.
8. Genera nuevos QR o verifica que sus enlaces usen el dominio final.
9. Prueba la cámara de check-in desde HTTPS en un dispositivo real.

## Checklist de verificación

- Login y logout.
- Crear, editar y eliminar una invitación.
- Crear invitados y generar enlaces/QR.
- Abrir invitaciones generales y personalizadas.
- Registrar y actualizar RSVP.
- Consultar y exportar confirmaciones.
- Ejecutar check-in manual y con cámara, check-out y reingreso.
- Validar límites de pases, RSVP declinado y movimientos duplicados.

## Seguridad

- Las claves secretas no deben exponerse con prefijo `NEXT_PUBLIC_`.
- Las Server Actions vuelven a validar sesión y propiedad del evento.
- El acceso a invitados privados depende de RLS.
- Los tokens individuales funcionan como credenciales de acceso y deben tratarse como datos sensibles.
