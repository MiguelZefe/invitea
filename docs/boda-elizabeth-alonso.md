# Invitación de Elizabeth y Alonso

Actualizado: 12 de octubre de 2026. Trabajo separado del evento de Liam y de
la oferta sencilla de $99 MXN. El usuario confirmó la fecha de 2026 y la
autorización de la pareja para publicar nombres, fotos y ubicaciones.

## Datos confirmados

- Boda: 17 de octubre de 2026.
- Ceremonia: 9:30 a. m., Registro Civil No. 30, San Juan de Dios y Coscomate
  s/n, Toriello Guerra, Tlalpan, C. P. 14050.
- Recepción: 3ra cerrada de Encinos #29, San Miguel Topilejo. Hora por
  confirmar; no se muestra un horario inventado. La **comida será a las
  3:00 p. m.** en la recepción; esta hora no se presenta como inicio de la
  recepción.
- Las ligas de Google Maps son las proporcionadas por el usuario. El usuario
  confirmó que la liga actual de recepción marca la entrada correcta; sigue
  pendiente comprobar el acceso exacto de la ceremonia.
- Papás de Elizabeth: Laura López Ramírez y José López Jorge. Papás de Alonso:
  Rutilio Zeno Tamaniz y Hortensia Ramos Carrillo.

## Implementación

- Invitación real: `/boda/elizabeth-y-alonso`. Tiene portada animada, cuenta
  regresiva con horario de Ciudad de México, ceremonia y recepción, galería
  de cuatro fotografías con ampliación, y música que intenta reproducirse al
  cargar. Si el navegador bloquea el inicio automático, vuelve a intentarlo
  cuando el invitado abre la carta; un botón fijo permite escuchar o pausar
  manualmente. El `meta robots` es `noindex, nofollow` para evitar
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
- Comprobar en un teléfono el acceso exacto de la liga de la ceremonia. La
  entrada de la recepción fue confirmada por el usuario, sin prueba propia en
  teléfono físico.
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
  prueba en teléfono físico.
- El commit `1ac38d9` se subió a `codex/commercial-local` y `main`. Vercel
  marcó los despliegues de vista previa y producción como `Ready`. En
  `https://www.zefeinvita.com.mx/boda/elizabeth-y-alonso` se observó la sección
  de confirmación con el número y el enlace correctos; al pulsar «Escuchar
  música», el MP3 público cargó y se reprodujo sin error. No se abrió WhatsApp
  ni se envió ningún mensaje.

## Familia, contacto de la novia y recepción del 12 de octubre de 2026

- El usuario confirmó la grafía **Laura López Ramírez** para la mamá de
  Elizabeth. También proporcionó los nombres de los papás de Alonso:
  **Rutilio Zeno Tamaniz** y **Hortensia Ramos Carrillo**. Se añadieron en una
  sección propia después de la carta, sin inventar el nombre del papá de la
  novia.
- Se añadió el WhatsApp de Elizabeth, **+52 1 55 8701 0907**, como opción
  principal de confirmación. El enlace usa `wa.me/5215587010907` y un mensaje
  prellenado que cada invitado decide enviar. El contacto 55 2561 3131 sigue
  disponible como alternativa; no se envía ni almacena ninguna confirmación
  automáticamente. La muestra editorial no expone nombres ni contactos reales.
- La recepción usa ahora la liga `https://maps.app.goo.gl/CrJ5VTA8n45dCDkQ6`
  proporcionada por el usuario, con la dirección escrita y la hora pendiente
  sin cambios. Al abrirla en navegador, Maps mostró coordenadas en San Miguel
  Topilejo, pero no el domicilio escrito como etiqueta del punto. El usuario
  confirmó después que ese punto marca la entrada correcta de la recepción;
  esta confirmación es información proporcionada por él, no una comprobación
  independiente en el lugar.
- Validación local: 281 pruebas en 28 archivos, lint, TypeScript y compilación
  aislada de producción aprobaron. En navegador local se observaron las
  tarjetas familiares, ambos enlaces de WhatsApp y el nuevo destino de Maps.
  En vista móvil emulada de 390 px, los textos y controles fueron legibles y
  el documento no desbordó horizontalmente. La muestra ficticia no mostró
  los datos de la pareja. No se probó un teléfono físico ni se envió un mensaje.
- El commit `30046f6` se publicó en `codex/commercial-local` y `main`.
  Vercel marcó la vista previa y producción como `Ready`. En la URL pública
  se comprobaron los tres nombres, ambos contactos y el nuevo enlace de
  recepción. La captura pública mostró el botón de Elizabeth como acción
  principal. No se abrió WhatsApp ni se envió una confirmación.

## Animaciones de la invitación del 12 de octubre de 2026

- Se reforzó la portada de la boda y su plantilla editorial con acercamiento
  lento de la fotografía, reflejos cálidos y destellos, marco luminoso,
  corazones más visibles y entrada escalonada del texto y del botón. Al abrir
  la invitación, la carta se despliega con mayor profundidad; las tarjetas y
  fotos aparecen al entrar en pantalla en navegadores compatibles. Todo el
  contenido permanece visible en navegadores sin soporte para animación al
  desplazarse. La preferencia de movimiento reducido desactiva estos efectos.
- No cambiaron fecha, lugares, fotos, música, teléfonos, mapas ni la hora de
  recepción pendiente. Los adornos no interceptan clics ni forman parte de la
  lectura accesible.
- Verificación local: 281 pruebas en 28 archivos, lint, TypeScript y build
  aislado de producción aprobados. La primera ejecución de Vitest no inició
  pruebas por un error de permisos en la carpeta temporal de Windows; pasó al
  repetirla con una carpeta temporal dentro del proyecto. En navegador real
  se observaron la portada, la apertura de la carta y la galería; en vista
  móvil emulada de 390 px se comprobaron el texto y los controles sin
  desbordamiento horizontal (ancho de documento de 375 CSS px). Esto no es
  una prueba en teléfono físico ni una auditoría completa de accesibilidad.
- Publicación: el commit `953da83` se subió a `codex/commercial-local` y
  `main`. Vercel mostró ambos despliegues como `Ready`. En
  `https://www.zefeinvita.com.mx/boda/elizabeth-y-alonso` se comprobó que la
  portada sirve el nuevo reflejo animado y 14 corazones, conserva
  `noindex, nofollow` y abre la carta al pulsar el botón. La validación móvil
  citada arriba corresponde al navegador local emulado, no a un teléfono
  físico ni a la página pública.

## Comida y control de música del 12 de octubre de 2026

- El usuario confirmó comida a las **3:00 p. m.** en la recepción. Se muestra
  como horario de comida dentro de esa tarjeta; el inicio de recepción sigue
  indicado como pendiente. No se modificaron fecha ni hora de la ceremonia,
  ubicaciones, enlaces, fotos, contactos o la grabación autorizada.
- La invitación real intenta reproducir la canción al cargar. Los navegadores
  pueden bloquear audio automático: al abrir la carta se hace un segundo
  intento como respuesta al clic, y el visitante dispone siempre del botón
  «Escuchar música / Pausar música» fijo abajo a la izquierda. Una pausa
  manual no se revierte al volver a abrir la carta. La plantilla ficticia no
  intenta iniciar música automáticamente.
- Se ajustó la presentación de la comida y del control flotante, con foco
  visible y animación del icono desactivada al solicitar movimiento reducido.
- Verificación local: 281 pruebas en 28 archivos, lint, TypeScript y build
  aislado de producción aprobados. En el navegador, el audio automático fue
  bloqueado al cargar la ruta local, comenzó al pulsar «Abrir invitación» y
  pudo pausarse y reanudarse con el botón fijo. En vista emulada de 390 × 844,
  la tarjeta mostró «Comida · 3:00 p. m.» separada del inicio pendiente; el
  botón quedó visible y el documento no desbordó horizontalmente (375 CSS px
  útiles). La muestra editorial conservó datos ficticios, sin horario de
  comida ni reproducción automática. Falta comprobar un teléfono físico y
  el comportamiento del audio en otros navegadores.
- Publicación: el commit `931174b` se subió a `codex/commercial-local` y
  `main`; Vercel mostró los despliegues de vista previa y producción como
  `Ready`. En la vista previa y en
  `https://www.zefeinvita.com.mx/boda/elizabeth-y-alonso` se observó la comida
  a las 3:00 p. m., la hora de inicio aún pendiente y el botón fijo. En la
  página pública el navegador bloqueó el audio al cargar y comenzó a
  reproducir el MP3 correcto al pulsar «Abrir invitación». Se conservó
  `noindex, nofollow`. No se verificó el comportamiento en todos los
  navegadores ni en un teléfono físico.

## Ajuste de texto en recepción del 12 de octubre de 2026

- Por petición del usuario, se retiró «Inicio por confirmar» de la tarjeta de
  recepción. El inicio sigue sin horario proporcionado, por lo que la tarjeta
  muestra la dirección y el dato confirmado «Comida · 3:00 p. m.» sin atribuir
  esa hora a la llegada. La muestra editorial tampoco muestra el aviso.
- Verificación local: pasaron 281 pruebas en 28 archivos, lint, TypeScript y
  compilación aislada de producción. En navegador se observó la tarjeta sin
  el aviso, con dirección, hora de comida y enlace de ubicación conservados.

## Papá de Elizabeth y tarjetas familiares del 12 de octubre de 2026

- El usuario proporcionó el nombre **José López Jorge** para el papá de la
  novia. Se añadió junto a Laura López Ramírez bajo «Papás de Elizabeth».
  Los nombres de los papás de Alonso permanecen en su propia tarjeta. La
  muestra editorial ficticia no incorpora datos de esta familia.
- Las dos tarjetas usan ahora monogramas de Elizabeth y Alonso y un separador
  discreto entre nombres para mejorar la lectura en escritorio y móvil.
- Verificación local: 281 pruebas en 28 archivos, lint, TypeScript y build
  aislado de producción aprobados. En navegador real se observaron los cuatro
  nombres y las dos tarjetas; en vista móvil emulada de 390 × 844 se leyeron
  completos y el documento no desbordó horizontalmente (375 CSS px útiles).
  No se probó en un teléfono físico.
