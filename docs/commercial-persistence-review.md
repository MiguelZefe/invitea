# Persistencia comercial: revisión local y requisitos pendientes

Fecha: 2026-09-17. Rama de trabajo: codex/commercial-local.
Estado: diseño conceptual; no es una migración ni autorización de despliegue.

## Evidencia disponible

Fuente documental: docs/supabase-schema-sanitized.txt, exportación parcial Q19.
Contiene 73 columnas de 7 relaciones de public: events (21), event_guests (11),
rsvps (8), event_groups (10), event_guest_groups (4),
event_guest_space_assignments (7) y event_spaces (12).
Son metadatos locales; no acreditan el catálogo remoto vigente ni su completitud.
No se reconstruye el nombre de columna oculto de event_guests.

| Área | Evidencia local | Pendiente para persistencia |
| --- | --- | --- |
| Propietario | events.owner_id figura como uuid no nulo; la creación usa auth.getUser | FK, identidad de referencia, permisos y políticas completas |
| Identidad pública | events.id y slug presentes; creación reintenta ante error 23505 | PK, unicidad real de slug, índices y dependencias |
| Creación | dashboard/nueva/actions.ts inserta directamente en events | Separación efectiva entre borrador privado e invitación pública |
| Lectura pública | public-invitation-data.ts consulta events por slug sin estado comercial | Protección en base/API/RPC además del filtro de interfaz |
| Invitados | Consultas a event_guests; RPC get_public_guest_invitation | Definición y permisos de la RPC; vínculo de token con evento publicado |
| RSVP | WeddingRSVP.tsx llama submit_public_rsvp; rsvps contiene event_slug y guest_id | Definición, restricciones, validación y permisos; preservar enlaces heredados |
| Check-in | Acciones locales consultan events, event_guests y rsvps | Garantías de concurrencia en base y autorización efectiva |
| Pagos | No aparecen relaciones comerciales en Q19 | No asumir inexistencia remota; inventario completo y proveedor por elegir |
| Compatibilidad | Código mantiene presentación y fallback propios de Liam | Regresión de slugs, tokens, medios, RSVP y check-in en réplica sintética |

Docker, psql y supabase no se encontraron en PATH. No se afirma que no existan
instalaciones fuera del PATH. No se inició ni consultó una base local o remota.
El lanzador actual únicamente sirve la demostración aislada, no aporta PostgreSQL.

## Modelo conceptual a contrastar con el esquema completo

Los nombres siguientes son conceptos, no nombres de tablas aprobados.

- Borrador comercial privado: identificador, propietario, contenido validado,
  versión para detectar edición concurrente y fechas. No incluirlo en la lectura
  pública actual de events antes de tener una protección comprobada.
- Compra por evento: propietario y evento inmutables, importe entero y moneda
  fijados por servidor. Una compra no equivale a cada intento del proveedor.
- Intento de pago: referencia de compra, identificador del proveedor, clave de
  idempotencia y estado mapeado desde el proveedor; permitir reintentos auditables.
- Notificación procesada: proveedor más identificador único, intento relacionado,
  resultado de validación y fecha. Evitar almacenar por defecto el payload completo
  del proveedor, que puede contener datos personales.
- Derecho de publicación: activación vinculada a la compra confirmada. Ediciones
  del mismo evento conservan ese derecho. Reembolsos, contracargos y expiración
  requieren una política comercial todavía no definida.
- Publicación: separada del pago. Confirmación y activación necesitan una operación
  transaccional; la respuesta del navegador no acredita ninguna de ellas.

La identidad viene de sesión validada; nunca de un owner_id aceptado del cliente.
El servidor verifica firma del proveedor y coteja compra, intento, importe, moneda
y beneficiario. Claves únicas y transacciones deben respaldar idempotencia incluso
con varios procesos. Un Map de JavaScript no demuestra esas garantías.
Dos pagos exitosos pueden corresponder a un mismo evento: activar una vez no
resuelve el cobro duplicado. Registrar y conciliar el segundo pago sin ocultarlo;
la devolución no se debe improvisar desde la interfaz ni ejecutar en este bloque.

## Incorporación compatible propuesta (sin SQL ejecutable)

1. Reproducir el esquema verificado en un entorno local descartable y sembrar
   únicamente dos compradores y eventos ficticios, incluido un caso heredado.
2. Añadir almacenamiento comercial privado de forma aditiva. No cambiar por defecto
   los eventos existentes a borrador, pendiente de pago ni expirados.
3. Probar lectura directa, vistas y todas las RPC con identidad anónima, propietario
   y otra cuenta. Un borrador no debe aparecer por slug, invitación, RSVP o token.
4. Añadir confirmación y activación transaccional en la réplica; simular duplicados,
   orden invertido, caída después de confirmar y dos notificaciones simultáneas.
5. Integrar creación comercial solo después de superar esas pruebas. Mantener
   el flujo heredado y Liam fuera de la clasificación comercial automática.
6. Ensayar reversión en la réplica: desactivar el nuevo flujo sin borrar comprobantes,
   compras o invitados y sin abrir borradores al público. Los pasos exactos dependen
   del esquema; no se incluye DROP ni reversión destructiva especulativa.

## Evidencia humana necesaria

Ya existe docs/supabase-schema-audit.sql con consultas numeradas Q01-Q19 y su guía
docs/supabase-schema-audit.md. No crear otro script redundante ni ejecutar el actual
automáticamente. El paquete describe cómo exportar metadatos sin filas de negocio.

Faltan resultados sanitizados Q01-Q18 y procedencia: fecha, entorno lógico,
versión PostgreSQL y alcance/rol técnico utilizado. Q19 también debe confirmarse
vigente; la fecha de modificación del archivo no acredita la fecha de extracción.
Registrar por consulta: completa, vacía, truncada o error sanitizado. Una sección
ausente no demuestra que el objeto no exista.

Prioridad de revisión: relaciones/columnas/restricciones/índices (Q01-Q04),
RPC/vistas/triggers (Q05-Q08), políticas y privilegios (Q09-Q14) y dependencias
e historial identificado (Q15-Q18). Conservar Q19 original como antecedente;
guardar la nueva entrega por separado en docs/supabase-schema-commercial-input.txt.
No poner exportaciones en public ni compartir contraseñas, tokens o filas reales.

El paquete omite intencionalmente expresiones y cuerpos. Incluso con Q01-Q19
puede hacer falta una segunda revisión sanitizada de USING/WITH CHECK, funciones
RPC, triggers, defaults, search_path y opciones de vistas. No declarar la base
reproducible hasta resolver esas omisiones.

Para ejecutar posteriormente la réplica también hará falta autorización específica
para instalar herramientas si no existe un entorno local disponible. No solicitar
claves de producción ni reutilizar .env.local para esa réplica.

## Verificación de este bloque

Revisión de documentos y referencias del código, sin ejecución de SQL, RPC,
servidor real, pruebas contra Supabase ni lectura de .env.local. Confirmada
ausencia de public/supabase-schema-sanitized.txt y presencia de la fuente en docs.
La regla docs en .vercelignore sigue protegiendo esta documentación en un futuro
paquete que aplique el archivo local; no se verificó empaquetado con Vercel CLI.
Solo se creó este informe y se actualizó el plan; no cambió código ni se repitieron
tests/build. Las 83 pruebas aprobadas corresponden al bloque previo en memoria.
