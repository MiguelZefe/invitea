# Revisión de esquema Supabase: exportación parcial Q19

Fecha de revisión local: 2026-09-16.

**Decisión: evidencia insuficiente; migración de WhatsApp bloqueada.**
No se preparó propuesta de migración ni SQL ejecutable. Q19 acredita el contenido
de un archivo local de columnas; no confirma el esquema remoto vigente.
**SEC-01 corregido localmente:** tras autorización explícita se eliminó únicamente
`public/supabase-schema-sanitized.txt`. La fuente canónica
`docs/supabase-schema-sanitized.txt` continúa presente y conserva su hash.
No se verificó ni modificó ningún despliegue remoto.

La comparación y matriz siguientes describen la revisión previa a la retirada.
No se restauró la copia para actualizar este documento. El esquema continúa
insuficiente y la integración real de WhatsApp sigue bloqueada.

## Alcance y fuentes

Se revisaron AGENTS.md, docs/project-status.txt, docs/whatsapp-schema-blocker.md,
docs/whatsapp-local-delivery.md, docs/supabase-schema-audit.md,
docs/supabase-schema-audit.sql y ambas exportaciones Q19.
Se contrastaron las acciones de creación/edición, las consultas del dashboard,
la lectura pública, el proxy y el contrato WhatsApp locales.
Se consultó la guía instalada
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/public-folder.md`
para verificar el tratamiento de archivos públicos de esta versión.

El HTTP 401 de metadatos sigue siendo un antecedente documentado, no una
respuesta obtenida aquí. No se consultó Supabase, no se ejecutó SQL ni RPC,
ni se leyeron filas de negocio o datos personales. No se abrieron credenciales.
Las entradas de Q19 son metadatos de columnas, no eventos ni invitados reales.
Los nombres técnicos de campos no son los valores personales que podrían alojar.

## Estado inicial de Git

- Rama: `codex/liam-visual-effects`.
- Commit: `c3839f582396d5797588b6545fd4fc9e095e1422`.
- Fecha del commit: 2026-09-07T01:19:15-06:00.
- 18 archivos rastreados modificados y 24 nuevos sin seguimiento: 42 rutas.
- Sin cambios staged ni conflictos de índice.
- 140 archivos rastreados o nuevos no ignorados registrados mediante SHA-256.
- Este documento no existía al iniciar. Los demás cambios son preexistentes.
- No se consultó el remoto ni se modificó el índice.

Inventario inicial (M: modificado; ??: nuevo; segmento personal omitido):

```text
 M docs/arquitectura.md
 M docs/changelog.md
 M src/app/dashboard/[slug]/checkin/actions.ts
 M src/app/dashboard/[slug]/checkin/page.tsx
 M src/app/dashboard/[slug]/invitados/actions.ts
 M src/app/dashboard/[slug]/invitados/page.tsx
 M src/app/dashboard/[slug]/page.tsx
 M src/app/invitacion/[slug]/page.tsx
 M src/app/[OMITIDO]/page.tsx
 M src/components/Navbar.tsx
 M src/components/baby-shower/BabyShowerInvitation.tsx
 M src/components/baby-shower/BabyVoiceMessage.tsx
 M src/components/dashboard/CheckInPanel.tsx
 M src/components/dashboard/EventMetrics.tsx
 M src/components/dashboard/ManualGuestSearch.tsx
 M src/components/wedding-demo/DemoRSVP.tsx
 M src/components/wedding-demo/WeddingRSVP.tsx
 M src/types/event.ts
?? docs/project-status.txt
?? docs/supabase-schema-audit.md
?? docs/supabase-schema-audit.sql
?? docs/supabase-schema-sanitized.txt
?? docs/whatsapp-local-delivery.md
?? docs/whatsapp-real-local.md
?? docs/whatsapp-schema-blocker.md
?? docs/whatsapp-schema-review.md
?? public/invitea-logo.svg
?? public/supabase-schema-sanitized.txt
?? src/app/icon.svg
?? src/components/PublicInvitation.tsx
?? src/components/baby-shower/BabyVoiceMessage.test.ts
?? src/components/dashboard/LoadError.tsx
?? src/components/dashboard/load-errors.test.ts
?? src/components/wedding-demo/DemoRSVP.test.ts
?? src/components/wedding-demo/WeddingRSVP.test.ts
?? src/lib/current-rsvp.test.ts
?? src/lib/current-rsvp.ts
?? src/lib/event-whatsapp.test.ts
?? src/lib/event-whatsapp.ts
?? src/lib/invitation-presentation.ts
?? src/lib/public-invitation-data.ts
?? src/lib/public-invitation.test.ts
```

## Comparación y fuente canónica

**Fuente canónica documental: `docs/supabase-schema-sanitized.txt`.**
Es la ubicación prevista por el paquete de auditoría y conserva más nombres
técnicos útiles. Es canónica para esta revisión local, no una certificación del
catálogo remoto. La copia de public no debe convertirse en fuente maestra.

| Aspecto | docs | public | Interpretación |
|---|---|---|---|
| Última modificación local UTC | 2026-09-14 01:22:34.836 | 2026-09-14 01:32:15.807 | public es posterior por mtime, unos 9 min 41 s |
| Tamaño | 8357 bytes | 8358 bytes | Diferencia combinada de formato y sustituciones |
| Entradas CSV | 73 | 73 | Coinciden con el total declarado |
| Encabezados | 18 | 18 | Mismos nombres y orden |
| Relaciones distintas | 7 | 7 | Mismo inventario nominal |
| Finales de línea | 78 CRLF | 80 LF | Diferencia de formato |
| Líneas vacías al dividir el texto | 1 | 3 | public añade dos líneas vacías |
| Codificación | UTF-8 sin BOM | UTF-8 sin BOM | Sin diferencia de BOM |
| Nombres de columnas ocultos | 1 | 7 | public agrega seis sustituciones |
| Entradas ausentes frente a la otra copia | 0 | 0 | No hay pérdida de registros entre copias |
| Completitud del esquema | Parcial Q19 | Parcial Q19 | Ninguna contiene Q01-Q18 |

La fecha de extracción, el entorno lógico, el rol técnico y la cadena de
procedencia no están documentados suficientemente. Los timestamps del sistema
de archivos pueden reflejar copia o sincronización; **no permiten determinar
cuál representa una consulta de Supabase más reciente**.

Comparación por esquema, relación y posición ordinal:

| Relación y posición | Diferencia en public respecto a docs |
|---|---|
| event_guests, posiciones 3, 4 y 5 | Tres nombres técnicos sustituidos por marcador de campo personal |
| events, posiciones 12 y 16 | Dos nombres técnicos sustituidos por marcador de campo URL |
| rsvps, posición 3 | Un nombre técnico sustituido por marcador de campo personal |
| event_guests, posición 8 | Nombre omitido en ambas; no se reconstruye |
| Resto de celdas | Sin diferencias |

No cambian tipos, nulabilidad, orden, esquema ni las restantes propiedades.
Las sustituciones no prueban una alteración del esquema ni una contradicción
de tipos. public pierde información nominal útil; el mismo marcador para
varias columnas impide usarlo como alias único. Las posiciones permiten
comparar sin revelar ni adivinar el nombre oculto.

Conteos por relación: event_groups 10; event_guest_groups 4;
event_guest_space_assignments 7; event_guests 11; event_spaces 12;
events 21; rsvps 8. Son conteos de columnas exportadas, nunca de personas
o registros de negocio. No demuestran completitud respecto al servicio.

## Sanitización y defecto de exposición

La inspección estructural y de contenido encuentra metadatos con tipos text,
integer, uuid y timestamp with time zone, nulabilidad YES/NO y propiedades
de information_schema. `uuid` es un nombre de tipo: no hay valores UUID
personales en las exportaciones. Los ordinales son posiciones de columnas,
no identificadores de invitados. No aparecen OID de propietarios.

No se detectaron claves, valores de tokens, contraseñas, URLs privadas,
direcciones de correo, teléfonos, nombres de personas ni filas de negocio.
No hay cuerpos de funciones, literales de defaults o mensajes de error
potencialmente sensibles que sanitizar. No se garantiza la procedencia de
la exportación mediante esta inspección; solo se evalúa el contenido local.

Los nombres de columnas que describen campos personales o enlaces no son
datos personales ni URLs privadas por sí mismos. Ocultarlos adicionalmente
no mejora necesariamente la sanitización y reduce la verificabilidad.
El nombre ya omitido se mantiene omitido y se registra como desconocido.
No se recrearon valores ni se sustituyó una copia por otra.
**No fue necesario modificar las exportaciones para retirar valores sensibles.**
Completar la sanitización no permite inventar el esquema faltante.

**SEC-01 — Inventario interno dentro de una carpeta servida públicamente.**
La guía instalada de Next.js indica que los archivos de public se sirven
desde la raíz del sitio. El matcher local de src/proxy.ts no incluye esta
ruta estática. Por tanto, la copia está preparada para ser accesible como
archivo estático cuando la aplicación se sirva con ella presente.
Ocultar seis nombres no oculta la estructura, relaciones, tipos y nulabilidad.
La auditoría prescribe guardar la exportación en docs, sin necesidad funcional
de publicarla. Este inventario no debería conservarse en public.

Se trata de un defecto local de exposición de metadatos internos, **no de una
filtración remota comprobada** ni de evidencia de compromiso de datos.
No se abrió servidor, navegador, endpoint ni despliegue para comprobar acceso.
La ubicación docs evita el servido estático convencional, pero no hace privado
por sí mismo un repositorio publicado.

Acción completada en el bloque de retirada autorizado: se eliminó únicamente
public/supabase-schema-sanitized.txt, preservando la canónica y esta comparación.
No se cambió configuración, proxy, permisos ni despliegues. Los detalles de
exposición anteriores describen el hallazgo previo, no un archivo aún presente.

## Matriz completa de evidencia

“Confirmado” significa observado en el archivo o código local indicado.
No significa verificación remota. Se separan los aspectos conocidos y ausentes
del mismo elemento. “Inferido” no autoriza DDL; “ausente” no significa inexistente.
No se demostró contradicción de esquema entre copias: sus diferencias son
redacciones. La afirmación histórica de ausencia de Q19 ya quedó superada.

| Elemento | Evidencia encontrada | Fuente | Estado | Impacto en la migración | Acción necesaria |
|---|---|---|---|---|---|
| 1. Relación de eventos documentada | Q19 enumera public.events y 21 columnas | Q19 de docs | confirmado | Candidato documental de destino | Confirmar vigencia y procedencia |
| 1. Tabla real y clase de relación | Q19 no acredita si es tabla base, vista u otra clase; código espera events | Q19; acciones locales | inferido | No se puede fijar destino DDL definitivo | Q01 con relkind, identidad y esquema |
| 2. Esquema declarado | Las 73 entradas declaran public | Ambas Q19 | confirmado | Alcance visible del archivo | Confirmar esquema real y esquemas expuestos por API |
| 2. Propietario y versión | No hay propietario, versión PostgreSQL ni privilegios de ejecución | Q19 | ausente | Impide diseñar permisos y compatibilidad | Q01, Q13-Q14 y versión/procedencia sanitizadas |
| 3. Columnas visibles | 73 entradas; tipos, posiciones y nulabilidad; ninguna columna WhatsApp visible | Q19 de docs | confirmado | Describe parcialmente contrato actual | Confirmar completitud y nombres definitivos |
| 3. Columna omitida y actualidad | Nombre oculto en posición 8 de event_guests; rol/fecha de extracción sin acreditar | Ambas Q19 | ausente | No se puede certificar enlace personal ni completitud | Alias único seguro y descripción contractual; procedencia |
| 3. Defaults y generación | Q19 omite column_default; indicadores no equivalen a definiciones completas | Q19; SQL Q19 | ausente | No permite revisar compatibilidad de inserciones | Q02 y expresiones sanitizadas pertinentes |
| 3. PK, FK, UNIQUE y CHECK | No se exportaron restricciones ni acciones referenciales | Q19 | ausente | Integridad y cascadas desconocidas | Q03 y expresiones CHECK sanitizadas |
| 3. Índices | No se exportaron índices, predicados ni expresiones | Q19 | ausente | No se sabe si hay dependencias o requisitos | Q04 y definiciones relevantes sanitizadas |
| 4. Creación/edición en código | Insert/update directos a events, validateInvitationForm y filtro owner_id al editar; sin persistencia WhatsApp | src/app/dashboard/nueva/actions.ts; src/app/dashboard/[slug]/editar/actions.ts | confirmado | Identifica consumidores futuros | Confirmar que sea el flujo vigente desplegado |
| 4. Efectos efectivos de escritura | No constan triggers, defaults, permisos ni contrato de escritura remoto | Código frente a Q19 | ausente | No se valida compatibilidad de creación/edición | Completar restricciones, funciones, RLS y grants |
| 5. Dashboard local | Detalle selecciona evento y RSVP con *; consulta invitados; edición usa selección explícita sin WhatsApp | src/app/dashboard/[slug]/page.tsx; editar/page.tsx | confirmado | Nuevas columnas pueden propagarse por *; faltan controles | Revisar selecciones y consumidores después del esquema |
| 6. Lectura pública local | PUBLIC_EVENT_FIELDS excluye WhatsApp; componente admite props opcionales | src/lib/public-invitation-data.ts; src/components/PublicInvitation.tsx | confirmado | Cambiar tipos no habilita lectura remota | Adaptación futura tras confirmar exposición autorizada |
| 6. Permiso público del número | No hay permiso confirmado para exponer configuración WhatsApp | Q19; bloqueo histórico | ausente | No se puede ampliar lectura pública con seguridad | Decidir exposición y acreditar RLS/grants de lectura |
| 7. RPC y funciones | Código referencia get_public_guest_invitation y submit_public_rsvp | Lectura pública; WeddingRSVP.tsx | inferido | Firmas en código no acreditan funciones reales | Q05-Q06 y definiciones sanitizadas |
| 7. Contrato de RPC | Faltan firmas SQL, retornos, propietario, modo de seguridad, search_path, cuerpos y permisos | Exportación parcial | ausente | Riesgo en selección por token, validación y RSVP | Revisar definiciones sin ejecutarlas |
| 8. Vistas/materializadas | Sin resultados de inventario ni definiciones | Q19 | ausente | Posibles dependencias de events o SELECT * desconocidas | Q07 y definición/opciones sanitizadas pertinentes |
| 9. Triggers | Sin inventario, estado ni funciones vinculadas | Q19 | ausente | Efectos indirectos de inserción/edición desconocidos | Q08 y definiciones sanitizadas de función/trigger |
| 10. RLS | Sin ENABLE/FORCE, políticas, roles, comandos, USING o WITH CHECK | Q19 | ausente | Aislamiento público/propietario sin acreditar | Q01, Q09 y expresiones sanitizadas |
| 10. Grants y roles | Sin ACL, grants por columna, defaults, propietarios ni membresías | Q19 | ausente | No se puede definir acceso mínimo ni reversión | Q10-Q14; contexto efectivo y API expuesta |
| 11. Relaciones en código | owner_id, event_id, guest_id y event_slug relacionan consultas; created_at selecciona RSVP vigente | Acciones, dashboard y src/lib/current-rsvp.ts | confirmado | Identifica flujos potencialmente afectados | Contrastar con relaciones SQL |
| 11. Dependencias SQL | Nombres/columnas de invitados, grupos y espacios visibles, pero sin FK ni mapa de dependencias | Q19 | inferido | No prueba integridad, cascadas ni consumidores completos | Q03, Q15-Q16 y Q18; revisión de SQL dinámico |
| 11. RSVP, métricas, historial y check-in | No se confirma inserción vs actualización RSVP, vínculo general, cascadas o atomicidad | Bloqueo histórico; código | ausente | No se puede garantizar conservación del historial ni efectos indirectos | Definiciones de RPC, triggers y FK; sin leer filas |
| 12. Migraciones locales | No hay estructura/herramienta/baseline confirmados; SQL encontrado es auditoría SELECT | Inventario local; docs/supabase-schema-audit.sql | ausente | No se puede usar una estructura real de migraciones aún desconocida | Aportar convención y archivos de migración existentes |
| 12. Migraciones aplicadas | Sin evidencia sanitizada de historial/versiones ni vínculo con baseline | Exportación parcial | ausente | No permite planificar orden, compatibilidad o reversión | Q17 solo para localización; manifiesto existente sanitizado |
| Procedencia de la exportación | Fecha, entorno lógico, rol, completitud y truncaciones sin acreditar | Cabeceras Q19 y mtime | ausente | No se valida vigencia ni ausencia de objetos | Completar ficha de procedencia sin URL ni identificadores privados |
| Diferencias entre copias | Seis nombres adicionales ocultos en public; resto de celdas iguales | Comparación local | confirmado | Pérdida de información, no contradicción del esquema | Mantener docs canónica y no reconstruir nombres ocultos |

## Bloqueo preciso y obtención de faltantes

Faltan todos los siguientes grupos críticos; no se compensa su ausencia
con las 176 pruebas históricas de aplicación:

1. **Identidad del destino:** clase de relación, esquema confirmado,
   propietario, versión PostgreSQL, fecha/entorno lógico/rol de extracción
   y alcance de API. Aportar Q01 y ficha de procedencia.
2. **Contrato completo de columnas e integridad:** Q02-Q04; defaults,
   dominios/generación, PK/FK/UNIQUE/CHECK, cascadas, índices y expresiones
   sanitizadas necesarias. Q19 no devuelve defaults.
3. **Funciones y efectos indirectos:** Q05-Q08, firmas/retornos y definiciones
   sanitizadas de RPC, funciones, vistas/materializadas y triggers relacionados;
   propietario, SECURITY DEFINER/INVOKER, search_path y opciones relevantes.
4. **Acceso:** ENABLE/FORCE RLS, políticas completas y expresiones sanitizadas,
   grants/revokes de esquema/tabla/columna/secuencia/rutina, privilegios por
   defecto, roles y membresías (Q09-Q14 y Q01). No confundir ACL con acceso
   efectivo ni defaults de privilegios con permisos ya concedidos.
5. **Dependencias:** Q03, Q15-Q16 y Q18, complementados con definiciones relevantes
   para detectar relaciones que pg_depend no registra, incluido SQL dinámico.
   Acreditar efectos sobre propietario, invitados, RSVP general y personal,
   métricas, historial, edición de pases y check-in sin inspeccionar filas.
6. **Migraciones:** herramienta, carpeta/convención real, baseline, archivos
   previos y manifiesto sanitizado de versiones aplicadas. Q17 solo localiza
   candidatos; no confirma historial. No inventar una carpeta supabase/migrations.
7. **Exposición del número:** confirmar nombres definitivos y autorización
   para lectura pública, manteniendo separación de RSVP y WhatsApp.

Cómo obtenerlo: el usuario u operador autorizado puede exportar manualmente
los resultados de catálogos del paquete de auditoría, consulta por consulta,
sin SELECT sobre tablas de negocio ni ejecución de RPC. Aportar únicamente
metadatos sanitizados, registrando resultados vacíos, denegados o truncados.
No cambiar roles, políticas o credenciales para sortear una denegación.
Las definiciones omitidas deben revisarse en origen para ocultar literales
sensibles; usar alias estables, nunca restaurar secretos para completar datos.

Para migraciones, aportar archivos y manifiestos existentes sanitizados;
no consultar filas de tablas de historial en este bloque. Si no existe evidencia
suficiente, marcarla ausente. Todo lo anterior es una instrucción documental
para una entrega posterior: no se ejecutó contra Supabase en esta revisión.

## Decisión y límites de la preparación

**No existe evidencia suficiente para preparar la migración local solicitada.**
No se genera DDL, SQL de reversión, archivo de migración ni propuesta aprobable
basada en una estructura inventada. Los informes de bloqueo se conservan intactos.

El contrato histórico menciona whatsapp_number opcional y whatsapp_primary
con preferencia false. Su compatibilidad SQL, nulabilidad/default definitivos,
restricción y reversión **siguen sin confirmar**; no se convierten aquí en
una propuesta de migración. No se sugiere índice, RPC o ampliación RLS sin evidencia.

Cuando se resuelva el bloqueo, deberán revisarse para una adaptación posterior,
sin modificarlos ahora:

- src/lib/event-whatsapp.ts y src/types/event.ts: contrato y nombres definitivos.
- src/lib/invitation-form.ts: validación compartida y tratamiento de los campos.
- src/components/dashboard/NewInvitationForm.tsx y EditInvitationForm.tsx:
  controles, precarga y explicación de exposición pública.
- src/app/dashboard/nueva/actions.ts y src/app/dashboard/[slug]/editar/actions.ts:
  validación servidor y persistencia autorizada.
- src/app/dashboard/[slug]/editar/page.tsx y page.tsx: selecciones y consumidores.
- src/lib/public-invitation-data.ts: lista pública explícita.
- src/components/PublicInvitation.tsx y wedding-demo/WeddingRSVP.tsx:
  integración de configuración confirmada sin convertir WhatsApp en RSVP.
- Pruebas correspondientes de WhatsApp, formulario e invitación pública.

## Comprobaciones y preservación de la revisión original

Comprobaciones documentales ejecutadas: CSV de 18 campos, 73 entradas en cada
copia, cero entradas malformadas y cero posiciones duplicadas; comparación
por esquema/relación/ordinal y por celda; formato/BOM/mtime; inspección de
patrones sensibles y lectura contextual; inventario de migraciones y Git.

Solo se crea docs/supabase-schema-review.md. Cotejo SHA-256 de los 140 archivos
preexistentes: sin modificaciones ni pérdidas. Ambas exportaciones y los informes
anteriores permanecen intactos. Estado final: 18 modificados y 25 nuevos,
incluido este documento. Sin cambios staged ni conflictos.

No se consultó Supabase ni filas de negocio; no hubo RPC, escrituras de datos,
cambios de aplicación/configuración/entorno, instalaciones, commits, push o
despliegues. No se ejecutaron pruebas de aplicación, lint, tipos o build:
no hubo cambio de código. No se publicaron resultados ni se comprobaron endpoints.

## Retirada autorizada y actualización documental

En el bloque de retirada se verificó que el archivo público contenía únicamente
la exportación Q19, no un recurso funcional de la invitación. Se eliminó solo
public/supabase-schema-sanitized.txt. No había referencias funcionales a esa
ruta en el código ni configuración. No quedó otra exportación equivalente
dentro de public; la búsqueda posterior inspeccionó los 10 archivos restantes.

La fuente canónica docs/supabase-schema-sanitized.txt conservó su hash SHA-256.
Todos los demás archivos conservaron sus hashes durante la retirada: de 141
archivos previos solo desapareció el autorizado. El inventario de nuevos bajó
de 25 a 24; los 18 archivos rastreados modificados permanecieron sin cambios.
No se eliminaron otros archivos ni se modificaron documentos en aquel bloque.

En esta actualización se modifican únicamente docs/project-status.txt y este
documento para registrar el nuevo estado. La canónica sigue presente e intacta;
la copia pública sigue ausente. Se comprobaron referencias funcionales, ausencia
de exportaciones equivalentes y hashes de los restantes archivos. No hay
referencias rotas detectadas; las menciones documentales a la ruta son históricas.
Git actual: 18 modificados y 24 nuevos, sin cambios staged ni conflictos.

En ambos bloques no hubo cambios remotos, consultas Supabase, escrituras de datos,
instalaciones, migraciones, commits, push ni despliegues. No se modificó código,
configuración ni entorno. No se ejecutaron pruebas de aplicación; los resultados
históricos no se presentan como una ejecución nueva.

## Siguiente bloque pequeño recomendado

Completar la evidencia faltante del esquema antes de preparar SQL:
restricciones, defaults, RPC, vistas, triggers, RLS, grants, dependencias
y estructura de migraciones, con procedencia y definiciones sanitizadas.
La lista precisa y la forma de obtener metadatos sin filas personales se
conservan en la sección de bloqueo.

El esquema sigue siendo insuficiente; la integración real de WhatsApp y la
migración local continúan bloqueadas. No preparar ni aplicar SQL con Q19 solo.
Fin de esta actualización documental.

