"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type GuestInvitationToolsProps = {
  slug: string;
  token: string;
  guestName: string;
};

function createSafeFileName(value: string) {
  const safeName = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return safeName || "invitado";
}

function subscribeToOrigin() {
  return () => undefined;
}

function getBrowserOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return "";
}

export default function GuestInvitationTools({
  slug,
  token,
  guestName,
}: GuestInvitationToolsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getBrowserOrigin,
    getServerOrigin
  );
  const invitationPath = `/invitacion/${encodeURIComponent(slug)}?guest=${encodeURIComponent(token)}`;
  const invitationUrl = origin ? `${origin}${invitationPath}` : "";
  const [qrError, setQrError] = useState("");
  const [qrReady, setQrReady] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !invitationUrl) {
      return;
    }

    let active = true;

    QRCode.toCanvas(canvas, invitationUrl, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#171717",
        light: "#ffffff",
      },
    })
      .then(() => {
        if (active) {
          setQrReady(true);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("No se pudo generar el código QR:", error);
          setQrError("No se pudo generar el código QR.");
        }
      });

    return () => {
      active = false;
    };
  }, [invitationUrl]);

  async function copyInvitationUrl() {
    if (!invitationUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopyMessage("Enlace copiado");
    } catch (error) {
      console.error("No se pudo copiar el enlace:", error);
      setCopyMessage("No se pudo copiar el enlace");
    }
  }

  function downloadQr() {
    const canvas = canvasRef.current;

    if (!canvas || !invitationUrl || !qrReady || qrError) {
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = `qr-${createSafeFileName(guestName)}.png`;
    downloadLink.click();
  }

  return (
    <div className="mt-5 grid gap-5 border-t border-neutral-100 pt-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
      <div className="flex min-h-56 w-56 items-center justify-center rounded-3xl bg-white p-2 shadow-sm ring-1 ring-neutral-100">
        <canvas
          ref={canvasRef}
          aria-label={`Código QR de invitación para ${guestName}`}
          className="h-[220px] w-[220px] max-w-full"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Enlace individual
        </p>

        {invitationUrl ? (
          <a
            href={invitationUrl}
            className="mt-2 block break-all text-sm underline decoration-neutral-300 underline-offset-4 transition hover:decoration-black"
          >
            {invitationUrl}
          </a>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">Generando enlace...</p>
        )}

        {qrError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {qrError}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={copyInvitationUrl}
            disabled={!invitationUrl}
            className="rounded-full border border-black px-5 py-3 text-sm transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copiar enlace
          </button>

          <button
            type="button"
            onClick={downloadQr}
            disabled={!qrReady || Boolean(qrError)}
            className="rounded-full bg-black px-5 py-3 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Descargar QR
          </button>
        </div>

        {copyMessage && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${
              copyMessage === "Enlace copiado"
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {copyMessage}
          </p>
        )}
      </div>
    </div>
  );
}
