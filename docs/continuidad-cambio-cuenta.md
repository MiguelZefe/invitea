# Continuidad de ZefeInvita entre cuentas

**Corte:** 7 de noviembre de 2026. **Repositorio:** `MiguelZefe/invitea` en GitHub. **Rama de trabajo:** `codex/commercial-local`.

Este archivo permite retomar el proyecto desde otra cuenta de Codex con acceso al mismo repositorio. El historial de esta conversación no se transfiere automáticamente. La rama conserva el código y este resumen; las credenciales, los datos de Supabase y los archivos locales excluidos por Git requieren acceso y respaldo por separado.

## Estado del producto

- La web pública ofrece muestras personalizables de cumpleaños, bautizo, baby shower, boda, XV años, primera comunión, graduación y aniversario. La oferta sencilla de $99 MXN se ha comunicado para cumpleaños y bautizo; el pedido se coordina por WhatsApp. No hay cobro automático.
- Las muestras permiten probar plantillas, textos, fecha, ubicación, efectos y música de forma temporal. La vista de invitación a pantalla completa fue añadida localmente después de la última publicación documentada. Probar una muestra no crea una invitación real ni guarda un evento en servidor.
- Las invitaciones reales usan Supabase para eventos, invitados y confirmaciones. El panel existente lee RSVP, invitados y check-in. En este corte se añadió una presentación general para eventos reales distintos de boda y baby shower, con portada a pantalla completa, cuenta regresiva, lugares, mapas y el formulario RSVP existente. Antes estos eventos recibían secciones propias de una boda.
- La boda de Elizabeth y Alonso y la invitación de Liam son casos específicos. El trabajo de este corte no modifica los archivos, datos ni recursos de Liam.
- El laboratorio comercial es una ruta solo de desarrollo. Guarda un borrador de demostración en el navegador durante 30 minutos y muestra una compra simulada. **No** conserva borradores mediante cuenta o servidor, no cobra y no autoriza publicación. Los cambios locales de registro e inicio de sesión que vuelven al laboratorio deben revisarse antes de cualquier entrega pública.

## Alcance guardado en esta rama

El árbol local que se guarda incluye cambios de laboratorio, redirección de acceso, muestras, historia editorial de boda y presentación general de invitaciones reales. Los archivos de la nueva presentación están en `src/components/celebration/`. El selector de presentación está en `src/lib/event-template.ts` y `src/components/PublicInvitation.tsx`. Las pruebas de regresión están junto a las funciones y en `src/lib/public-invitation.test.ts`.

La rama de trabajo **no debe fusionarse ni publicarse íntegra sin revisar**: contiene trabajo de laboratorio y acceso que sigue en preparación. La última publicación citada en `docs/resumen-proyecto.md` y `docs/plan-comercial-99.md` corresponde a una entrega anterior; ambos documentos conservan antecedentes históricos. Este archivo registra el estado más reciente de la rama, sin afirmar que sus cambios estén en producción.

## Evidencia y límites

- Antes de guardar este corte, la suite local completa pasó con **328 pruebas en 31 archivos**. TypeScript y ESLint de los archivos modificados en la última iteración pasaron. `git diff --check` no detectó errores de espacios.
- Las pruebas nuevas cubren la selección de plantilla general, la representación de un cumpleaños con datos ficticios y la presencia del RSVP existente. Las pruebas anteriores cubren rutas de boda, baby shower y Liam.
- La presentación general nueva **no tiene aún revisión visual en navegador con un evento real**, ni una confirmación enviada de principio a fin contra la base de datos. La lectura del panel y el formulario comparten la estructura de RSVP existente; eso no sustituye la prueba integrada.
- La última revisión móvil de las muestras, la compilación aislada y las comprobaciones de publicación descritas en `docs/plan-comercial-99.md` son históricas. No equivalen a una verificación de todos los cambios actuales.
- Siguen pendientes una compilación aislada de producción de la rama completa, recorrido en teléfono físico, accesibilidad y teclado, inspección completa de red y revisión de cada categoría y variante.

## Cómo retomarlo desde otra cuenta

1. Dar a la nueva cuenta acceso al repositorio de GitHub `MiguelZefe/invitea`. En un clon nuevo, seleccionar `codex/commercial-local` y leer este archivo, `AGENTS.md`, `CLAUDE.md`, `docs/resumen-proyecto.md` y `docs/plan-comercial-99.md` antes de editar.
2. Para operar o desplegar la aplicación real, gestionar por separado el acceso a Vercel, Supabase, dominio y recursos multimedia. **No** pegar credenciales en el chat ni guardarlas en Git. `.env.local` está excluido y no forma parte de este respaldo.
3. Antes de publicar, revisar las diferencias de la rama frente a `main`, separar laboratorio/acceso de cambios publicables, ejecutar pruebas y compilación aislada, y comprobar la vista y el RSVP en navegador. Mantener el evento de Liam fuera de cambios generales.
4. La base de datos real, su contenido, políticas y funciones no quedan respaldados por este repositorio. La revisión de esquema disponible en `docs/commercial-persistence-review.md` y `docs/supabase-schema-review.md` no es una copia operativa de la base.

**Primer objetivo recomendado al retomar:** validar visualmente la nueva invitación general y su confirmación con un evento de prueba aislado; después revisar el panel correspondiente. No inferir que la integración está completa solo por las pruebas unitarias.
