"use client";

import { useEffect, useState, type FormEvent } from "react";
import { OFFER, transitionPayment, type PaymentState } from "@/lib/commercial-lab/contract";
import { loadDraft, saveDraft, validateDraft, SYNTHETIC_DRAFT, type Draft } from "@/lib/commercial-lab/draft";

export default function CommercialLab() {
  const [draft, setDraft] = useState<Draft>(SYNTHETIC_DRAFT);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [review, setReview] = useState<Draft | null>(null);
  const [payment, setPayment] = useState<PaymentState>("created");

  useEffect(() => {
    try {
      const saved = loadDraft(window.localStorage);
      // One-time browser storage hydration; keep server/first client render equal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setDraft(saved);
      setMessage(saved ? "Borrador recuperado de este navegador." : "Ejemplo ficticio listo para crear. Aún no guardado.");
    } catch {
      setMessage("No se pudo recuperar el borrador. Puedes editar el ejemplo; guardar reemplazará el borrador local anterior.");
    }
    setReady(true);
  }, []);

  function change(field: keyof Draft, value: string) {
    setDraft({ ...draft, [field]: value });
    setMessage("Cambios sin guardar.");
    setPreview(false);
    setReview(null);
    setPayment("created");
  }

  function reviewPurchase() {
    try {
      setReview(validateDraft(draft));
      setPayment("created");
      setMessage("Resumen listo. La simulación usa los campos actuales, aunque no estén guardados.");
    } catch {
      setReview(null);
      setMessage("Completa nombres, fecha y ubicación válidos antes de revisar la compra.");
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setDraft(saveDraft(window.localStorage, draft));
      setMessage("Borrador guardado en este navegador. Puedes editarlo y volver a guardar.");
    } catch {
      setMessage("No se pudo guardar. Revisa los campos y permite el almacenamiento del navegador. Tus cambios siguen en pantalla.");
    }
  }

  const inputClass = "mt-2 w-full rounded-lg border border-stone-300 bg-white p-3";
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-12 text-stone-800">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-widest">ZefeInvita · Solo desarrollo local</p>
          <h1 className="text-4xl">Tu primer borrador</h1>
          <p>Oferta única: <strong>${OFFER.amountCents / 100} {OFFER.currency} por evento</strong>.</p>
          <p>Demostración con datos ficticios. Usa solo nombres y ubicaciones inventados.</p>
          <p className="rounded-xl bg-amber-50 p-4 text-sm">Se guarda un borrador únicamente en este navegador y este origen. Quien use este perfil puede verlo; borrar los datos del navegador lo elimina. Esto no es autenticación, autorización ni prueba de pago. No hay cobros, publicación pública ni comprobantes.</p>
        </header>
        <form onSubmit={save} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
          <fieldset disabled={!ready} className="space-y-5">
            <legend className="mb-4 text-lg font-semibold">Evento ficticio · Borrador</legend>
            <label className="block">Celebración
              <select className={inputClass} value={draft.type} onChange={(e) => change("type", e.target.value)}>
                <option value="wedding">Boda</option><option value="baby-shower">Baby shower</option>
              </select>
            </label>
            <label className="block">Nombres ficticios
              <input className={inputClass} required maxLength={120} value={draft.names} onChange={(e) => change("names", e.target.value)} />
            </label>
            <label className="block">Fecha
              <input className={inputClass} type="date" required value={draft.date} onChange={(e) => change("date", e.target.value)} />
            </label>
            <label className="block">Ubicación ficticia
              <input className={inputClass} required maxLength={200} value={draft.location} onChange={(e) => change("location", e.target.value)} />
            </label>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-stone-800 px-5 py-3 text-white" type="submit">Guardar borrador</button>
              <button className="rounded-full border border-stone-400 px-5 py-3" type="button" onClick={() => setPreview(!preview)} aria-expanded={preview} aria-controls="lab-preview">{preview ? "Cerrar previsualización" : "Previsualizar"}</button>
              <button className="rounded-full border border-stone-400 px-5 py-3" type="button" onClick={reviewPurchase} aria-expanded={!!review} aria-controls="lab-purchase">Revisar compra simulada</button>
            </div>
          </fieldset>
          <p role="status" className="text-sm">{ready ? message : "Cargando borrador local…"}</p>
        </form>
        {preview && <section id="lab-preview" aria-label="Previsualización del borrador" className={`rounded-2xl border p-8 text-center ${draft.type === "wedding" ? "border-rose-200 bg-rose-50" : "border-sky-200 bg-sky-50"}`}>
          <p className="text-xs uppercase tracking-widest">Vista previa local · Datos ficticios · Sin publicar</p>
          <p className="mt-8">{draft.type === "wedding" ? "Nuestra boda" : "Celebramos un baby shower"}</p>
          <h2 className="my-5 break-words text-4xl">{draft.names}</h2>
          <p><time dateTime={draft.date}>{draft.date}</time></p>
          <p className="mt-3 break-words">{draft.location}</p>
          <p className="mt-8 text-sm">Muestra los campos actuales, incluidos cambios sin guardar. Sin RSVP ni enlace público.</p>
        </section>}
        {review && <section id="lab-purchase" aria-label="Compra simulada" className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-2xl">Resumen de compra · Simulación</h2>
          <p className="break-words">{review.type === "wedding" ? "Boda" : "Baby shower"}: {review.names}</p>
          <p className="break-words">{review.date} · {review.location}</p>
          <p>1 evento · Total: <strong>$99 MXN</strong> · Pago único simulado.</p>
          <p className="text-sm">No introduzcas tarjetas ni datos bancarios. No se realizará ningún cobro. Al editar el evento o recargar, la simulación se reinicia; el borrador guardado se conserva.</p>
          <p role="status">{({created: "Revisa el resumen para iniciar la simulación.", pending: "Pago simulado pendiente. Elige un resultado de prueba.", succeeded: "Pago simulado aprobado. El evento sigue siendo un borrador local, sin publicar.", failed: "Pago simulado rechazado. Puedes volver a intentarlo; tu borrador se conserva.", cancelled: "Pago simulado cancelado. Tu borrador se conserva."})[payment]}</p>
          <div className="flex flex-wrap gap-3">
            {payment === "created" && <button type="button" className="rounded-full bg-stone-800 px-5 py-3 text-white" onClick={() => setPayment(transitionPayment(payment, "pending"))}>Simular pago de $99 MXN</button>}
            {payment === "pending" && <>
              <button type="button" className="rounded-full bg-stone-800 px-5 py-3 text-white" onClick={() => setPayment(transitionPayment(payment, "succeeded"))}>Simular aprobación</button>
              <button type="button" className="rounded-full border px-5 py-3" onClick={() => setPayment(transitionPayment(payment, "failed"))}>Simular rechazo</button>
            </>}
            {(payment === "created" || payment === "pending") && <button type="button" className="rounded-full border px-5 py-3" onClick={() => setPayment(transitionPayment(payment, "cancelled"))}>Cancelar simulación</button>}
            {(payment === "failed" || payment === "cancelled") && <button type="button" className="rounded-full border px-5 py-3" onClick={() => setPayment("created")}>Volver a intentar</button>}
          </div>
        </section>}
        <p className="text-sm text-stone-600">Solo se guarda el borrador. Los resultados de pago son ficticios y temporales; no habilitan publicación ni sirven como comprobantes.</p>
      </div>
    </main>
  );
}
