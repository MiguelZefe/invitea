# Entrega local: WhatsApp por evento
Contenido completo y exacto de los tres archivos de código cambiados en esta sesión y del documento técnico nuevo. Copiar cada bloque a su ruta relativa desde la raíz del proyecto. Los demás cambios locales preexistentes se conservan.

## src/lib/event-whatsapp.ts

````ts
export type EventWhatsApp = { whatsapp_number?: string | null; whatsapp_primary?: boolean };

export function isWhatsAppNumber(value: unknown): value is string {
  return typeof value === "string" && /^[1-9]\d{7,14}$/.test(value);
}

export function canWhatsAppBePrimary(config: EventWhatsApp): boolean {
  return config.whatsapp_primary === true && isWhatsAppNumber(config.whatsapp_number);
}

// Uses the existing RSVP status values. The caller validates the form and passes
// only public fields; this formatter has no persistence or browser side effects.
export function encodeWhatsAppMessage(input: {
  eventTitle: string;
  fullName: string;
  attendanceStatus: "confirmed" | "declined";
  guestsCount: number;
  message?: string;
}): string {
  return encodeURIComponent([
    `Evento: ${input.eventTitle.trim()}`,
    `Nombre: ${input.fullName.trim()}`,
    input.attendanceStatus === "confirmed" ? "Asistiré." : "No podré asistir.",
    input.attendanceStatus === "confirmed" ? `Cantidad de asistentes: ${input.guestsCount}` : "",
    input.message?.trim() ? `Mensaje: ${input.message.trim()}` : "",
  ].filter(Boolean).join("\n"));
}

// User input requires + and a country code; stored values contain only digits.
export function normalizeWhatsAppInput(input: string): string | null {
  const value = input.trim();
  if (!/^\+[1-9][\d -]*\d$/.test(value)) return null;
  const digits = value.replace(/[+ -]/g, "");
  return isWhatsAppNumber(digits) ? digits : null;
}

// Local contract, deliberately not connected to writes until schema verification.
export function validateEventWhatsApp(form: FormData):
  | { success: true; values: Required<EventWhatsApp> }
  | { success: false; message: string } {
  const raw = form.get("whatsapp_number");
  const primary = form.get("whatsapp_primary") === "on";
  const number = typeof raw === "string" && raw.trim() ? normalizeWhatsAppInput(raw) : null;
  if ((raw !== null && typeof raw !== "string") || (typeof raw === "string" && raw.trim() && !number) || (primary && !number)) {
    return { success: false, message: "Indica un número internacional válido con + y código de país para usar WhatsApp." };
  }
  return { success: true, values: { whatsapp_number: number, whatsapp_primary: primary } };
}
````

## src/lib/event-whatsapp.test.ts

````ts
import { expect, it } from "vitest";
import { canWhatsAppBePrimary, encodeWhatsAppMessage, isWhatsAppNumber, normalizeWhatsAppInput, validateEventWhatsApp } from "./event-whatsapp";

it("normalizes explicit international input and prepares the local contract", () => {
  const form = new FormData();
  form.set("whatsapp_number", " +1 202-555-0100 ");
  form.set("whatsapp_primary", "on");
  expect(validateEventWhatsApp(form)).toEqual({ success: true, values: { whatsapp_number: "12025550100", whatsapp_primary: true } });
});

it.each(["12345678", "123456789012345"])("accepts the local length boundary %s", (number) => {
  expect(isWhatsAppNumber(number)).toBe(true);
  expect(normalizeWhatsAppInput(`+${number}`)).toBe(number);
});

it.each([undefined, false, "true", 1, null])("requires strict boolean true: %s", (preference) => {
  expect(canWhatsAppBePrimary({ whatsapp_number: "12025550100", whatsapp_primary: preference as boolean })).toBe(false);
});

it("requires a valid number and isolates event preferences", () => {
  expect(canWhatsAppBePrimary({ whatsapp_primary: true })).toBe(false);
  expect(canWhatsAppBePrimary({ whatsapp_number: "invalid", whatsapp_primary: true })).toBe(false);
  expect(canWhatsAppBePrimary({ whatsapp_number: "12025550100", whatsapp_primary: true })).toBe(true);
  expect(canWhatsAppBePrimary({ whatsapp_number: "12025550101" })).toBe(false);
});

it.each(["confirmed", "declined"] as const)("encodes a public %s message", (attendanceStatus) => {
  const encoded = encodeWhatsAppMessage({
    eventTitle: " Evento ficticio ", fullName: " Persona ficticia ",
    attendanceStatus, guestsCount: 2, message: " Cariño & alegría + 🎉\n¡Sí! ",
  });
  expect(decodeURIComponent(encoded)).toBe([
    "Evento: Evento ficticio", "Nombre: Persona ficticia",
    attendanceStatus === "confirmed" ? "Asistiré." : "No podré asistir.",
    attendanceStatus === "confirmed" ? "Cantidad de asistentes: 2" : "",
    "Mensaje: Cariño & alegría + 🎉\n¡Sí!",
  ].filter(Boolean).join("\n"));
  expect(encoded).toContain("%26");
  expect(encoded).toContain("%2B");
});

it.each([undefined, "", "  "])("omits optional blank message %s", (message) => {
  expect(decodeURIComponent(encodeWhatsAppMessage({
    eventTitle: "Evento ficticio", fullName: "Persona ficticia",
    attendanceStatus: "declined", guestsCount: 0, message,
  }))).toBe("Evento: Evento ficticio\nNombre: Persona ficticia\nNo podré asistir.");
});
it.each(["2025550100", "0012025550100", "+1 2025550100 ext 2", "+1 2025550100x2", "+1 abc", "+123", "+1234567890123456", "+0123456789"])("rejects ambiguous or invalid input %s", (value) => {
  expect(normalizeWhatsAppInput(value)).toBeNull();
  const form = new FormData(); form.set("whatsapp_number", value);
  expect(validateEventWhatsApp(form).success).toBe(false);
});
it("keeps empty configuration safe and forbids primary without a number", () => {
  const form = new FormData();
  expect(validateEventWhatsApp(form)).toEqual({ success: true, values: { whatsapp_number: null, whatsapp_primary: false } });
  form.set("whatsapp_primary", "on");
  expect(validateEventWhatsApp(form).success).toBe(false);
});
````

## src/components/wedding-demo/WeddingRSVP.tsx

````tsx
"use client";

import { supabase } from "@/lib/supabase";
import { canWhatsAppBePrimary, encodeWhatsAppMessage, isWhatsAppNumber } from "@/lib/event-whatsapp";
import { useId, useRef, useState, type FormEvent, type MouseEvent } from "react";

type WeddingRSVPProps = {
  eventSlug: string;
  eventTitle?: string;
  whatsappNumber?: string | null;
  whatsappPrimary?: boolean;
  initialFullName?: string;
  maxGuests?: number;
  guestToken?: string;
  theme?: "wedding" | "baby";
};

export default function WeddingRSVP({
  eventSlug,
  eventTitle,
  whatsappNumber,
  whatsappPrimary = false,
  initialFullName,
  maxGuests,
  guestToken,
  theme = "wedding",
}: WeddingRSVPProps) {
  const formId = useId();
  const isBabyShower = theme === "baby";
  const isPersonalizedInvitation = Boolean(guestToken && initialFullName);
  const guestLimit =
    typeof maxGuests === "number" &&
    Number.isInteger(maxGuests) &&
    maxGuests >= 1
      ? maxGuests
      : undefined;

  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [guestCountValue, setGuestsCount] = useState<number | string>(1);
  const guestsCount = Number(guestCountValue);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [success, setSuccess] = useState<{ status: string; count: number } | null>(null);
  const [validationError, setValidationError] = useState("");
  const [whatsappNotice, setWhatsappNotice] = useState("");
  const lastWhatsAppAttempt = useRef<number | null>(null);
  const hasWhatsApp = isWhatsAppNumber(whatsappNumber) && Boolean(eventTitle?.trim());
  const primaryWhatsApp = hasWhatsApp && canWhatsAppBePrimary({
    whatsapp_number: whatsappNumber, whatsapp_primary: whatsappPrimary,
  });

  function openWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    if (!hasWhatsApp || submittingRef.current) return;
    const now = Date.now();
    if (lastWhatsAppAttempt.current !== null && now - lastWhatsAppAttempt.current < 1000) return;
    const form = event.currentTarget.form;
    if (!form) return;
    // A declined WhatsApp response does not require an attendee count. Restore
    // the native field immediately so the separate RSVP flow stays unchanged.
    const countField = form.elements.namedItem(`${formId}-count`) as HTMLInputElement | null;
    const wasDisabled = countField?.disabled ?? false;
    let valid: boolean;
    try {
      if (countField && attendanceStatus === "declined") countField.disabled = true;
      valid = form.reportValidity();
    } finally {
      if (countField) countField.disabled = wasDisabled;
    }
    if (!valid) return;
    if (!fullName.trim() || (attendanceStatus !== "confirmed" && attendanceStatus !== "declined")) {
      setValidationError("Escribe tu nombre y selecciona si asistirás.");
      return;
    }
    if (attendanceStatus === "confirmed" && (!Number.isInteger(guestsCount) || guestsCount < 1 || (guestLimit !== undefined && guestsCount > guestLimit))) {
      setValidationError("Indica una cantidad entera válida dentro de tus pases disponibles.");
      return;
    }
    const text = encodeWhatsAppMessage({
      eventTitle: eventTitle!, fullName, attendanceStatus, guestsCount, message,
    });
    lastWhatsAppAttempt.current = now;
    setValidationError("");
    try {
      const opened = window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank", "noopener,noreferrer");
      setWhatsappNotice(opened
        ? "Abrir WhatsApp no registra tu confirmación en INVITEA. Tú decides si envías el mensaje."
        : "Si WhatsApp no se abrió, tu navegador puede haber bloqueado la pestaña. Puedes usar Enviar confirmación para registrar tu RSVP aquí.");
    } catch {
      setWhatsappNotice("No se pudo abrir WhatsApp. Puedes usar Enviar confirmación para registrar tu RSVP aquí.");
    }
  }

  const whatsappAction = hasWhatsApp ? (
    <div className="my-4">
      <button type="button" onClick={openWhatsApp} disabled={loading}
        aria-describedby={`${formId}-whatsapp-help`}
        className={`w-full rounded-full px-6 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${primaryWhatsApp ? "bg-green-800 text-white" : "border border-green-800 text-green-900"}`}>
        Confirmar por WhatsApp
      </button>
      <p id={`${formId}-whatsapp-help`} className="mt-2 text-sm text-neutral-600">Se abre una pestaña nueva. Las respuestas solo por WhatsApp se gestionan fuera del panel y no forman parte de sus métricas.</p>
    </div>
  ) : null;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submittingRef.current) return;

    setSuccess(null);
    setValidationError("");

    if (!fullName.trim() || !["confirmed", "declined"].includes(attendanceStatus)) {
      setValidationError("Escribe tu nombre y selecciona si asistirás.");
      return;
    }

    if (
      !Number.isInteger(guestsCount) ||
      guestsCount < 1 ||
      (guestLimit !== undefined && guestsCount > guestLimit)
    ) {
      setValidationError(
        guestLimit
          ? `Puedes confirmar un máximo de ${guestLimit} asistentes.`
          : "Indica un número válido de asistentes."
      );
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const { error } = await supabase.rpc("submit_public_rsvp", {
        p_event_slug: eventSlug,
        p_full_name: fullName.trim(),
        p_attendance_status: attendanceStatus,
        p_guests_count: guestsCount,
        p_message: message.trim() || null,
        p_guest_token: guestToken ?? null,
      });

      if (error) {
        console.error("RSVP submission failed", { code: error.code });
        const knownMessage = error.message.includes("guest_limit_exceeded")
          ? `Tu invitación permite un máximo de ${guestLimit ?? 1} asistentes.`
          : error.message.includes("invalid_guest_token")
            ? "Este enlace personalizado ya no es válido."
            : error.message.includes("invalid_attendance_status")
              ? "Selecciona una opción de asistencia válida."
              : error.message.includes("invalid_guests_count")
                ? "Indica un número válido de asistentes."
                : "Ocurrió un error al enviar la confirmación. Intenta nuevamente.";

        setValidationError(knownMessage);
        return;
      }

      setSuccess({ status: attendanceStatus, count: guestsCount });

      setFullName(initialFullName ?? "");
      setAttendanceStatus("");
      setGuestsCount(1);
      setMessage("");
    } catch {
      setValidationError("No pudimos enviar tu respuesta. Revisa tu conexión e intenta nuevamente.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <section
      id="asistencia"
      className={`${isBabyShower ? "bg-[#fffdfb]" : "bg-white"} px-6 py-24`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            {isBabyShower ? "Celebremos juntos" : "RSVP"}
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            {isBabyShower ? "¿Nos acompañas?" : "Confirma tu asistencia"}
          </h2>

          <p className="text-lg text-neutral-600">
            {isBabyShower
              ? "Tu confirmación nos ayudará a preparar una bienvenida llena de cariño."
              : "Ayúdanos a preparar todo para recibirte como mereces."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-[2rem] p-8 shadow-sm ${
            isBabyShower ? "bg-[#f5eef4]" : "bg-[#f8f1ea]"
          }`}
        >
          <div className="mb-6">
            <label htmlFor={`${formId}-name`} className="mb-2 block text-sm font-medium">
              Nombre completo
            </label>

            <input
              id={`${formId}-name`}
              autoComplete="name"
              maxLength={120}
              type="text"
              required
              value={fullName}
              readOnly={isPersonalizedInvitation}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Ej. Ana Martínez"
              className={`w-full rounded-2xl border border-neutral-200 px-5 py-4 outline-none transition focus:border-black ${
                isPersonalizedInvitation
                  ? "cursor-not-allowed bg-neutral-100 text-neutral-600"
                  : "bg-white"
              }`}
            />

            {isPersonalizedInvitation && (
              <p className="mt-2 text-sm text-neutral-500">
                El nombre está vinculado a este enlace personal.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor={`${formId}-attendance`} className="mb-2 block text-sm font-medium">
              ¿Asistirás?
            </label>

            <select
              id={`${formId}-attendance`}
              required
              value={attendanceStatus}
              onChange={(event) =>
                setAttendanceStatus(event.target.value)
              }
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            >
              <option value="">
                Selecciona una opción
              </option>

              <option value="confirmed">
                Sí, asistiré
              </option>

              <option value="declined">
                No podré asistir
              </option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor={`${formId}-count`} className="mb-2 block text-sm font-medium">
              Número de asistentes
            </label>

            {guestLimit !== undefined && (
              <p className="mb-3 text-sm text-neutral-600">
                Tu invitación permite hasta {guestLimit}{" "}
                {guestLimit === 1 ? "asistente" : "asistentes"}.
              </p>
            )}

            <input
              id={`${formId}-count`}
              type="number"
              min="1"
              max={guestLimit}
              required
              value={guestCountValue}
              onChange={(event) => {
                if (hasWhatsApp) {
                  setGuestsCount(event.target.value);
                  return;
                }
                const nextValue = Number(event.target.value);
                setGuestsCount(
                  guestLimit === undefined
                    ? nextValue
                    : Math.min(nextValue, guestLimit)
                );
              }}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          <div className="mb-8">
            <label htmlFor={`${formId}-message`} className="mb-2 block text-sm font-medium">
              {isBabyShower
                ? "Mensaje para el bebé y su familia"
                : "Mensaje para los novios"}
            </label>

            <textarea
              id={`${formId}-message`}
              maxLength={2000}
              rows={5}
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder={
                isBabyShower
                  ? "Escribe un deseo lleno de cariño..."
                  : "Escribe un mensaje especial..."
              }
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          {primaryWhatsApp && whatsappAction}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-full px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
              primaryWhatsApp ? "bg-neutral-600" : isBabyShower ? "bg-[#746072]" : "bg-black"
            }`}
          >
            {loading
              ? "Enviando..."
              : "Enviar confirmación"}
          </button>

          {!primaryWhatsApp && whatsappAction}
          {whatsappNotice && <p role="status" className="mt-4 text-sm text-neutral-700">{whatsappNotice}</p>}

          {validationError && (
            <div
              role="alert"
              className="mt-6 rounded-2xl bg-red-100 px-5 py-4 text-center text-red-800"
            >
              {validationError}
            </div>
          )}

          {success && (
            <div role="status" aria-live="polite" className="mt-6 rounded-2xl bg-green-100 px-5 py-4 text-center text-green-800">
              <p className="font-semibold">
                {success.status === "confirmed" ? "¡Tu asistencia está confirmada!" : "Gracias por avisarnos"}
              </p>

              <p className="mt-1 text-sm">
                {success.status === "confirmed"
                  ? `Te esperamos. Confirmaste ${success.count} ${success.count === 1 ? "asistente" : "asistentes"}, incluyéndote.`
                  : "Registramos que no podrás asistir. Gracias por compartir tu respuesta."}
              </p>
            </div>
          )}
        </form>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </div>
    </section>
  );
}
````

## docs/whatsapp-schema-blocker.md

````markdown
# WhatsApp por evento: bloqueo de esquema

## Evidencia y alcance

Auditoría local del 13 de septiembre de 2026. El usuario informa como resultado
de la auditoría anterior: «El proyecto Supabase respondió, pero la consulta de
metadatos devolvió HTTP 401. No se pudo verificar el esquema remoto».
Esta es evidencia comunicada por el usuario, no una respuesta HTTP obtenida en
esta sesión. No hay aquí una captura sanitizada independiente de esa respuesta.
No se repitió la solicitud ni se infiere de ese estado HTTP ninguna definición
de tabla o permiso efectivo.

Se leyeron AGENTS.md, README.md, docs/whatsapp-real-local.md y las guías locales
de Next.js de componentes Server/Client y Vitest en node_modules/next/dist/docs.
No se encontró estructura local de migraciones, archivos SQL ni configuración
versionada de Supabase. Los clientes TypeScript no constituyen un esquema.

Evidencia parcial del código:

- README y src/lib/public-invitation-data.ts esperan una relación events.
  Su selección pública enumera campos actuales esperados, sin campos WhatsApp.
- src/types/event.ts declara un contrato de aplicación, no tipos generados del
  catálogo remoto. Sus campos WhatsApp opcionales solo preparan el código local.
- src/app/dashboard/nueva/actions.ts inserta directamente en events;
  src/app/dashboard/[slug]/editar/actions.ts actualiza directamente esa relación.
  Ambas usan validateInvitationForm; no se conectó validateEventWhatsApp.
- Se referencian get_public_guest_invitation y submit_public_rsvp, pero no están
  disponibles sus definiciones SQL, permisos, dependencias ni configuración.
- El código espera también event_guests y rsvps. No verifica su estructura real.
- No hay definiciones locales suficientes de vistas, triggers, RLS o GRANT.

## Propuesta no ejecutable

Sobre la relación real de eventos, una vez identificada: whatsapp_number como
texto opcional/nullable, sin número predeterminado; whatsapp_primary como
booleano con valor seguro false. No es DDL ni una migración aprobada.

Se conserva el contrato local existente: entrada internacional explícita con +,
código de país, espacios y guiones; salida solo dígitos, de 8 a 15, primer dígito
distinto de cero. Rechaza letras, extensiones, prefijos 00 y formatos ambiguos.
No comprueba titularidad ni existencia de una cuenta WhatsApp. La prioridad
requiere número válido y booleano estrictamente true. Un evento sin configuración
no hereda destinatario ni prioridad de otro.

El número de la demo permanece exclusivamente en DemoRSVP y sus pruebas; los
consumidores de ese componente son las rutas demo. No es valor predeterminado
del contrato de eventos ni se añadió a eventos reales.

## Metadatos exactos necesarios antes de preparar SQL

Proporcionar solo definiciones de esquema sanitizadas, nunca filas de usuarios,
invitados, mensajes, teléfonos reales, tokens o claves:

1. Esquema y nombre cualificado de la relación real de eventos, tipo de relación
   (tabla/vista), propietario y versión de PostgreSQL.
2. Lista completa de columnas: nombre, tipo cualificado, nulabilidad, default,
   identity/generated; PK, UNIQUE, CHECK, FK con acciones e índices actuales.
3. Estructura y herramienta de migraciones; convención de nombres, historial de
   versiones aplicadas y baseline correspondiente al entorno objetivo.
4. Firmas y definiciones completas de funciones/RPC de creación y edición, si
   existen; confirmar si las escrituras directas locales son el flujo vigente.
5. Definiciones de get_public_guest_invitation y submit_public_rsvp: argumentos,
   retornos, lenguaje, SECURITY DEFINER/INVOKER, search_path y propietario.
6. Definiciones de vistas, vistas materializadas, funciones, triggers y consultas
   públicas que dependan de eventos, incluidas dependencias de tipos compuestos
   o SELECT *, y esquemas expuestos por la API.
7. Estado ENABLE/FORCE RLS y todas las políticas aplicables: nombre, roles,
   comando, modo permisivo/restrictivo, USING y WITH CHECK.
8. GRANT/REVOKE efectivos y privilegios por defecto para esquemas, tablas,
   columnas, secuencias y funciones; roles anon, authenticated y roles de
   servidor implicados, sin credenciales.
9. Relaciones y dependencias con propietarios, invitados, RSVP, métricas,
   historial y check-in que una modificación del contrato pudiera afectar.

## Orden seguro futuro y reversión

1. Revisar los metadatos y resolver discrepancias entre código e inventario real.
2. Diseñar y revisar migración aditiva, restricciones, permisos públicos mínimos
   y compatibilidad de funciones/vistas. No usar un destinatario de demostración
   ni rellenar números en eventos existentes.
3. Preparar respaldo y reversión conforme a la herramienta real; ensayar en un
   entorno aislado con datos ficticios y verificar propietario/evento/rol.
4. Solo con autorización futura, aplicar primero la ampliación compatible del
   esquema; después las selecciones explícitas y las acciones validadas; por
   último habilitar los controles del dashboard y la preferencia.
5. Verificar defaults, eventos anteriores, aislamiento, permisos y que WhatsApp
   no inserte RSVP ni altere métricas antes de habilitarlo a usuarios.

Ante un fallo, revertir primero la aplicación a lecturas/escrituras anteriores
y deshabilitar la opción. Mantener inicialmente las columnas aditivas para no
perder configuración; restaurar definiciones/permisos previos si se cambiaron.
Eliminar columnas solo tras revisar dependencias, preservar datos y obtener
autorización explícita. No se entrega SQL de reversión sin esquema verificado.

## Preparación local y límites de prueba

Se reutilizan isWhatsAppNumber, normalizeWhatsAppInput y validateEventWhatsApp.
Se extraen canWhatsAppBePrimary y encodeWhatsAppMessage al mismo módulo puro.
WeddingRSVP usa estas funciones; conserva su validación y el flujo RSVP existente.
PublicInvitation, las consultas, inserciones, actualizaciones y RPC no cambian.
Abrir WhatsApp tiene un botón sin href, validación previa, protección de un
segundo entre intentos y avisos de apertura. Los campos inválidos se conservan.
Un retorno null de window.open con noopener no demuestra que la pestaña falló;
el aviso es condicional y RSVP continúa disponible.

Las pruebas unitarias y de manejadores de componentes usan hooks, respuestas
Supabase y window.open simulados. No son integración remota, montaje DOM real,
validación nativa del navegador ni prueba de entrega de WhatsApp. La llamada a
submit_public_rsvp permanece únicamente en el envío RSVP separado.

En esta sesión no se consultaron filas personales, no se ejecutaron RPC remotas
ni escrituras en Supabase. No se instalaron dependencias, cambiaron variables de
entorno ni realizaron commits, push, despliegues o validación en navegador.

Siguiente bloque pequeño: revisar exclusivamente los metadatos sanitizados de
los puntos 1 a 9 y acordar el contrato de migración; continuar bloqueando SQL y
persistencia hasta que esa evidencia sea suficiente.

## Estado inicial de Git

Rama: codex/liam-visual-effects; commit: c3839f582396d5797588b6545fd4fc9e095e1422.
18 modificados y 16 nuevos, todos preexistentes.

```text
 M docs/arquitectura.md
 M docs/changelog.md
 M src/app/dashboard/[slug]/checkin/actions.ts
 M src/app/dashboard/[slug]/checkin/page.tsx
 M src/app/dashboard/[slug]/invitados/actions.ts
 M src/app/dashboard/[slug]/invitados/page.tsx
 M src/app/dashboard/[slug]/page.tsx
 M src/app/invitacion/[slug]/page.tsx
 M src/app/liam-alejandro/page.tsx
 M src/components/Navbar.tsx
 M src/components/baby-shower/BabyShowerInvitation.tsx
 M src/components/baby-shower/BabyVoiceMessage.tsx
 M src/components/dashboard/CheckInPanel.tsx
 M src/components/dashboard/EventMetrics.tsx
 M src/components/dashboard/ManualGuestSearch.tsx
 M src/components/wedding-demo/DemoRSVP.tsx
 M src/components/wedding-demo/WeddingRSVP.tsx
 M src/types/event.ts
?? docs/whatsapp-real-local.md
?? public/invitea-logo.svg
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


## Verificación final

- npm test: 15 archivos y 176 pruebas aprobadas; código de salida 0.
- npm run lint: aprobado sin errores ni advertencias; código de salida 0.
- node node_modules/typescript/bin/tsc --noEmit: aprobado; código de salida 0.
- npm run build: aprobado con Next.js 16.3.3; código de salida 0. Compilación
  en 7,9 minutos, TypeScript interno en 2,3 minutos y 20 páginas generadas.
  Las rutas de invitaciones reales quedaron dinámicas. La duración prolongada
  no se presenta como un fallo ni se atribuye a una causa no demostrada.
- git diff --check: sin errores de whitespace. Git emitió avisos de conversión
  LF/CRLF sobre archivos locales preexistentes; no se normalizaron esos archivos.
- Comparación SHA-256 con el estado inicial: de los 34 archivos preexistentes
  modificados/nuevos, solo variaron src/lib/event-whatsapp.ts,
  src/lib/event-whatsapp.test.ts y src/components/wedding-demo/WeddingRSVP.tsx.
- Nuevos documentos: docs/whatsapp-schema-blocker.md y
  docs/whatsapp-local-delivery.md. Este último contiene los bloques completos
  de los archivos cambiados en esta sesión, con rutas para copiar en VS Code.

Las pruebas conservadas cubren número válido, normalización, formatos y extensiones
inválidos, ausencia de número, prioridad sin número, acción principal/alternativa,
respuestas afirmativa y negativa, cantidad condicional, mensaje opcional,
codificación, pases personalizados, doble pulsación, fallos de apertura,
ausencia de llamadas RPC/fetch en la acción WhatsApp e aislamiento entre eventos.
Las nuevas pruebas cubren límites de longitud, prioridad estrictamente booleana
y el formateador puro extraído. No hubo validación en navegador ni integración real.
````
