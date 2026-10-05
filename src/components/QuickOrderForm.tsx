"use client";

import { useMemo, useState } from "react";
import { ASSISTED_WHATSAPP_NUMBER, buildAssistedOrderMessage } from "@/lib/assisted-sales";

export default function QuickOrderForm() {
  const [type, setType] = useState<"Cumpleaños" | "Bautizo">("Cumpleaños");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [customVoice, setCustomVoice] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const message = buildAssistedOrderMessage({ type, name, date, time, place, customVoice });
  const link = useMemo(() => "https://wa.me/" + ASSISTED_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message), [message]);

  async function copyMessage() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(message);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="pedido-rapido">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Pedido rápido</p>
      <h2 id="pedido-rapido" className="mt-3 text-2xl">Prepara tu mensaje</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">Completa los datos ficticios o reales de tu evento. WhatsApp se abrirá con el mensaje listo para revisar; tú decides si lo envías.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Tipo de evento
          <select value={type} onChange={(event) => setType(event.target.value as "Cumpleaños" | "Bautizo")} className="mt-2 min-h-11 w-full rounded-xl border border-[#cbb9a7] bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]">
            <option>Cumpleaños</option>
            <option>Bautizo</option>
          </select>
        </label>
        <label className="text-sm">Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Sofía" className="mt-2 min-h-11 w-full rounded-xl border border-[#cbb9a7] bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
        </label>
        <label className="text-sm">Fecha
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#cbb9a7] bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
        </label>
        <label className="text-sm">Hora
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#cbb9a7] bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
        </label>
        <label className="text-sm">Lugar
          <input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Ej. Jardín de ejemplo" className="mt-2 min-h-11 w-full rounded-xl border border-[#cbb9a7] bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
        </label>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e3d8cc] bg-[#fffaf5] p-4 text-sm leading-relaxed text-[#433b33]">
        <input type="checkbox" checked={customVoice} onChange={(event) => setCustomVoice(event.target.checked)} className="mt-1 size-4 accent-[#76483d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
        <span>También quiero consultar una narración de voz personalizada. Se cotiza aparte.</span>
      </label>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#433b33] px-6 py-3 text-center font-medium text-white hover:bg-[#625044] focus-visible:outline-2 focus-visible:outline-offset-4">Revisar mensaje en WhatsApp<span className="sr-only"> (abre otra pestaña)</span></a>
        <button type="button" onClick={copyMessage} className="inline-flex min-h-12 items-center justify-center rounded-full border border-black px-6 py-3 text-center font-medium hover:bg-[#f8f5f2] focus-visible:outline-2 focus-visible:outline-offset-4">{copyStatus === "copied" ? "Mensaje copiado" : copyStatus === "error" ? "Copia no disponible" : "Copiar mensaje"}</button>
      </div>
      <p className="mt-3 text-xs text-[#756357]">No se envía nada automáticamente. Confirma alcance y entrega antes de transferir.</p>
    </section>
  );
}
