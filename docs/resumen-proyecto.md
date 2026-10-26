# ZefeInvita — estado del proyecto

**Corte: 26 de octubre de 2026.** Rama de trabajo: `codex/commercial-local`. Este resumen distingue la oferta pública del trabajo que sigue solo en local. El historial detallado permanece en `docs/plan-comercial-99.md` y `docs/project-status.txt`.

## Oferta pública y muestras

- La portada ofrece una invitación sencilla de **$99 MXN** para cumpleaños y bautizo, con solicitud asistida por WhatsApp. La transferencia, el alcance y la entrega se acuerdan con el cliente; no existe cobro automático.
- Las muestras abarcan cumpleaños, bautizo, baby shower, boda, XV años, primera comunión, graduación y aniversario. Las otras seis categorías se presentan como proyectos por cotizar, separados de la oferta de $99 MXN.
- Hay cinco plantillas nuevas por categoría (40 en total). El catálogo completo muestra 12 estilos de cumpleaños; 9 de bautizo; 8 de baby shower; 9 de boda contando la historia editorial; 9 de XV años; y 8 de primera comunión, graduación y aniversario cada una.
- Las plantillas permiten cambiar texto, fecha, hora, lugar, paleta, tipografía, composición y secciones visibles. La foto y música elegidas en la muestra son temporales y locales. El QR y el check-in de las muestras son ficticios; el servicio real requiere cotización e implementación separadas.
- Las tarjetas y vistas previas tienen movimiento de brillo, confeti, pétalos, resplandor u órbita. «Noche dorada» anima su ilustración. El conteo tiene efectos elegibles y las animaciones respetan la preferencia de movimiento reducido.

## Invitación de boda específica

La ruta de Elizabeth y Alonso es una invitación distinta del catálogo genérico. Conserva sus datos, fotos y música autorizados por el cliente. En local hay un ajuste pendiente de publicar para que, después de la fecha, el conteo indique que la celebración ya ocurrió. No se alteró el evento de Liam en esta entrega.

## Trabajo local que no debe entrar aún en producción

- El laboratorio comercial sigue siendo una ruta de desarrollo. Hay cambios locales para caducar el borrador del navegador a los 30 minutos y enlazar muestras de las ocho categorías; no existe persistencia de servidor ni conservación real con cuenta.
- También hay cambios locales de redirección desde registro e inicio de sesión hacia `/laboratorio-comercial`. Esa ruta responde **404 en producción**, por lo que este flujo no está listo para publicarse.
- La compra del laboratorio es simulada; no cobra ni autoriza publicar. No hay migraciones de base de datos ni pagos nuevos en este bloque.

## Verificación del 26 de octubre

- **Automatizada:** 295 pruebas en 30 archivos, ESLint y TypeScript pasaron. La compilación aislada de producción terminó correctamente.
- **HTTP local de producción:** portada y ocho rutas de muestras respondieron 200; `/laboratorio-comercial` respondió 404.
- **Navegador local:** se inspeccionaron el catálogo y una plantilla nueva de boda a 390 CSS px. El documento midió 375 CSS px frente a 390 CSS px de viewport; no apareció desbordamiento horizontal en esos recorridos. Se seleccionó «Votos de champaña» y se observó su vista previa. En una revisión anterior del mismo bloque se observaron «Noche dorada» y sus efectos en escritorio.
- Esta evidencia no constituye auditoría completa en teléfono físico, accesibilidad o tráfico de red. No se consultó Supabase remoto ni se leyó `.env.local`.

## Publicación del 26 de octubre

El commit `c4e0711` se subió a `codex/commercial-local` y `main`. Vercel marcó como **Ready** los despliegues Preview y Production de ese commit. En el navegador se abrió `https://www.zefeinvita.com.mx/muestras/cumpleanos` y se observaron las 12 opciones del catálogo y los controles de personalización. Esta comprobación acredita la publicación de esa ruta; no equivale a un recorrido completo de las ocho categorías en producción.

## Siguientes pasos

1. Definir y probar la conservación real de borradores con cuenta antes de enlazar registro con el laboratorio. Aclarar el vencimiento y la eliminación de datos en servidor si se ofrecen demos reales.
2. Separar claramente la cotización de boda, álbum y check-in del paquete sencillo; acordar precio y operación de cada complemento antes de activar cobro.
3. Revisar las plantillas en un teléfono físico, navegación por teclado y captura completa de red. Agregar arte individual a las nuevas variantes si se requiere un catálogo más distinto visualmente: las 40 nuevas opciones usan combinaciones de paleta, composición y efectos CSS, no 40 ilustraciones nuevas.
