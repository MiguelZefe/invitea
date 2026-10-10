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
- En la primera publicación, la pista `public/music/wedding-story-original.wav`
  era una composición instrumental generada localmente por
  `scripts/generate-wedding-score.py`; el MP3 adjunto no se incorporó en esa etapa.
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
- En ese despliegue, la pista pública permaneció como composición instrumental
  mientras se aclaraban los derechos de uso del MP3 solicitado posteriormente.

## Música y confirmación del 9 de octubre de 2026

- El usuario afirmó que puede publicar el MP3 proporcionado y que es original
  y libre de derechos. Sobre la base de esa declaración, se copió sin alterar
  a `public/music/elizabeth-alonso-original.mp3`; el hash SHA-256 de la copia
  coincide con el archivo entregado. No se verificó una licencia independiente.
- La invitación de Elizabeth y Alonso usa ahora ese MP3 al pulsar «Escuchar
  música». La muestra editorial ficticia conserva la pista instrumental WAV.
- Se añadió «Confirma tu asistencia» con el WhatsApp 55 2561 3131. El enlace
  abre un mensaje prellenado dirigido a `wa.me/525525613131`; el invitado debe
  revisarlo y enviarlo. No hay mensajes automáticos ni registro de RSVP en
  servidor. El contacto no aparece en la muestra ficticia.
- Verificación local: 281 pruebas en 28 archivos, lint y TypeScript aprobaron.
  La compilación aislada de producción terminó correctamente. En navegador
  local se observó la sección de confirmación y su destino, y al activar el
  audio el MP3 cargó sin error y pasó a reproducción. La muestra editorial
  mantuvo el WAV y no mostró el WhatsApp; el laboratorio siguió mostrando 404
  en esa compilación. No se comprobó el envío de un mensaje ni se realizó una
  prueba en teléfono físico. La publicación de este cambio se registra aparte
  cuando quede verificada.
