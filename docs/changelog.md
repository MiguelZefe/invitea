# Changelog

## 2026-10-05

### Muestras interactivas para venta asistida

* Cumpleaños y bautizo permiten probar nombre, fecha, hora y lugar; la
  previsualización y el enlace a Maps se actualizan al editar.
* El borrador de WhatsApp incluye solo los campos que la persona editó. Los
  datos de ejemplo no se envían como si fueran datos del evento; los vacíos y
  espacios quedan como «por confirmar».
* Se añadió restablecimiento de la muestra y se conserva el aviso de que la
  edición es local, temporal y no se envía hasta abrir WhatsApp.
* La llamada a pedido muestra el precio único de $99 MXN en ambas muestras.

La verificación local se registró en `docs/plan-comercial-99.md`: TypeScript,
lint y seis pruebas de ventas aprobados; edición real de ambas muestras en el
navegador móvil emulado, sin abrir WhatsApp. No se declara una auditoría completa
de accesibilidad, un dispositivo físico ni tráfico de red.

La suite completa del repositorio pasó después: 267 pruebas en 24 archivos y
`npm run lint` sin errores. No se ejecutó el build completo de Next ni un
despliegue; el destino Vercel no está enlazado en este checkout.

## 2026-09-09

* Unificación de la invitación corta de Liam y los enlaces personales/QR en una
  misma vista con fotografía, audio, calendario y RSVP real.
* Metadata por evento, fotografía al compartir Liam y URL canónica sin tokens.
* Distinción entre enlaces personales inválidos y fallos de conexión;
  confirmación inhabilitada cuando no se puede validar el invitado.
* Respaldo de los detalles de Liam ante fallos temporales de lectura, sin
  resucitar eventos eliminados ni mostrar confirmaciones falsas.
* Mensaje de RSVP con estado y número de asistentes, etiquetas accesibles
  y recuperación del botón ante errores de red.
* Textos de la plantilla baby shower parametrizados y proporción de foto corregida.
* Pruebas de regresión de renderizado, personalización, errores y metadata.
* El reproductor recupera el intento de audio tras la limpieza de efectos de
  React y retira el inicio automático también cuando se reproduce manualmente.

### Incidencia externa observada

El 9 de septiembre la dirección de Supabase configurada no resolvía en DNS
(`ENOTFOUND`) y la ruta dinámica de producción devolvía 404 antes del cambio.
La escritura real de RSVP queda pendiente de verificar cuando se restablezca
el servicio. No se cambiaron variables, esquema, funciones ni datos de Supabase.

## 2026-08-30

### Seguridad y estabilidad

* Refresco de sesión SSR mediante `proxy.ts` y `@supabase/ssr`.
* Validación de origen en el callback de autenticación.
* Consumo único del nonce de confirmación.
* Actualización de seguridad a Next.js 16.3.3.
* Mensajes públicos sin detalles internos de Supabase.

### Calidad

* Suite de regresión con Vitest para autenticación, proxy y formularios.
* Validación compartida y límites de longitud para invitaciones.
* Optimización de la galería con `next/image`.
* CTA de planes conectado al flujo de creación.
* Eliminación de clientes Supabase duplicados sin uso.

### Baby shower

* Nueva plantilla pastel con animaciones decorativas y soporte para movimiento reducido.
* Conteo regresivo real a partir de fechas en español o ISO y horarios de 12/24 horas.
* Detalles de fecha, hora, lugar, mapa, vestimenta y RSVP con textos específicos.
* Selección automática por tipo de evento y demo pública en `/demo/baby-shower`.
* Reemplazo del contador fijo de la plantilla de boda por el contador real compartido.

## 2026-06-14

### Agregado

* Integración con Supabase.
* Tabla `rsvps`.
* Formulario RSVP funcional.
* Inserción real de confirmaciones.
* Reproductor de música.
* Componentización de invitación demo.
