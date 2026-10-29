# ZefeInvita — estado del proyecto

**Corte: 29 de octubre de 2026.** Rama de trabajo: `codex/commercial-local`, commit de código publicado `14cdb68`. Este resumen distingue la última publicación verificada del trabajo sin commit que sigue solo en local. El historial detallado permanece en `docs/plan-comercial-99.md`; `docs/project-status.txt` corresponde a una etapa anterior.

## Oferta pública y muestras

- La portada ofrece una invitación sencilla de **$99 MXN** para cumpleaños y bautizo, con solicitud asistida por WhatsApp. La transferencia, el alcance y la entrega se acuerdan con el cliente; no existe cobro automático.
- Las muestras abarcan cumpleaños, bautizo, baby shower, boda, XV años, primera comunión, graduación y aniversario. Las otras seis categorías se presentan como proyectos por cotizar, separados de la oferta de $99 MXN.
- Hay cinco plantillas nuevas por categoría (40 en total). El catálogo completo muestra 12 estilos de cumpleaños; 9 de bautizo; 8 de baby shower; 9 de boda contando la historia editorial; 9 de XV años; y 8 de primera comunión, graduación y aniversario cada una.
- Las plantillas permiten cambiar texto, fecha, hora, lugar, paleta, tipografía, composición y secciones visibles. La foto y música elegidas en la muestra son temporales y locales. El QR y el check-in de las muestras son ficticios; el servicio real requiere cotización e implementación separadas.
- Las tarjetas y vistas previas tienen movimiento de brillo, confeti, pétalos, resplandor u órbita. «Noche dorada» anima su ilustración. El conteo tiene efectos elegibles y las animaciones respetan la preferencia de movimiento reducido.
- Las primeras cinco opciones de cada celebración tienen una portada ilustrada propia (40 en total, nueve existentes y 31 nuevas). Las ocho muestras sugieren una de tres melodías originales y permiten probar audio local o un enlace de canción o lista de Spotify o YouTube Music, con carga externa solo al solicitarla. El audio y enlaces probados no se guardan ni se publican automáticamente.

## Invitación de boda específica

La ruta de Elizabeth y Alonso es una invitación distinta del catálogo genérico. Conserva sus datos, fotos y música autorizados por el cliente. En local hay un ajuste pendiente de publicar para que, después de la fecha, el conteo indique que la celebración ya ocurrió. No se alteró el evento de Liam en esta entrega.

## Trabajo local que no debe entrar aún en producción

- El laboratorio comercial sigue siendo una ruta de desarrollo. Hay cambios locales para caducar el borrador del navegador a los 30 minutos y enlazar muestras de las ocho categorías; no existe persistencia de servidor ni conservación real con cuenta.
- También hay cambios locales de redirección desde registro e inicio de sesión hacia `/laboratorio-comercial`. Esa ruta responde **404 en producción**, por lo que este flujo no está listo para publicarse.
- La compra del laboratorio es simulada; no cobra ni autoriza publicar. No hay migraciones de base de datos ni pagos nuevos en este bloque.
- Los cambios locales de laboratorio y acceso siguen separados de las muestras publicadas. No hay conservación real de borradores mediante cuenta.
- La historia editorial usa enlaces de mapa ficticios y hay un ajuste local del mensaje del contador de la boda de Elizabeth y Alonso después de la fecha. El evento de Liam permanece fuera de estos cambios.

## Verificación del 26 de octubre

- **Automatizada:** 295 pruebas en 30 archivos, ESLint y TypeScript pasaron. La compilación aislada de producción terminó correctamente.
- **HTTP local de producción:** portada y ocho rutas de muestras respondieron 200; `/laboratorio-comercial` respondió 404.
- **Navegador local:** se inspeccionaron el catálogo y una plantilla nueva de boda a 390 CSS px. El documento midió 375 CSS px frente a 390 CSS px de viewport; no apareció desbordamiento horizontal en esos recorridos. Se seleccionó «Votos de champaña» y se observó su vista previa. En una revisión anterior del mismo bloque se observaron «Noche dorada» y sus efectos en escritorio.
- Esta evidencia no constituye auditoría completa en teléfono físico, accesibilidad o tráfico de red. No se consultó Supabase remoto ni se leyó `.env.local`.

## Publicación del 26 de octubre

El commit `c4e0711` se subió a `codex/commercial-local` y `main`. Vercel marcó como **Ready** los despliegues Preview y Production de ese commit. En el navegador se abrió `https://www.zefeinvita.com.mx/muestras/cumpleanos` y se observaron las 12 opciones del catálogo y los controles de personalización. Esta comprobación acredita la publicación de esa ruta; no equivale a un recorrido completo de las ocho categorías en producción.

## Verificación posterior del mismo día

El detalle de las portadas y del audio está en el plan comercial. En local pasaron 312 pruebas en 31 archivos, ESLint, TypeScript y la compilación aislada de producción. Las ocho muestras respondieron HTTP 200 y el laboratorio respondió 404. El navegador mostró una lista de YouTube Music cargada por acción del visitante y el rechazo de un enlace con dominio falso. El commit `0806731` se subió a las ramas comercial y principal; Vercel marcó Preview y Production como Ready. Se abrió la muestra pública de bautizo y se observó el catálogo ilustrado y el control de música; la captura está en `docs/evidence/public-bautizo-0806731.png`. Siguen pendientes una revisión en teléfono físico y la inspección completa del tráfico de red.

## Prueba local de facilidad de uso — 29 de octubre

- En un navegador con pantalla emulada de 390 × 844 y 320 × 700 CSS px se recorrió la muestra de primera comunión como un visitante nuevo: editar nombre, fecha y lugar, ver la carta, abrirla y elegir otra plantilla sin perder el nombre. Desde la portada local también se abrió cumpleaños.
- Se corrigieron tres obstáculos observados: los datos básicos quedaban a más de 3 000 px del inicio, la carta abierta dejaba los nombres fuera de la pantalla y un nombre corto o el control de música ocupaban mal el ancho de 320 px. Tras los cambios, el nombre quedó alrededor de 632 px del inicio; no se midió desbordamiento horizontal a 320 px.
- Pasaron 22 pruebas enfocadas de muestras. En el corte documental también pasaron las **316 pruebas de la suite completa en 31 archivos**, ESLint sobre `src` y TypeScript. No se repitió la compilación aislada de producción del árbol local actual. Las capturas están en `docs/evidence/local-mobile-novice-2026-10-29-390-form.png` y `docs/evidence/local-mobile-novice-2026-10-29-320-preview.png`. Esta prueba no equivale a un teléfono físico, auditoría completa de accesibilidad ni inspección de red.
- Git conserva 17 archivos de código modificados sin commit sobre `0c78e23`. Este corte es documental y local: no se hizo commit, push ni despliegue; no se leyó `.env.local` ni se consultó Supabase remoto. La publicación verificada más reciente que consta en los documentos sigue siendo la del 26 de octubre.

## Siguientes pasos

1. Probar el recorrido de venta en un teléfono físico y completar navegación por teclado, accesibilidad y captura de red; revisar las ocho categorías. Las variantes posteriores a las primeras cinco de cada evento todavía usan composiciones y efectos CSS sin portada ilustrada propia.
2. Para cualquier entrega posterior de laboratorio, acceso o boda, separar sus cambios y ejecutar la compilación aislada de producción correspondiente.
3. Definir y probar la conservación real de borradores con cuenta antes de enlazar registro con el laboratorio. Aclarar vencimiento y eliminación en servidor si se ofrecen demos reales.
4. Separar la cotización de boda, álbum y check-in del paquete sencillo; acordar precio y operación de cada complemento antes de activar cobro.

## Publicación acotada del 29 de octubre

El commit `14cdb68` contiene exclusivamente cuatro archivos de muestras. La
compilación aislada de producción pasó; portada y ocho muestras respondieron
200 y el laboratorio 404. Vercel marcó Ready los despliegues Preview y
Production de ese commit. En el dominio público se verificaron cumpleaños con
sus campos esenciales y el acceso a la invitación, primera comunión con el
nombre editado visible en la portada y el laboratorio con página 404. La
[captura pública de cumpleaños](evidence/public-cumpleanos-14cdb68.jpg)
documenta la vista observada. Siguen pendientes teléfono físico, auditoría
completa de accesibilidad, tráfico de red y recorridos de todas las variantes.
Los 13 archivos de código locales restantes, de laboratorio, acceso y boda,
no entraron en este despliegue. Liam no fue modificado.
