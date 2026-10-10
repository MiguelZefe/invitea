# Invitación de Elizabeth y Alonso

Actualizado: 9 de octubre de 2026. Trabajo separado del evento de Liam y de
la oferta sencilla de $99 MXN. El usuario confirmó la fecha de 2026 y la
autorización de la pareja para publicar nombres, fotos y ubicaciones.

## Datos confirmados

- Boda: 17 de octubre de 2026.
- Ceremonia: 9:30 a. m., Registro Civil No. 30, San Juan de Dios y Coscomate
  s/n, Toriello Guerra, Tlalpan, C. P. 14050.
- Recepción: 3ra cerrada de Encinos #29, San Miguel Topilejo. Hora por
  confirmar; no se muestra un horario inventado.
- Las dos ligas de Google Maps son exactamente las proporcionadas por el
  usuario. La herramienta web no pudo abrir las ligas cortas, por lo que
  falta confirmar manualmente que cada una apunta al acceso correcto.

## Implementación

- Invitación real: `/boda/elizabeth-y-alonso`. Tiene portada animada, cuenta
  regresiva con horario de Ciudad de México, ceremonia y recepción, galería
  de cuatro fotografías con ampliación, y música que inicia solo al pulsar
  «Escuchar música». El `meta robots` es `noindex, nofollow` para evitar
  indexar nombres, fotos y domicilio mientras el enlace se distribuye a los
  invitados.
- Plantilla general: `/muestras/boda/editorial`, enlazada como tercer estilo
  desde `/muestras/boda`. Usa datos ficticios; permite modificar nombres,
  fecha, hora, lugares, mensaje y hasta cuatro fotos para una vista local. No
  guarda ni publica esas ediciones. Las iniciales de la portada y de la carta
  se actualizan con los nombres editados.
- Las fotografías recibidas se copiaron a `public/images/wedding-elizabeth-alonso`.
  Se comprobó que las cuatro copias no contienen EXIF. La foto del bosque se
  reescribió para quitar cuatro entradas EXIF de la original. No se alteraron
  los archivos fuente del usuario.
- La pista `public/music/wedding-story-original.wav` es una composición
  instrumental original generada localmente por
  `scripts/generate-wedding-score.py`. La canción comercial adjunta de Dragon
  Ball GT **no se incorporó** al sitio.
- No se añadieron cobros, RSVP, check-in real, base de datos ni mensajes
  automáticos. Esta boda no se anuncia como parte de la oferta de $99 MXN.

## Verificación local

- 281 pruebas en 28 archivos, lint y TypeScript aprobados.
- Compilación aislada de producción aprobada con la boda y la plantilla como
  rutas estáticas. El laboratorio comercial siguió mostrando 404.
- Navegador real: se observaron datos, fotos y enlaces de ubicación en la
  invitación; el audio cambió a estado «Pausar música» después de pulsarlo;
  la segunda foto abrió el visor y Escape lo cerró. La muestra ficticia
  actualizó los nombres y ambos monogramas inmediatamente al editarlos.
- En vista emulada de 390 × 844, la invitación y galería fueron legibles y
  el ancho de documento medido coincidió con el ancho disponible (375 CSS px),
  sin desbordamiento horizontal. Se observó `noindex, nofollow` y la fuente
  de audio original en el DOM. Esto no equivale a una prueba en teléfono físico
  ni a una auditoría completa de accesibilidad o tráfico de red.
- En la vista pública se observó el sello de portada demasiado cerca de la
  frase principal. Se movió dentro de la portada y se revisó visualmente el
  resultado en una compilación aislada de producción.

## Publicación comprobada

- Los commits `7d204bb` y `4517341` se subieron a `codex/commercial-local` y
  `main`. Los despliegues de vista previa y producción de Vercel terminaron
  en estado `Ready`.
- Se abrió en navegador real
  `https://www.zefeinvita.com.mx/boda/elizabeth-y-alonso` con la portada final,
  los datos confirmados, cuatro fotos, música original activada por clic y
  `noindex, nofollow`. La galería y el audio respondieron en producción.
- `https://www.zefeinvita.com.mx/muestras/boda` enlaza la plantilla editorial;
  `https://www.zefeinvita.com.mx/muestras/boda/editorial` abrió con datos
  ficticios. Las ediciones de muestra permanecen locales en la página.
- El despliegue no implica que se hayan comprobado en un teléfono físico los
  destinos de las dos ligas cortas de Maps ni una auditoría de red completa.

## Pendiente antes de distribuir a invitados

- Confirmar la hora de recepción y editarla cuando la pareja la comunique.
- Abrir ambas ligas de Maps en un teléfono y comprobar el acceso exacto.
- Revisar texto, nombres, fotos y reproducción musical con la pareja en un
  teléfono físico.

## Ajuste visual del 9 de octubre de 2026

- Se retiraron los dos bordes curvos que parecían líneas sueltas sobre el
  fondo de la carta. Se añadieron corazones animados y discretos detrás de la
  portada y la carta; no capturan clics y dejan de animarse cuando el navegador
  solicita movimiento reducido.
- La compilación aislada de producción pasó. En navegador real se comprobó la
  ausencia de los bordes, la animación de los corazones y que la vista móvil
  de 390 px no desborda horizontalmente. Pasaron 281 pruebas, lint y TypeScript.
- La pista pública permanece como composición original instrumental hasta
  aclarar los derechos de uso del MP3 solicitado posteriormente.
