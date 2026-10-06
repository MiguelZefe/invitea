"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { createDemoAccessPayload } from "@/lib/demo-access";

type Props = {
  eventType: string;
  allowCheckin: boolean;
};

export default function DemoAccessCard({ eventType, allowCheckin }: Props) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const [qrError, setQrError] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const payload = createDemoAccessPayload(eventType);

  useEffect(() => {
    let active = true;
    const canvas = qrCanvasRef.current;
    if (!canvas) return () => { active = false; };

    QRCode.toCanvas(canvas, payload, {
      width: 208,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#172c4d", light: "#ffffff" },
    }).then(() => {
      if (active) setQrReady(true);
    }).catch(() => {
      if (active) setQrError("No se pudo preparar el QR de muestra.");
    });

    return () => { active = false; };
  }, [payload]);

  return (
    <section className="mt-8 rounded-3xl border border-current/10 bg-white/75 p-5 shadow-sm sm:p-8" aria-labelledby="demo-access-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Acceso de muestra</p>
        <h2 id="demo-access-title" className="mt-2 text-2xl sm:text-3xl">Un recuerdo también puede abrir la puerta</h2>
        <p className="mt-3 text-sm leading-relaxed opacity-70">Prueba un pase QR y, para bodas, un check-in de demostración. Todo es ficticio y solo cambia en esta pantalla.</p>
      </div>

      <div className="mx-auto mt-6 grid max-w-3xl gap-6 rounded-3xl border border-current/10 bg-[var(--sample-panel)] p-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-center sm:p-6">
        <figure className="mx-auto w-full max-w-52 rounded-2xl bg-white p-3 text-center shadow-sm">
          <div className="relative aspect-square w-full">
            <canvas ref={qrCanvasRef} role="img" aria-label={`Código QR ficticio de acceso para ${eventType}`} className="h-full w-full" />
            {!qrReady && <span role={qrError ? "alert" : "status"} className="absolute inset-0 grid place-items-center rounded-xl bg-slate-50 px-3 text-sm opacity-70">{qrError || "Preparando QR…"}</span>}
          </div>
          <figcaption className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Invitado demo · 001</figcaption>
        </figure>

        <div className="min-w-0 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-55">Pase ficticio</p>
          <p className="mt-2 break-all font-mono text-sm font-semibold">{payload}</p>
          <p className="mt-3 text-sm leading-relaxed opacity-70">Este QR contiene solo un identificador de ejemplo. No abre una invitación publicada, no consulta invitados y no guarda entradas.</p>

          {allowCheckin && <div className="mt-5 rounded-2xl border border-current/10 bg-white/80 p-4">
            <p className="text-sm font-semibold">Control de acceso para boda</p>
            <button type="button" onClick={() => setCheckedIn(true)} disabled={checkedIn} className="mt-3 min-h-11 rounded-full bg-[var(--sample-cta)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default disabled:opacity-70">
              {checkedIn ? "Entrada demo registrada" : "Simular check-in"}
            </button>
            {checkedIn && <p role="status" aria-live="polite" className="mt-3 text-sm font-semibold">Acceso ficticio marcado como recibido. No se guardó ni se envió.</p>}
            {checkedIn && <button type="button" onClick={() => setCheckedIn(false)} className="mt-2 block min-h-9 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">Reiniciar demostración</button>}
          </div>}
        </div>
      </div>
    </section>
  );
}
