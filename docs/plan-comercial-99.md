# ZefeInvita: primera versión comercial de $99

Fecha: 2026-09-16. Objetivo de revisión del lanzamiento: 2026-11-16.
Rama de trabajo local: `codex/commercial-local`, desde `f3d4441`.

## Objetivo y alcance

Permitir que un comprador cree un evento, lo guarde como borrador privado,
lo previsualice, pague $99 MXN y lo publique sin activación manual.
Pago único por evento; editar el mismo evento no genera otra compra.
Las herramientas disponibles se adaptan al tipo de celebración. El control de
acceso será opcional, no un paquete de precio adicional.

Primero desarrollo y pruebas locales. Cuentas de cobro, cambios de base remota,
Preview y Production se tratarán como pasos posteriores expresamente autorizados.
El evento existente y sus invitados, enlaces, audio y datos no se modifican.
No se impondrá retroactivamente un pago o un estado de borrador a eventos existentes.

## Diagnóstico basado en el código actual

| Área | Evidencia local | Qué falta para vender |
| --- | --- | --- |
| Cuenta y administración | `src/app/dashboard/page.tsx` filtra por `owner_id`; creación y edición verifican usuario | Prueba completa de aislamiento entre compradores con datos sintéticos |
| Creación | `src/app/dashboard/nueva/actions.ts` inserta en `events` y redirige al panel | No introduce estado de borrador ni una autorización comercial de publicación |
| Lectura pública | `src/lib/public-invitation-data.ts` consulta por `slug` y selecciona campos explícitos | No hay filtro de publicación en esa consulta; proteger también lectura directa de la base y RPC, no solo la interfaz |
| Precio | `src/components/Pricing.tsx` anuncia $299, $599 y desde $1,500 | Sustituir por la oferta de $99 cuando exista un recorrido coherente; un cambio de texto no implementa el cobro |
| Pagos | No hay dependencias de proveedor en `package.json` ni rutas de checkout/webhook en `src/app` | Compra por evento, confirmación fiable, reintentos e idempotencia |
| Plantillas | `src/lib/event-template.ts` distingue baby shower; el resto usa boda | Selector explícito para las dos plantillas iniciales; no presentar otros tipos como diseños ya terminados |
| Personalización | `NewInvitationForm.tsx` permite campos de texto; `WeddingGallery.tsx` e `WeddingItinerary.tsx` contienen datos fijos | Fotos e itinerario propios del comprador; evitar mostrar una galería o programa de ejemplo como si fueran del cliente |
| RSVP y acceso | Existen invitados, tokens, QR, selección de RSVP vigente y acciones de check-in que verifican propietario | Validar el recorrido completo, concurrencia, capacidad y configuración opcional por evento |
| Evento protegido | `invitation-presentation.ts` distingue su slug; `public-invitation-data.ts` mantiene su fallback | Conservar comportamiento, rutas y recursos, además de cubrirlo con regresiones antes de conectar cambios compartidos |
| Esquema | `docs/supabase-schema-review.md` documenta exportación parcial sin RPC/RLS/defaults completos | Obtener un contrato reproducible antes de diseñar una migración compatible; no inventar políticas o columnas existentes |
| Entorno local | La URL configurada de Supabase apunta a un host remoto, no a loopback; no se muestra el valor | Ejecutar la aplicación en localhost no aísla las escrituras. No probar altas, RSVP, check-in ni pagos contra esa configuración |

La revisión no ha consultado la base remota. La ausencia de una condición en
el código no demuestra qué permite hoy RLS. No se afirma que el esquema remoto
carezca de columnas por no aparecer en un tipo TypeScript.

## Orden de trabajo y criterios de aceptación

Los plazos son objetivos de trabajo, no una declaración de funcionalidad ya disponible.

### Primera semana: aislamiento y borradores

1. **P0 — Laboratorio local seguro.** Preparar datos sintéticos y un modo de
   demostración comercial separado del cliente Supabase actual.
   Aceptación: crear/editar/previsualizar un borrador no envía solicitudes a
   Supabase remoto ni a proveedores de pago; los datos de prueba no se mezclan
   con los del evento existente. Un fallo del laboratorio no hace fallback a
   servicios reales. No sustituir las credenciales actuales para conseguirlo.
2. **P0 — Contrato de estados y permisos.** Definir por separado publicación
   del evento y estado de cada intento de pago. Precio del servidor:
   `9900` centavos, moneda `MXN`; nunca confiar en un importe del navegador.
   Aceptación: un comprador no puede editar ni pagar/publicar un evento ajeno;
   un retorno a una URL de éxito no acredita un pago; la edición posterior
   conserva el derecho de publicación. Probar transiciones con datos sintéticos.
3. **P0 — Borrador y previsualización.** Simplificar creación para boda y baby
   shower, guardar progreso y ofrecer vista previa privada del propietario.
   Aceptación: recargar conserva el borrador; otra cuenta o un visitante no lo
   ve; no emite enlaces compartibles operativos ni acepta RSVP antes de publicar.
   En la fase sin base local, etiquetar explícitamente la persistencia simulada;
   no presentarla como una autorización real de servidor.
4. **P0 — Compatibilidad y esquema.** Inventariar tablas, restricciones, RLS,
   RPC, índices y dependencias necesarias para reproducir el flujo en una base
   de prueba. Proponer una incorporación gradual del modelo comercial.
   Aceptación: pruebas con eventos nuevos y heredados, preservación de slugs y
   tokens y una estrategia de reversión. Ninguna migración remota en este bloque.

### Semanas 2 a 4: cobro de prueba y operación

5. **P0 — Checkout de prueba.** Elegir proveedor después de revisar requisitos
   de alta, medios de pago, comisiones y confirmación automática. Integrar en
   sandbox una compra vinculada al comprador y al evento.
   Aceptación: importe y moneda calculados en servidor, claves solo de prueba,
   reintento sin perder el borrador y ningún cobro real.
6. **P0 — Confirmación y publicación.** Validar autenticidad del aviso del
   proveedor y cotejar evento, propietario, importe, moneda y transacción.
   Aceptación: notificaciones repetidas o fuera de orden no activan dos veces;
   un pago fallido no publica; un pago válido publica aunque se cierre la ventana;
   el cliente no puede autoconcederse acceso. Persistencia y publicación deben
   tener un contrato transaccional comprobado.
7. **P1 — Personalización real.** Hacer editables los elementos que hoy son
   ejemplos y definir almacenamiento y límites para fotos/música.
   Aceptación: dos eventos sintéticos no comparten contenido accidentalmente;
   campos opcionales vacíos no muestran datos inventados; no se reutilizan los
   recursos personales del evento protegido en nuevos eventos.
8. **P1 — Gestión del evento.** Integrar compartir, invitados, pases, RSVP,
   métricas y check-in opcional.
   Aceptación: tokens de otro evento se rechazan; no hay ingreso duplicado ni
   exceso de pases; un error de red no se comunica como una confirmación exitosa.
9. **P1 — Oferta de $99.** Unificar landing, creación, checkout y comprobante.
   Aceptación: un solo total coherente, sin prometer automatización de WhatsApp,
   capacidad ilimitada o edición personalizada que no esté implementada.

### Semanas 5 a 8, hasta el 16 de noviembre: preparación del lanzamiento

10. **P0 — Ensayo completo.** Probar móvil, navegación con teclado, sesión,
    recuperación, borradores, pagos de prueba y publicación con dos compradores.
    Aceptación: matriz de casos con resultados y sin escrituras en eventos reales.
11. **P0 — Operación comercial.** Resolver vigencia, capacidad, soporte,
    cancelaciones/reembolsos, privacidad, condiciones y costos de operación.
    Aceptación: oferta y condiciones consistentes; distinguir comisión de cobro
    de utilidad; verificar que los planes de alojamiento admitan el uso comercial.
12. **P0 — Ensayo de actualización.** Probar migración/reversión y conservación
    de eventos heredados en una base de prueba reproducible.
    Aceptación: los enlaces, medios y controles del evento protegido mantienen
    su comportamiento, sin convertirlo en un evento sujeto al nuevo cobro.
13. **P1 — Publicación autorizada y piloto.** Solo tras completar los requisitos,
    pasar a Preview, validar configuración real y después lanzar una venta
    controlada. Registrar compras completadas, fallos y solicitudes de soporte.
    Aceptación: pago real comprobado y evento correcto activado, con capacidad de
    intervención y reversión. El proveedor puede introducir tiempos de alta externos.

## Decisiones pendientes que no impiden empezar el laboratorio

- Proveedor de pagos: todavía no elegido ni contratado.
- Vigencia de cada evento y tiempo de conservación/exportación de respuestas.
- Capacidad de invitados, almacenamiento y alcance exacto de soporte a $99.
- Condiciones de cancelación/reembolso y tratamiento fiscal del precio final.
- Controles de privacidad por defecto para los eventos nuevos.

No se implementarán suscripciones, editor libre de diseño, paquetes extra ni
automatización avanzada de WhatsApp en el primer recorrido de compra.

## Primer cambio de implementación propuesto

Empezar por P0-1 y P0-2: laboratorio aislado y contrato comercial probado. Puede
avanzarse con un repositorio en memoria y datos sintéticos sin cambiar el modelo
`InviteEvent`, las rutas públicas, las acciones actuales o una base de datos real.
Ese trabajo debe dejar claro qué es demostración local y qué requiere servidor.
Después se construye el formulario de borrador sobre ese contrato y se conecta
la persistencia cuando el esquema de prueba esté verificado.

## Registro de este bloque

- Revisión local de código, scripts, documentación y destino local/remoto de
  configuración; no se leyeron ni mostraron valores de secretos en la salida.
- Creada rama local desde el commit que está publicado; no se partió de `main`,
  que todavía conserva la versión anterior.
- Conservados los 11 cambios de documentación preexistentes.
- Único archivo nuevo de este bloque: `docs/plan-comercial-99.md`.
- Sin cambios de aplicación, variables, eventos, dependencias o infraestructura.
- Sin commits, push, despliegues, consultas de negocio ni migraciones remotas.
- Las 176 pruebas, lint, TypeScript y build aprobados corresponden a la preparación
  anterior de `f3d4441`. No se repitieron para esta modificación documental.

## Avance implementado — laboratorio comercial local (2026-09-16)

Este registro se añade al plan anterior; no sustituye sus antecedentes.

### Punto de partida y preservación

- Rama comprobada: `codex/commercial-local`.
- Commit inicial: `f3d444184eab90b15dc1a30db184c2b6fdb0719b`.
- Git inicial: 2 documentos rastreados modificados (`docs/arquitectura.md`,
  `docs/changelog.md`) y 10 documentos sin seguimiento, incluido este plan.
  Sin cambios preparados en staging. Se conservaron los 12 cambios previos.
- Leídos AGENTS.md, CLAUDE.md, este plan, project-status.txt y las guías locales
  de Next sobre componentes servidor/cliente, Vitest, notFound y entorno.
  No se encontraron instrucciones adicionales bajo src, docs o scripts.
- Inventario inicial SHA-256 de 141 archivos existentes no ignorados; se excluyen
  archivos de entorno. El cotejo final confirma que solo cambió este plan entre
  los archivos preexistentes; los otros 140 conservan su hash.

### Implementación y alcance cumplido

- P0-1: laboratorio independiente en `/laboratorio-comercial`; guard de servidor
  `NODE_ENV === development`, con `notFound()` en cualquier otro entorno.
  No está enlazado desde la landing ni pasa por el proxy de sesión.
- P0-2: contrato preliminar puro, separado de los modelos y servicios reales.
  Oferta única e inmutable: `amountCents: 9900`, `currency: MXN`.
- P0-3: crear un borrador con ejemplo ficticio, elegir boda/baby shower, editar
  nombres, fecha y ubicación, guardar y previsualizar los campos actuales.
  Sin imágenes, audio, invitados, RSVP, enlaces públicos ni comprobantes.
- Persistencia: una clave versionada de localStorage por navegador/origen.
  Se valida la estructura al recuperar; se rechazan estados distintos de draft,
  tipos/fechas inválidos y se descartan campos extra de pago o propietario.
  Errores de lectura/cuota son visibles y no activan fallback remoto.
- La interfaz explica almacenamiento local, cambios sin guardar, pérdida al borrar
  datos del navegador y acceso por otras personas que usen el mismo perfil.
  No representa privacidad de propietario, autenticación o autorización reales.
  Los criterios de cuentas/aislamiento del plan siguen pendientes de servidor.

### Contrato de estados (solo reglas sintéticas, sin efectos)

| Entidad | Origen | Destinos permitidos |
| --- | --- | --- |
| Evento | draft | published con intento exitoso compatible; archived |
| Evento | published | archived |
| Evento | archived | ninguno |
| Intento de pago | created | pending, cancelled |
| Intento de pago | pending | succeeded, failed, cancelled |
| Intento de pago | succeeded / failed / cancelled | ninguno |

Cualquier otra transición, incluida repetir un estado terminal, se rechaza.
Un reintento requerirá otro intento de pago; el adaptador futuro deberá manejar
idempotencia y avisos fuera de orden antes de aplicar transiciones.
Para simular draft → published se exige coincidencia de evento, estado succeeded,
9900 centavos y MXN. El éxito de un intento por sí solo no muta ni publica nada.
Editar contenido no es una transición de pago/publicación. La UI actual únicamente
edita draft; editar eventos publicados y conservar su derecho se integrará después.

Estas funciones no verifican identidad ni autenticidad de un pago: cualquier
objeto del navegador es manipulable. Antes de conectarlas habrá que verificar en
servidor propietario, confirmación del proveedor, importe, moneda, vínculo con el
pedido, idempotencia y escritura transaccional. Una URL de éxito no será evidencia.
No se persisten intentos, derechos de publicación ni estados publicados en la demo.

### Archivos añadidos

- `src/app/laboratorio-comercial/page.tsx`: entrada y bloqueo fuera de desarrollo.
- `src/app/laboratorio-comercial/CommercialLab.tsx`: formulario y vista previa.
- `src/app/laboratorio-comercial/page.test.ts`: guard por entorno.
- `src/app/laboratorio-comercial/CommercialLab.test.ts`: recorrido y errores.
- `src/lib/commercial-lab/contract.ts` y `contract.test.ts`: oferta y transiciones.
- `src/lib/commercial-lab/draft.ts` y `draft.test.ts`: validación y persistencia.
- `src/lib/commercial-lab/isolation.test.ts`: dependencias y exclusión del proxy.
- `scripts/commercial-lab-local.mjs`: lanzador aislado sin archivos de entorno.

### Cómo abrirlo sin utilizar .env.local

Desde la raíz del repositorio:

```powershell
node scripts/commercial-lab-local.mjs
```

Abrir `http://127.0.0.1:3100/laboratorio-comercial`. Detener con Ctrl+C.
El lanzador crea una copia desechable bajo `.next/commercial-lab-*`, con solo los
módulos del laboratorio y un layout básico sin Google Fonts. Reutiliza node_modules;
no instala nada. No copia archivos de entorno, rutas reales, clientes Supabase,
proxy, recursos personales ni configuración de despliegue. Retira las variables
Supabase/NEXT_PUBLIC heredadas del proceso y escucha solo en loopback.
La copia es una instantánea: reiniciar el lanzador después de editar el código.
No ejecutar el dev normal para esta comprobación, porque carga .env.local.

Para verificar la negativa de producción, detener primero el proceso anterior:

```powershell
node scripts/commercial-lab-local.mjs --production
```

Este modo compila localmente y sirve en el mismo puerto; la ruta debe devolver 404.
No publica ni despliega nada. Las copias y cachés quedan ignoradas bajo `.next`.

### Verificaciones del bloque

- `npm test -- --reporter=dot`: 244 pruebas aprobadas, 20 archivos; 68 casos nuevos.
  Incluye todas las parejas de estados válidas/inválidas, importe/moneda/vínculo
  incorrectos, JSON corrupto, cuota agotada y rechazo de publicación inyectada.
- Pruebas de componentes: creación, edición, guardado, remontaje con recuperación
  y previsualización de ambos tipos, sin fetch. Son pruebas con hooks simulados,
  no una prueba E2E de DOM/recarga visual.
- `npm run lint` y `tsc --noEmit`: aprobados.
- Build completo de Next con webpack: aprobado en copia aislada de las fuentes,
  sin .env.local y con URL/clave Supabase sintéticas de loopback. Las rutas reales
  no se visitaron. La descarga de fuentes del layout existente requirió permiso
  de red; no se descargaron dependencias ni herramientas.
- HTTP local: laboratorio en desarrollo devuelve 200 y contiene su interfaz.
  El mismo path en la compilación de producción completa devuelve 404, sin interfaz.
- Lanzador aislado: desarrollo devuelve 200; su build de producción pasa y la
  ruta devuelve 404 sin interfaz. Usa un shell visual básico; no valida visualmente
  las fuentes del layout de la aplicación principal. Procesos de prueba detenidos.
- Pruebas estáticas: módulos limitados al laboratorio/React/Next; sin llamadas de
  red ni acciones de servidor y ruta excluida del proxy Supabase.
- Navegador visual: completado el 17 de septiembre de 2026 con el lanzador
  aislado, en escritorio y viewport móvil de 390 x 844. Se comprobó edición de
  nombres, ubicación y fecha (esta última con teclado), guardado y recuperación
  de una boda ficticia tras recargar, cambio a baby shower y su previsualización.
  El campo de nombres vacío impide guardar y recibe el foco. Tab lleva desde
  ubicación a Guardar; Enter permite cerrar la previsualización. Los textos largos
  se ajustan en la vista previa móvil; ancho del documento y viewport: 390 px,
  sin desbordamiento horizontal. Sin errores ni advertencias de consola capturados.
  La automatización fill no actualizó la fecha ni vació el nombre; esos casos se
  verificaron mediante teclado y leyendo el estado visible resultante.
  Esta revisión usa el layout aislado con Arial y emulación de tamaño: no sustituye
  una prueba en teléfono físico, una auditoría completa de accesibilidad ni una
  captura de tráfico. No se repitieron las 244 pruebas ni el build al no cambiar código.
  Solo se actualizó este plan; el servidor aislado quedó disponible en el puerto
  3100 y el navegador conserva un borrador sintético de baby shower.

Sin consultas/escrituras a Supabase remoto, pagos, migraciones, cambios de Vercel,
commits, push, merges o despliegues. No se leyó, copió ni modificó .env.local.
No se tocaron rutas, datos, recursos, audio, invitados ni comportamiento del evento
existente. El bloque termina aquí: integración de cuentas, pagos y publicación real
requiere trabajo posterior en un entorno de prueba verificado.

### Recorrido de compra simulado — 17 de septiembre de 2026

Se añadió al laboratorio un resumen validado del evento con total de $99 MXN,
inicio de pago simulado, estados pendiente/aprobado/rechazado/cancelado y reintento.
El resumen toma los campos actuales, incluso sin guardar. Editar cualquier campo
descarta el resumen y el resultado; recargar conserva solo el borrador previamente
guardado. Una aprobación ficticia nunca publica ni persiste datos de pago.
No hay campos bancarios, proveedor, llamadas de red ni comprobantes.

Archivos de este bloque: CommercialLab.tsx, CommercialLab.test.ts y este plan.
Se conservaron los demás cambios locales. Verificación: 71 pruebas del laboratorio
aprobadas, lint de los dos archivos y TypeScript sin emisión aprobados.
En navegador se verificaron resumen, pendiente, rechazo, reintento, aprobación y
recarga con recuperación del borrador sin el pago. Revisión visual a 390 x 844:
resumen y texto largo legibles; sin errores/advertencias de consola observados.
Cancelación, validación y descarte al editar cubiertos en pruebas de handlers;
no se afirma una prueba de proveedor ni una auditoría de accesibilidad completa.
No se repitió el build completo. Servidor aislado reiniciado en el puerto 3100.
Sin instalaciones, acceso remoto, cambios a Liam, commits, push ni despliegues.

### Contrato en memoria: propietarios y confirmaciones — 17 de septiembre de 2026

Añadidos `src/lib/commercial-lab/memory-store.ts` y `memory-store.test.ts`.
Repositorio exclusivamente sintético, no conectado al navegador, a rutas de
servidor ni al lanzador. Dos compradores de prueba tienen eventos separados;
lectura, edición e inicio de compra rechazan identidades ajenas. El importe se
obtiene de OFFER (9900 centavos, MXN), sin parámetro de precio del comprador.
Un segundo inicio reutiliza el intento pendiente; después de fallo crea otro.

La confirmación coteja intento/evento/propietario/importe/moneda antes de cambiar
estado. Notificaciones repetidas no activan dos veces; reutilizar el mismo ID con
otro contenido se rechaza. En esta política sintética, éxito prevalece sobre un
fallo tardío, incluso si ya hubo reintento. Dos intentos exitosos activan el evento
solo una vez; esto NO evita ni reembolsa posibles cobros duplicados de un proveedor.
La integración futura debe resolver esa conciliación y sus estados reales.
Editar conserva la activación; no permite otra compra del mismo evento activado.

Verificación: 83 pruebas del laboratorio aprobadas (12 nuevas); lint de los dos
archivos nuevos y TypeScript sin emisión aprobados. Sin cambios de UI; no se
repitió revisión visual ni build. Se actualizó únicamente este plan además de
añadir los dos módulos. Cambios anteriores conservados; sin servicios remotos,
variables, instalaciones, commits, push ni despliegues.

Límite explícito: las identidades y confirmaciones son datos sintéticos, no pruebas
de sesión ni de pago. Las operaciones sincrónicas en memoria no prueban transacciones
de base de datos ni concurrencia entre procesos; todo se pierde al descartar la
instancia. No exponer confirmSynthetic en una API. Para producción hacen falta
sesión confiable, firma del proveedor, persistencia transaccional, restricciones
únicas y pruebas sobre un esquema local reproducible. El inventario de esquema
P0-4 sigue siendo el siguiente paso previo a integrar persistencia real.

### Revisión de persistencia — 17 de septiembre de 2026

Completado el inventario local en docs/commercial-persistence-review.md: evidencia
por área, modelo conceptual, incorporación compatible y matriz de datos pendientes.
La exportación disponible sigue limitada a Q19; no permite reproducir RLS, RPC,
restricciones y dependencias. Docker, psql y supabase no están disponibles en PATH.
P0-4 queda pendiente de evidencia humana sanitizada Q01-Q18/procedencia y posterior
revisión de cuerpos/expresiones omitidas; el paquete de auditoría existente indica
cómo obtenerla. No se escribió ni ejecutó una migración especulativa.
No se instalaron herramientas ni se consultó el remoto. Solo documentación en este
bloque; código, evento existente y cambios locales previos preservados.

### Verificación local con navegador no disponible — 20 de septiembre de 2026

Este registro se añade sin sustituir la evidencia histórica del 17 de septiembre.
El objetivo de validación en navegador real **queda bloqueado en esta sesión**;
las comprobaciones siguientes no equivalen a un recorrido visual ni de red.

#### Preparación y aislamiento

- Rama inicial y final: `codex/commercial-local`; commit:
  `f3d444184eab90b15dc1a30db184c2b6fdb0719b`.
- Git inicial: `docs/arquitectura.md` y `docs/changelog.md` modificados;
  11 documentos sin seguimiento y los directorios `scripts/`,
  `src/app/laboratorio-comercial/` y `src/lib/commercial-lab/` sin seguimiento.
  Sin cambios en staging. Todos eran preexistentes.
- Leídos AGENTS.md, CLAUDE.md, plan, estado, lanzador, código y pruebas del
  laboratorio; no se encontraron instrucciones adicionales bajo src/docs/scripts.
  Consultadas las guías locales de Next de entorno, componentes servidor/cliente,
  notFound y Vitest, y las instrucciones de las herramientas de navegador.
- Revisada la lista explícita de copias del lanzador y sus dependencias: fuentes
  del laboratorio, CSS global, package.json, tsconfig y PostCSS; layout generado
  sin Google Fonts. No copia rutas reales, proxy, clientes Supabase, recursos,
  configuración de despliegue ni archivos de entorno. El repositorio en memoria
  de pruebas no se copia ni se conecta a la interfaz.
- Comprobada la copia de desarrollo: seis fuentes previstas y configuración
  local generada, sin archivos de entorno. El lanzador elimina las variables
  heredadas SUPABASE/NEXT_PUBLIC/NODE_ENV y desactiva la telemetría de Next.
  Esto es inspección estática y de archivos, no una captura de tráfico.
- Inventario SHA-256 inicial de 154 archivos rastreados o nuevos no ignorados,
  excluyendo archivos de entorno. Evidencia auxiliar ignorada en
  `.next/commercial-validation/`: inventario, estado Git inicial, configuración
  temporal de pruebas y resultados HTTP. No se leyó, copió, modificó ni cargó
  `.env.local`; no se calculó su hash para respetar la prohibición de lectura.

#### Evidencia de navegador y pendientes

- `cua.getState()` devolvió `apps: []` y `browsers: []`.
- Intentar abrir una pestaña integrada en `about:blank` devolvió
  `Browser is not available: iab`. Las APIs nativas están deshabilitadas en esta
  sesión. No se instaló ni configuró otro navegador o herramienta.
- No se observó la interfaz en navegador, no se tomaron capturas ni se inspeccionó
  tráfico de navegador. No se afirma ausencia de solicitudes remotas observadas.
- Quedan pendientes los recorridos reales de boda y baby shower: edición de todos
  los campos, guardado y recarga real, recuperación, distinción de cambios sin
  guardar, previsualización, vacíos/espacios/fecha inválida/límites de longitud,
  almacenamiento bloqueado/cuota si es simulable, escritorio/móvil, desbordamientos,
  legibilidad, etiquetas, teclado y foco visible. También queda pendiente observar
  las solicitudes de red durante todo el recorrido.
- Los resultados visuales históricos siguen siendo antecedentes; no acreditan
  una nueva validación de este bloque. Sin defectos de navegador reproducidos,
  no se hicieron correcciones especulativas ni cambios de producto.

#### Pruebas automatizadas y HTTP local

- 83 pruebas existentes aprobadas en 6 archivos del laboratorio. Comando:
  `node node_modules/vitest/vitest.mjs run --config .next/commercial-validation/vitest.config.mts --reporter=dot`.
  Configuración temporal equivalente a la existente para alias/entorno Node,
  limitada al laboratorio y con `envDir: false` para impedir cargar archivos de
  entorno. Incluye la oferta congelada `9900` centavos/`MXN`, rechazo de borradores
  inválidos, persistencia con almacenamiento simulado, cuota/JSON corrupto,
  guard de producción y aislamiento estático. Los handlers usan hooks simulados:
  remontar no es recargar un navegador. No se añadieron pruebas de regresión al
  no haberse corregido código.
- Lint aprobado, salida 0:
  `node node_modules/eslint/bin/eslint.js src/app/laboratorio-comercial src/lib/commercial-lab scripts/commercial-lab-local.mjs`.
- Ejecutado exclusivamente `node scripts/commercial-lab-local.mjs` para desarrollo.
  El primer intento arrancó, pero la petición seguía en compilación al interrumpirlo;
  no produjo evidencia HTTP válida. Al repetir con una copia aislada nueva, respondió
  **200** en 15 segundos y el HTML contenía `Tu primer borrador`, `Guardar borrador`
  y `MXN`. Esta repetición no reprodujo el bloqueo inicial; no se atribuye una causa.
- Con desarrollo detenido, ejecutado
  `node scripts/commercial-lab-local.mjs --production`: build webpack y TypeScript
  aprobados, generación de páginas y servidor local completados. GET de
  `/laboratorio-comercial` devolvió **404**; HTML con `This page could not be found`,
  sin `Tu primer borrador` ni `Guardar borrador`. Evidencia obtenida mediante
  Invoke-WebRequest, no mediante navegador. No se compiló ni visitó la aplicación real.
- Los procesos de los lanzadores iniciados en esta tarea se detuvieron con Ctrl+C.
  Cotejo final: cero listeners en el puerto 3100. No se detuvieron servidores ajenos.

#### Preservación y cierre

Único archivo de proyecto modificado en este bloque: `docs/plan-comercial-99.md`,
por adición de este registro. Los otros 153 archivos del inventario conservan sus
hashes; no hay archivos inventariados eliminados. Código, pruebas, lanzador, rutas,
datos y recursos de Liam permanecen intactos. Git mantiene la rama, commit y staging
iniciales y todos los cambios locales anteriores. Los artefactos temporales están
ignorados bajo `.next`.

Sin consultas ni escrituras a Supabase remoto, pagos activados, comprobantes,
autenticación, base de datos, instalaciones, commits, push, merges, despliegues,
migraciones ni cambios de Vercel. No se avanza a etapas posteriores. El bloque
termina con las comprobaciones locales anteriores y la validación visual/de red
pendiente por falta de un navegador utilizable.

### Seguimiento manual sin observaciones recibidas — 20 de septiembre de 2026

El mensaje de seguimiento conserva el marcador «[Describe aquí lo observado y
cualquier fallo.]». No aporta resultados manuales, pasos de reproducción ni
resultados esperados/obtenidos. Se solicitaron esas observaciones; la ausencia de
un informe no equivale a una prueba aprobada ni demuestra ausencia de defectos.

Comprobaciones de este seguimiento: lectura de AGENTS.md, CLAUDE.md y este plan;
confirmación de rama `codex/commercial-local` y commit
`f3d444184eab90b15dc1a30db184c2b6fdb0719b`; lectura de CommercialLab.tsx y draft.ts.
Sin observaciones concretas no se puede completar el contraste manual con el
código. No se modificaron fuentes ni pruebas, ni se ejecutaron nuevamente las
83 pruebas, lint, build o solicitudes HTTP: sus resultados pertenecen al bloque
anterior. Tampoco se intentó nuevamente la automatización de navegador.

Solo se añade este registro al plan. El cotejo de 154 archivos no ignorados,
excluyendo archivos de entorno, confirma que los otros 153 mantienen su SHA-256.
Los cambios previos y Liam permanecen intactos. No se leyó ni cargó .env.local,
no se usó Supabase remoto ni se instalaron dependencias; sin commits, push ni
despliegues. No se avanzó a autenticación, persistencia de servidor ni pagos.

La validación manual y de red continúa pendiente, con los casos enumerados en
el bloque anterior. No se cierra como aprobada; falta recibir las observaciones
manuales para decidir si hay defectos concretos y corregirlos.

### Evidencia visual parcial aportada y revisión de la simulación — 20 de septiembre de 2026

#### Observaciones de capturas comunicadas por el usuario

El usuario describe capturas con formulario de boda y datos ficticios, oferta de
$99 MXN, mensaje de borrador guardado y previsualización abierta cuyos nombres,
fecha y ubicación coinciden con el formulario. También informa avisos de
demostración local y sin publicación, sin desbordamientos evidentes en el área
capturada, y presencia de «Revisar compra simulada».

Se registra como evidencia visual parcial aportada por el usuario. En este mensaje
se recibió la descripción textual de las capturas, no archivos de imagen que el
agente haya inspeccionado. No se atribuye al agente una observación visual directa.
El mensaje de guardado visible no demuestra por sí solo recuperación tras recarga.
La ausencia de desbordamiento descrita se limita al área capturada.

El usuario excluye expresamente de lo comprobado: recarga, edición persistida,
baby shower, móvil, teclado y tráfico de red. Siguen pendientes también los casos
de validación de campos y errores de almacenamiento del registro anterior. Esta
aportación complementa el seguimiento previo sin observaciones, sin borrarlo ni
convertir las verificaciones históricas en evidencia nueva. Validación incompleta.

#### Revisión de código realizada por el agente

- Leídos AGENTS.md y CLAUDE.md; sin instrucciones adicionales en docs.
  Rama `codex/commercial-local`, commit
  `f3d444184eab90b15dc1a30db184c2b6fdb0719b`, sin cambios de rama o staging.
- `src/app/laboratorio-comercial/CommercialLab.tsx`: el botón llama
  `reviewPurchase`, que valida el borrador actual y lo coloca en el estado React
  `review`. El estado `payment` comienza en `created`; los botones de simulación
  solo llaman a `setPayment` y a la función pura `transitionPayment`. No hay
  cliente Supabase, proveedor de pago, acción de servidor, solicitud de red ni
  creación de enlace público en este recorrido. Editar descarta resumen y
  resultado; no se persisten esos estados.
- `src/lib/commercial-lab/contract.ts`: OFFER permanece congelada en 9900 centavos,
  MXN. `transitionPayment` devuelve un estado sintético, sin efectos externos.
  El mismo módulo contiene `transitionEvent`, regla pura que puede devolver
  `published`, pero la interfaz no la importa ni la llama; no escribe ni concede
  autorización real. No confundir esta regla de demostración con publicación.
- `src/lib/commercial-lab/draft.ts`: `saveDraft` valida y escribe exclusivamente
  el borrador en la clave local versionada; `loadDraft` vuelve a validarlo.
  Se exige `state: draft` y se reconstruyen solo los campos permitidos, excluyendo
  pago y propietario. No hay fallback remoto ni persistencia de aprobación.
- `src/lib/commercial-lab/memory-store.ts`: repositorio sintético separado que
  modifica objetos en memoria en sus pruebas. La búsqueda de referencias en src
  no encontró consumidores de `createMemoryStore` fuera de su suite; no está
  conectado a la interfaz ni incluido en el lanzador. Tampoco constituye una
  autorización de publicación real.
- `page.tsx` limita la ruta a desarrollo con `notFound()` fuera de ese entorno.
  El matcher de `src/proxy.ts` no incluye el laboratorio. El lanzador aislado
  copia solo las fuentes previstas y genera un layout local; no copia proxy,
  clientes reales, recursos de Liam ni archivos de entorno. No se ejecutó ahora.

Antecedentes locales: el apartado «Recorrido de compra simulado — 17 de septiembre
de 2026» documenta la introducción del botón y sus estados en CommercialLab.tsx,
CommercialLab.test.ts y este plan. El apartado «Contrato en memoria: propietarios
y confirmaciones» de la misma fecha documenta el repositorio de pruebas separado.
Son antecedentes documentales del árbol local, no cambios introducidos en esta
revisión ni una atribución a un commit nuevo.

Conclusión estática: la simulación permanece aislada, sin integración con servicios
reales ni autorización efectiva de publicación. Se conserva sin eliminarla ni
ampliarla. Esto no acredita ausencia de tráfico observado en navegador. No se
identificó un hallazgo que justificara cambios de código o repetir pruebas.
Las 83 pruebas, lint, build y HTTP 200/404 conservan su carácter de resultados
anteriores; no se ejecutaron de nuevo en este seguimiento.

#### Preservación y siguiente comprobación manual

Solo se añade este registro al plan. Cotejo SHA-256 de 154 archivos no ignorados,
excluidos los archivos de entorno: los otros 153 intactos. Cambios previos, Liam,
código, recursos y pruebas conservados. Sin lectura ni carga de .env.local,
Supabase remoto, instalaciones, commits, push o despliegues. No se iniciaron
procesos ni se avanzó a autenticación, persistencia de servidor o pagos.

Siguiente comprobación: recuperación de una edición guardada tras recarga real.

1. En el laboratorio servido exclusivamente por `node scripts/commercial-lab-local.mjs`,
   mantener Boda y cambiar nombres, fecha y ubicación por valores ficticios nuevos.
2. Guardar y anotar esos tres valores y el mensaje mostrado.
3. Recargar realmente la página en el mismo navegador y origen
   `http://127.0.0.1:3100/laboratorio-comercial`.
4. Comprobar que aparecen los valores nuevos y «Borrador recuperado»; abrir la
   previsualización y comparar los tres campos. Informar cualquier diferencia.

Este recorrido sigue pendiente hasta recibir su resultado; no valida por sí solo
baby shower, móvil, teclado, campos inválidos, errores de almacenamiento ni red.

### Resultado manual de recuperación de baby shower — 20 de septiembre de 2026

Evidencia proporcionada por el usuario, no prueba de navegador ejecutada por el
agente: después de guardar y recargar aparece «Borrador recuperado de este
navegador». Se conservan Baby shower, los nombres editados y la ubicación editada.
La fecha recuperada es `2026-11-16`; el usuario no probó modificarla. Al abrir
Previsualizar aparece «Celebramos un baby shower», con los mismos nombres, fecha
y ubicación del formulario.

Este resultado aporta recuperación tras recarga y correspondencia de la vista
previa para baby shower en el recorrido informado. No demuestra persistencia de
un cambio de fecha ni validación completa. Siguen pendientes cambio de fecha,
móvil, teclado y tráfico de red, además de los casos de campos inválidos y errores
de almacenamiento aún no informados. Complementa los antecedentes sin repetirlos.

Actualización exclusivamente documental: leídos AGENTS.md y CLAUDE.md; rama
`codex/commercial-local`. Sin cambios de código ni ejecución de pruebas, navegador
o servidores. Cotejo SHA-256: de 154 archivos no ignorados, excluidos archivos de
entorno, solo cambia este plan; los otros 153 conservan su contenido, incluido
Liam. Cambios locales previos preservados. Sin acceso a .env.local ni a servicios
remotos. No se avanza a otro bloque.

Siguiente comprobación manual: cambiar la fecha del baby shower por `2026-12-20`,
guardar y recargar realmente en el mismo navegador y origen del laboratorio
 aislado. Comprobar que el formulario conserva esa fecha y que Previsualizar
muestra la misma, con nombres y ubicación anteriores conservados. Informar el
resultado; hasta entonces el cambio de fecha permanece pendiente.

### Resultado manual de recuperación de fecha editada — 20 de septiembre de 2026

El usuario informa que guardó el baby shower con fecha `2026-12-20`, recargó y
abrió Previsualizar. Aparece «Borrador recuperado de este navegador»; formulario
y vista previa conservan la fecha nueva, el nombre «Mar y Sol (ficticios)2335» y
la ubicación guardada. Aclara que el sufijo `2335` ya estaba en el nombre antes
de guardar: no es una alteración producida por la recarga.

Evidencia manual proporcionada por el usuario, no una prueba de navegador
 ejecutada por el agente. Queda comprobada la recuperación de la fecha editada
para este recorrido de baby shower. Complementa el resultado anterior sin
duplicarlo; la comprobación de cambio de fecha que allí figuraba pendiente queda
resuelta en este recorrido. No implica validación completa: siguen pendientes
móvil, teclado, tráfico de red y los casos de validación/almacenamiento todavía
no informados.

Solo se añade este registro al plan, tras leer AGENTS.md y CLAUDE.md y comprobar
la rama `codex/commercial-local`. Sin cambios de código, pruebas repetidas,
servidores iniciados ni acceso a .env.local o servicios remotos. Los otros 153
archivos del inventario SHA-256 de 154 archivos no ignorados (excluidos archivos
de entorno) permanecen intactos; Liam y los cambios locales previos conservados.
No se avanza a pagos ni publicación.

Próximo recorrido propuesto, aún no ejecutado: usar un viewport móvil emulado
(por ejemplo, 390 × 844) en el navegador de escritorio sobre el laboratorio
 aislado y recorrer el formulario con Tab/Shift+Tab, comprobando foco visible,
orden y acceso a campos y botones. Editar un campo ficticio, guardar con teclado,
abrir/cerrar Previsualizar con Enter o Espacio y comprobar legibilidad y ausencia
de desbordamientos al desplazarse por toda la página. No activar «Revisar compra
simulada». Registrar navegador, tamaño y fallos. Esta combinación prueba ancho
móvil emulado y teclado de escritorio; no equivale a un teléfono físico ni a su
teclado virtual, y tampoco inspecciona tráfico de red.

### Resultado manual de teclado en ancho móvil emulado — 20 de septiembre de 2026

El usuario informa cinco repeticiones satisfactorias en Chrome, vista móvil
emulada de 390 × 844: clic en Ubicación, Tab hasta Guardar borrador, Tab hasta
Previsualizar con foco visible, Enter para abrir la tarjeta y otro Enter sin
mover el foco para cerrarla. Describe la captura final con Previsualizar enfocado
(borde visible), tarjeta cerrada y controles visibles que caben en el ancho emulado.

Evidencia manual proporcionada por el usuario; no prueba de navegador ni inspección
de captura ejecutada por el agente. No se atribuyen modificaciones de campos,
guardado efectivo, navegación con Shift+Tab, recorrido completo de controles ni
revisión de toda la página a estas cinco repeticiones. Se acredita únicamente el
recorrido informado. No equivale a auditoría completa de accesibilidad ni prueba
en teléfono físico o de teclado virtual. Complementa los antecedentes, sin
convertir todos los pasos propuestos anteriormente en comprobaciones realizadas.
La validación general permanece incompleta; tráfico de red será la siguiente
comprobación, todavía pendiente.

Actualización solo documental, tras leer AGENTS.md y CLAUDE.md y confirmar
`codex/commercial-local`. No se cambió código ni se repitieron pruebas. Cotejo
SHA-256 de 154 archivos no ignorados, excluidos archivos de entorno: solo cambia
este plan; los otros 153 permanecen intactos. Liam y cambios previos conservados.
Sin acceso a .env.local, servicios remotos, instalaciones, commits o despliegues;
no se iniciaron procesos ni se avanzó a pagos o publicación.

Para observar red: abrir DevTools > Network en la pestaña del laboratorio aislado,
seleccionar All sin filtros, activar Preserve log, limpiar la lista y recargar.
Recorrer edición ficticia, guardado y apertura/cierre de previsualización sin
activar la compra simulada. Revisar URL/dominio e Initiator de las solicitudes;
los recursos y WebSocket de desarrollo deberían dirigirse al loopback del
laboratorio. localStorage no necesita una solicitud HTTP para guardar.

Una URL o cadena de iniciadores chrome-extension:// permite atribuir actividad
a una extensión; un dominio remoto por sí solo no identifica quién lo solicitó.
No descartar solicitudes remotas desconocidas sin revisar su iniciador. Para
contrastar, repetir en un perfil Invitado de Chrome, sin extensiones de usuario;
es un almacenamiento separado y requiere un borrador ficticio nuevo. Si un perfil
administrado tiene extensiones forzadas, anotar esa limitación. DevTools muestra
la actividad asociada a la pestaña, no todo el tráfico del navegador o del equipo.
Registrar dominios, estado e iniciador de cualquier solicitud ajena al loopback;
no compartir cookies, cabeceras de autorización ni un HAR sin revisar. Esta guía
no constituye una observación de red ni demuestra ausencia de solicitudes remotas.

### Intento de comprobación autónoma de red — 27 de septiembre de 2026

A petición del usuario, el agente intentó asumir la comprobación pendiente.
Leídos AGENTS.md, CLAUDE.md, antecedentes del plan, lanzador e instrucciones de
Computer Use. Rama conservada: codex/commercial-local. Esta vez el inventario
mostró un navegador integrado disponible, sin pestañas iniciales, a diferencia
del bloqueo del 20 de septiembre.

Se ejecutó exclusivamente `node scripts/commercial-lab-local.mjs`. Arrancó en
127.0.0.1:3100; al intentar abrir el laboratorio comenzó la compilación. La
navegación agotó el tiempo de espera de Page.navigate y las siguientes consultas
de estado fallaron por timeout de Emulation.setFocusEmulationEnabled. Se consultó
la guía de recuperación y se recuperó el identificador de pestaña, sin conseguir
observar la interfaz. Las capacidades de pestaña disponibles fueron pageAssets
y webmcp; no se expuso un registro de solicitudes de red.

No se realizaron ediciones, guardados ni previsualizaciones en navegador y no
se capturó tráfico. La comprobación de red continúa pendiente; no hay evidencia
nueva de ausencia de servicios remotos ni una validación visual aprobada.
No se repitieron las pruebas unitarias, lint o build de producción.

El lanzador de esta tarea se detuvo con Ctrl+C; cero listeners en 3100 al cierre.
El intento de cerrar la pestaña temporal fue rechazado por la política de URL
del navegador sobre su página interna de error; no se eludió la restricción ni
se confirmó el cierre de la pestaña. No se modificó la configuración del equipo.

Solo cambia este plan entre los 154 archivos inventariados (archivos de entorno
excluidos); los otros 153 conservan su SHA-256. Liam, código y cambios locales
anteriores intactos. Sin lectura o carga de .env.local, operaciones Supabase,
instalaciones, commits, push, despliegues, pagos ni publicación. No se cambió el
modelo de la conversación: las herramientas de esta sesión no ofrecen una
operación para cambiar el modelo de la propia conversación a Astra High.

### Validación directa de campos en navegador integrado — 27 de septiembre de 2026

En esta sesión el agente sí pudo operar la pestaña existente del laboratorio y
leer su estado accesible. Esta evidencia es directa del agente, distinta de las
comprobaciones manuales anteriores y de los intentos fallidos de automatización.

Punto de partida: Baby shower, nombre «Bienvenida Aurora, nuestra pequeña estrella
de una familia imaginaria», fecha `2026-11-17`, ubicación «Jardín imaginario de
prueba432», mensaje de guardado y previsualización abierta. La captura inspeccionada
en el turno anterior mostró el nombre largo ajustado al ancho disponible y los
campos coincidentes; no se estableció un tamaño móvil para esa captura.

Recorrido ejecutado en esta sesión:
- Nombre vacío mediante teclado y Guardar: aviso nativo «Completa este campo»,
  foco en Nombres ficticios y estado «Cambios sin guardar».
- Nombre de tres espacios y Guardar: mensaje «No se pudo guardar… Tus cambios
  siguen en pantalla»; no se comunica éxito.
- Recarga real: se recuperan el nombre original y los demás campos guardados.
- Ubicación vacía mediante teclado y Guardar: mismo aviso nativo, foco en Ubicación.
- Ubicación de tres espacios y Guardar: mensaje de fallo de guardado.
- Segunda recarga real: se recupera el borrador original completo. Se abre de
  nuevo Previsualizar y se comprueba coincidencia de nombre, fecha y ubicación.
  La pestaña queda abierta con esa vista, sin conservar los valores inválidos.

La primera llamada de automatización fill para vaciar el nombre no produjo el
cambio esperado en el estado visible; no se contabiliza como caso válido. Se usó
selección y borrado por teclado para comprobar los vacíos. Los clics posteriores
se verificaron mediante estado accesible actualizado. La consulta de consola al
inicio y al final no devolvió errores ni advertencias capturados; esto no equivale
a inspección de tráfico ni a ausencia universal de errores.

Las capacidades de pestaña siguen limitadas a pageAssets y webmcp, además de las
APIs de interacción/consola; no se obtuvo un registro de red. Continúan pendientes
la comprobación completa de solicitudes, límites de longitud y fecha inválida en
navegador, fallos de almacenamiento y revisión de accesibilidad/dispositivos más
amplia. No se activó «Revisar compra simulada» ni publicación.

Sin hallazgos que requieran cambiar código en estos casos. Solo se añade este
registro; no se repitieron suites unitarias, lint o build. Leídos AGENTS.md y
CLAUDE.md. El cotejo SHA-256 de 154 archivos no ignorados, excluidos archivos de
entorno, confirma los otros 153 intactos. Liam y cambios previos conservados;
sin acceso a .env.local ni operaciones de servicios remotos, instalaciones,
commits o despliegues. Se utilizó el servidor existente: no se inició ni detuvo
ningún proceso de aplicación en este turno.

### Límites de longitud y fecha inválida en navegador — 27 de septiembre de 2026

Comprobaciones directas del agente en la pestaña existente del navegador integrado:

- Tras intentar teclear 121 caracteres en Nombres ficticios, el valor observado
  tenía 120 y el atributo maxLength era 120. El tecleo largo agotó el tiempo de
  automatización en un intento parcial; se leyó la longitud antes de completarlo.
- La herramienta paste, tras seleccionar todo, permitió introducir 201 caracteres
  en Ubicación pese a maxLength 200. Guardar mostró «No se pudo guardar…».
  Esto verifica rechazo de un exceso introducido por la automatización, no el
  comportamiento de pegado manual del navegador.
- Caso independiente con longitudes leídas del DOM: nombre de 121 caracteres y
  ubicación de 200. Guardar fue rechazado con el mismo mensaje. Un intento previo
  de paste añadió texto al existente; se descartó como caso exacto y se repitió
  seleccionando todo y comprobando las longitudes antes de concluir.
- Después de recuperar los datos originales, se introdujo por segmentos de
  teclado la fecha imposible 30/02/2026. Al pulsar Guardar apareció el aviso nativo
  «Debes introducir un valor válido. El campo está incompleto o incluye una fecha
  no válida», con foco en el segmento del día. Verificado visualmente mediante
  captura; no hubo mensaje de guardado exitoso. Se corrigió un año intermedio
  mal introducido por la automatización antes de verificar el caso 2026.
- Recarga real final: «Borrador recuperado de este navegador», Baby shower, nombre
  «Bienvenida Aurora, nuestra pequeña estrella de una familia imaginaria», fecha
  2026-11-17 y ubicación «Jardín imaginario de prueba432». Se abrió Previsualizar
  con esos valores, dejando la pestaña como estaba al inicio salvo el mensaje de
  recuperación. Ninguno de los valores inválidos quedó en el borrador recuperado.
- Consulta final de consola: sin errores o advertencias capturados.

No se probó guardar con ambos campos exactamente en sus máximos; no se afirma
aceptación de esos límites a partir del rechazo de excesos. Siguen pendientes
ese caso, errores de almacenamiento simulados en navegador, inspección completa
de tráfico y los límites de accesibilidad/dispositivos ya documentados. No se
activaron compra simulada, pagos ni publicación. Sin validación completa.

Leídos AGENTS.md, CLAUDE.md y el validador local. Sin cambios de código ni nuevas
pruebas unitarias, lint o builds. Solo se añade este registro: los otros 153
archivos del inventario SHA-256 de 154 archivos no ignorados conservan sus hashes
(archivos de entorno excluidos). Liam y cambios locales intactos; sin acceso a
.env.local ni servicios remotos, instalaciones, commits o despliegues. No se
inició ni detuvo el servidor existente.

### Punto de reanudación guardado — 27 de septiembre de 2026

A petición del usuario se conserva todo el progreso local. Rama verificada:
`codex/commercial-local`; HEAD `f3d444184eab90b15dc1a30db184c2b6fdb0719b`.
Los cambios y archivos sin seguimiento siguen en el árbol de trabajo, sin commit;
este registro no constituye respaldo remoto. Este plan es la referencia actual
del laboratorio; project-status.txt conserva antecedentes de una etapa anterior.

Para continuar, consultar los resultados detallados anteriores sin repetirlos:
- Las 83 pruebas, lint y build/HTTP 200–404 son comprobaciones históricas, no
  reejecutadas durante las últimas sesiones de navegador.
- La evidencia manual del usuario y la evidencia directa del agente están
  identificadas por separado. Los últimos dos apartados registran rechazo de
  vacíos, espacios, excesos de longitud y fecha imposible, con recuperación del
  borrador original y previsualización abierta. La validación sigue parcial.
- Siguiente caso: guardar nombres de exactamente 120 caracteres y ubicación de
  exactamente 200, recargar y comprobar su recuperación/previsualización. Conservar
  primero los valores ficticios actuales y restaurarlos al terminar.
- Después quedan errores de almacenamiento si las herramientas permiten
  simularlos, inspección completa de red y cobertura restante de accesibilidad y
  dispositivos. No afirmar captura de red a partir de consola o archivos estáticos.
- Usar la pestaña existente y únicamente el lanzador aislado si hace falta
  reiniciarlo. No iniciar el desarrollo habitual ni detener procesos ajenos.

Límites vigentes: conservar Liam y cambios locales; no leer ni cargar .env.local,
no acceder a servicios reales ni instalar dependencias; sin commits, push,
despliegues, pagos, publicación o integración de etapas posteriores.

En este punto de guardado solo se añadió documentación, sin pruebas ni cambios
de aplicación o navegador. Cotejo de 154 archivos no ignorados, excluidos archivos
de entorno: únicamente cambia este plan; los otros 153 conservan su SHA-256.

### Guardado en límites exactos y restauración — 27 de septiembre de 2026

Comprobación directa del agente en el navegador integrado, sin modificar código:
se sustituyeron temporalmente nombres por 120 letras N y ubicación por 200 letras
U, manteniendo Baby shower y fecha 2026-11-17. Guardar mostró confirmación de éxito.
Tras recarga real y finalización de «Cargando borrador local», apareció «Borrador
recuperado de este navegador». Se compararon los valores completos del estado
accesible con las cadenas de prueba: ambos coinciden exactamente.

Previsualizar mostró los mismos textos completos y la fecha. Las capturas
inspeccionadas muestran que las cadenas sin espacios se distribuyen en varias
líneas dentro de la tarjeta en el ancho actual de escritorio. No se atribuye
esta observación a un viewport móvil ni a una medición completa de desbordamientos.
Una comparación inicial buscó un formato incorrecto del encabezado en el árbol
accesible; se corrigió comparando el nodo de texto completo, que sí coincidía.
La lectura inicial mediante evaluate agotó el tiempo de espera sin modificar
campos; se continuó mediante controles y estado accesible.

Se restauraron y guardaron los valores originales: «Bienvenida Aurora, nuestra
pequeña estrella de una familia imaginaria» y «Jardín imaginario de prueba432».
Una segunda recarga confirmó su recuperación junto con Baby shower y 2026-11-17;
la previsualización quedó abierta con esos datos. Sin errores ni advertencias
capturados en la consulta final de consola. El caso de aceptación de 120/200
caracteres queda comprobado para este recorrido; no es una prueba exhaustiva de
Unicode, dispositivos, almacenamiento o red.

Siguen pendientes errores de almacenamiento en navegador si las herramientas
permiten simularlos, inspección completa de tráfico y cobertura restante de
accesibilidad/dispositivos. No se activó compra simulada, pagos o publicación.
No se repitieron suites unitarias, lint o build ni se alteraron procesos existentes.
Leídos AGENTS.md y CLAUDE.md. Único archivo modificado: este plan; los otros 153
del inventario SHA-256 de 154 archivos no ignorados permanecen intactos (entorno
excluido). Liam y cambios previos conservados; sin acceso a .env.local o servicios
remotos, instalaciones, commits, push o despliegues.

### Recorrido de teclado y vista móvil del agente — 27 de septiembre de 2026

Comprobación directa en la pestaña existente, con viewport temporal de 390 × 844.
Desde Celebración, tras cerrar su menú con Escape, Tab recorrió Nombres, los tres
segmentos de Fecha, el botón del calendario, Ubicación, Guardar, Previsualizar y
Revisar compra simulada. Solo se enfocó este último: no se activó. Shift+Tab volvió
por los controles hasta Celebración en el orden inverso, sin bloqueo del recorrido.

Con foco en Cerrar previsualización, Espacio cerró la tarjeta y Enter la abrió de
nuevo; el foco permaneció en el botón y su estado expandido/contraído cambió en el
árbol accesible. Las capturas muestran foco visible en Nombres y Previsualizar.
No se midió contraste del foco ni se certifica su apariencia en todos los controles.
Al desplazarse se inspeccionaron cabecera, formulario y tarjeta: controles y textos
se ajustan al ancho observado, incluido el nombre largo en la tarjeta. No se hizo
una medición numérica de overflow ni una prueba de lector de pantalla o teléfono.

No se editaron ni guardaron datos. Se conservan Baby shower, nombre de Aurora,
fecha 2026-11-17 y ubicación Jardín imaginario de prueba432. Previsualización abierta.
Se retiró el override de viewport al terminar, restaurando el tamaño normal del
navegador. Consulta final de consola sin errores ni advertencias capturados.

Capacidades revisadas: viewport permite cambiar tamaño y restaurarlo; la pestaña
expone pageAssets y webmcp. No hay API disponible para bloquear almacenamiento,
inyectar fallos de cuota o capturar un registro completo de solicitudes. No se
alteró configuración del navegador, almacenamiento ni código para simularlos.
Errores de almacenamiento en navegador y captura completa de red siguen pendientes;
la evidencia histórica con mocks y la consola no sustituyen esas comprobaciones.
Este recorrido amplía la evidencia parcial de teclado/móvil, no una auditoría
completa de accesibilidad, compatibilidad ni tráfico.

Solo se añadió este registro; sin cambios de aplicación, repetición de suites,
instalaciones, commits, despliegues, pagos o publicación. Leídos AGENTS.md y
CLAUDE.md. Cotejo SHA-256: 153 de los 154 archivos no ignorados intactos; solo cambia
este plan, con archivos de entorno excluidos. Liam y cambios previos conservados.
Sin lectura/carga de .env.local o acceso a servicios remotos; servidor existente
sin iniciar ni detener por esta tarea.

### Ajuste visual y oferta de venta asistida — 30 de septiembre de 2026

Se registran los cambios locales realizados después de la validación del laboratorio. La portada de venta asistida (`src/app/page.tsx`) ahora sigue la dirección visual de la interfaz original: fondo marfil, títulos serif, botones negros, tarjetas claras, espaciado amplio y foco visible. Las muestras de cumpleaños y bautizo, el álbum local y sus componentes comparten la misma paleta neutral. Se conservan el contador de muestra ficticia, el formulario de pedido y la oferta única de 9900 centavos MXN.

La venta se mantiene manual: el formulario prepara un mensaje ficticio para el WhatsApp indicado y requiere revisión del usuario; no envía mensajes por sí mismo, no cobra, no genera comprobantes y no publica invitaciones. El álbum solo crea previsualizaciones locales de archivos seleccionados. La opción «Revisar compra simulada» continúa aislada en el laboratorio y no se conectó a servicios reales ni se amplió.

El lanzador aislado copia explícitamente estas rutas y componentes para que la demo de venta pueda ejecutarse sin la configuración, clientes o servicios del proyecto principal. No se modificaron rutas, recursos, datos ni comportamiento de Liam.

### Evidencia y límites de esta iteración

Comprobación ejecutada por el agente: lint de los archivos de la portada, muestras, componentes nuevos y lanzador; sin errores. La suite histórica del laboratorio registra 84 pruebas aprobadas. No se afirma una nueva validación visual ni de red en esta iteración: el servidor aislado no terminó de responder durante el último intento de recarga y el navegador conserva como pendiente la comprobación directa de la portada actualizada.

Quedan pendientes la inspección completa de tráfico, la revisión en teléfono físico y una nueva comprobación visual directa tras iniciar correctamente el lanzador aislado. No se activaron pagos, publicación ni etapas de bodas, check-in o fotos compartidas.

Se conservaron los cambios locales existentes. No se leyeron ni cargaron archivos `.env.local`, no se consultaron servicios remotos, no se instalaron dependencias y no se hicieron commits, push o despliegues.

### Personalización interactiva de muestras — 5 de octubre de 2026

Las muestras de cumpleaños y bautizo ahora permiten editar nombre, fecha, hora y lugar. La vista previa y el enlace de Google Maps se actualizan en la página. El CTA de $99 MXN prepara un mensaje para WhatsApp con solo los campos que la persona modificó; los datos ficticios precargados no se incluyen por defecto. Un campo vacío o compuesto por espacios queda como «por confirmar». «Restablecer ejemplo» devuelve los cuatro valores iniciales. La edición no se persiste y no transmite datos al cambiar campos.

**Evidencia directa del agente en navegador:** en vista emulada de 375 CSS px se probaron cumpleaños y bautizo. Para cumpleaños se cambiaron nombre, fecha con el control de teclado nativo, hora y lugar; el título, ambas fechas, el enlace de Maps y el borrador de WhatsApp reflejaron los valores editados. En bautizo se comprobó el mismo recorrido, el botón de restablecimiento y su retorno al ejemplo. Los enlaces mostraron «por confirmar» para valores ficticios sin editar. La barra fija de pedido estuvo visible en la vista móvil y las anchuras medidas de documento y cuerpo fueron 375 px, sin desbordamiento horizontal. No se abrió WhatsApp ni se guardaron los datos de prueba; el navegador quedó en bautizo con sus valores ficticios originales.

**Comprobaciones automatizadas ejecutadas:** `npx tsc --noEmit`; ESLint sobre `SimpleDemo`, las dos páginas de muestra y el módulo/prueba de venta asistida; seis pruebas en `src/lib/assisted-sales.test.ts`; `git diff --check`. Todas pasaron. La respuesta local de ambas muestras fue HTTP 200.

En la preparación solicitada para subir los cambios, también pasó `npm test -- --reporter=dot` (267 pruebas en 24 archivos) y `npm run lint` sobre todo el repositorio. No se ejecutó el build completo de Next: se conserva la restricción vigente de no cargar `.env.local`. El lanzador aislado no equivale a un build completo del sitio.

**Pendiente:** recorrido completo de accesibilidad/teclado, un teléfono físico e inspección de tráfico de red. No hay `.vercel` enlazado ni CLI de Vercel disponible en esta copia; por lo tanto no se ha hecho un despliegue ni se valida producción. No se modificaron el evento, las rutas, los datos, los recursos o el comportamiento de Liam. Sin acceso a `.env.local` o servicios remotos; no se activó pago ni compra simulada.

### Plantillas animadas y solicitud de publicación — 5 de octubre de 2026

Se amplió localmente la personalización de las muestras: composiciones y paletas,
apertura animada tipo sobre, secciones configurables, cuenta regresiva y pase QR
ficticio. En la boda hay un control de check-in de demostración cuyo estado vive
solo en pantalla. El QR contiene un identificador de ejemplo; no consulta ni
registra invitados y no enlaza con una invitación publicada. Estas funciones son
demostrativas, no equivalen a check-in real.

**Comprobaciones ejecutadas por el agente:** 10 pruebas focalizadas aprobadas,
TypeScript sin errores, lint de las muestras sin errores, `git diff --check` y
HTTP 200 local en cumpleaños, boda, bautizo y baby shower. El servidor usado fue
el lanzador aislado en `127.0.0.1:3104`. No se repitió una inspección visual ni de
red. No se ejecutó el build completo de la aplicación.

**Publicación solicitada, pendiente:** se creó el commit local
`620010a` (`feat: add animated customizable event samples`) en
`codex/commercial-local`. El panel de Vercel confirma el proyecto `invitea`,
conectado a `MiguelZefe/invitea`, y el dominio de producción
`invitea-iota.vercel.app`; también lista un Preview de un commit anterior. El
código de este commit todavía no está en GitHub, así que ese Preview no lo
contiene. El intento de push fue rechazado por la revisión automática de
seguridad, que solicitó autorización específica para enviar este commit al
repositorio y crear un Preview. No se reintentó. No se cambió producción ni se
afirmó que exista un deployment de esta versión. El árbol no dispone de
`.vercel/project.json`, CLI de Vercel ni CLI de GitHub; no se instalaron
herramientas.

Se conservaron los cambios previos y Liam. No se accedió a `.env.local`, Supabase
ni otros servicios remotos; no hubo pagos, push ni despliegues. Commit local
`620010a` creado para la publicación solicitada; envío remoto pendiente de
autorización explícita tras el bloqueo del revisor automático.

### Compilación aislada antes de Preview — 5 de octubre de 2026

Se ejecutó `node scripts/commercial-lab-local.mjs --production --port 3110`.
La compilación optimizada y TypeScript terminaron correctamente. En ese servidor
aislado, `/`, `/muestras/cumpleanos`, `/muestras/boda`, `/muestras/bautizo` y
`/muestras/baby-shower` respondieron HTTP 200; `/laboratorio-comercial` respondió
HTTP 404. Se detuvo únicamente este proceso de comprobación. Es una compilación
de la lista aislada de archivos, no del proyecto completo ni una validación
visual o de red.

Consulta de solo lectura del panel de Vercel: el proyecto `invitea` muestra
producción lista desde `main`, commit `26a67b4`, y un Preview de
`codex/commercial-local` correspondiente a la versión anterior. El commit de
código `620010a` y el registro documental local permanecen sin enviar; el
rechazo automático del push sigue vigente. No se promovió, desplegó ni modificó
producción. No se cargó `.env.local` ni se consultó Supabase remoto.

### Preview publicado y recorrido directo — 5 de octubre de 2026

Se enviaron los commits `620010a` y `ff276bf` a GitHub,
`MiguelZefe/invitea`, rama `codex/commercial-local`. Vercel generó el
deployment Preview `DCk3YVRoSNLdQCpedbqotUSYkzMC` desde `ff276bf` y lo marcó
**Ready**. La URL de la rama es
`https://invitea-git-codex-commercial-local-miguelzefes-projects.vercel.app/`.
Producción continuó en `main`, commit `26a67b4`; no se promovió el Preview.

**Evidencia directa de navegador del agente:** se abrieron la portada del
Preview y las rutas `/muestras/boda` y `/muestras/cumpleanos`. En boda aparecen
las dos plantillas, los controles de personalización, el conteo y el pase QR
ficticio. «Abrir invitación» mostró los datos de ejemplo. «Simular check-in»
mostró «Acceso ficticio marcado como recibido. No se guardó ni se envió»; se
reinició esa demostración. En cumpleaños se observó el enlace de pedido de $99
MXN dirigido al WhatsApp configurado, sin abrirlo ni enviar un mensaje. Estas
observaciones confirman esos recorridos, no una auditoría visual, móvil, de
accesibilidad o de tráfico de red.

La muestra sigue usando datos ficticios. No se activaron pagos ni check-in real.
No se leyó `.env.local` ni se hizo una consulta deliberada a Supabase. La
inspección completa de red y la revisión del Preview en móvil siguen pendientes.

### Revisión móvil del Preview y ajuste de la tarjeta — 5 de octubre de 2026

**Evidencia directa de navegador:** se revisaron portada, cumpleaños, boda y
bautizo en una vista emulada de 390 × 844. En esas páginas, el ancho del
documento fue de 375 CSS px frente a 390 CSS px de viewport, sin desbordamiento
horizontal medido. Las capturas muestran controles y tarjetas legibles en la
zona inspeccionada, incluido el QR ficticio de boda. No equivale a una prueba
en teléfono físico ni a una auditoría completa de accesibilidad.

En cumpleaños, el nombre «Luna (ficticia)», la fecha editada mediante el teclado
nativo y el lugar «Jardín imaginario» se reflejaron en la invitación; el borrador
de WhatsApp incluyó solo los datos ficticios editados. No se abrió WhatsApp ni
se envió el mensaje. Se restauró el ejemplo al terminar.

La revisión encontró un defecto visual concreto en móvil: con la carta abierta,
el botón para cerrarla se superponía al último texto de la tarjeta de fecha.
La separación medida era de −21,8 px. Se reservó más espacio inferior en el
contenedor de la invitación. En el lanzador aislado, la nueva separación fue de
42,2 px en cumpleaños y 59,9 px en boda a 390 CSS px; en boda a 1280 CSS px fue
de 109,6 px. Las capturas posteriores muestran el texto y el botón separados.
El arreglo se comprobó después en el Preview de Vercel del commit `2695607`
(despliegue `AjzVH7dK4CBVXYeD5wM4QwQU1mSc`, estado Ready). En la muestra de
cumpleaños abierta a 390 CSS px, la separación volvió a ser de 42,2 px; la
captura muestra el texto y el botón sin superposición. La anchura del documento
fue de 375 CSS px, sin desbordamiento horizontal medido en ese recorrido.

La herramienta del navegador no expuso un registro completo de solicitudes;
la inspección de tráfico remoto sigue pendiente. No se leyó `.env.local` ni se
consultó Supabase deliberadamente. El servidor local usado para comprobar el
arreglo se detuvo al terminar.
