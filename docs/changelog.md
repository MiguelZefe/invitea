# Changelog

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
