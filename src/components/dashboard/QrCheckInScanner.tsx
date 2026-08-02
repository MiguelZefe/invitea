"use client";

import type QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

type QrCheckInScannerProps = {
  onTokenDetected: (token: string) => void;
  disabled?: boolean;
};

function getCameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "El navegador bloqueó el acceso a la cámara. Revisa los permisos del sitio.";
    }

    if (error.name === "NotFoundError") {
      return "No se encontró una cámara disponible en este dispositivo.";
    }

    if (error.name === "NotReadableError") {
      return "La cámara está ocupada o no pudo iniciarse. Cierra otras aplicaciones e intenta nuevamente.";
    }
  }

  return "No se pudo iniciar la cámara. Revisa los permisos e intenta nuevamente.";
}

function extractTokenFromQr(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    return url.searchParams.get("guest")?.trim() ?? "";
  } catch {
    return "";
  }
}

export default function QrCheckInScanner({
  onTokenDetected,
  disabled = false,
}: QrCheckInScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const scanLockedRef = useRef(false);
  const mountedRef = useRef(true);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  function stopScanner() {
    scannerRef.current?.stop();
    scanLockedRef.current = false;
    setActive(false);
  }

  async function startScanner() {
    if (!window.isSecureContext) {
      setError(
        "La cámara requiere HTTPS en producción. En desarrollo utiliza localhost."
      );
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    setStarting(true);
    setError("");
    scanLockedRef.current = false;

    try {
      const { default: QrScannerConstructor } = await import("qr-scanner");
      const hasCamera = await QrScannerConstructor.hasCamera();

      if (!mountedRef.current) {
        return;
      }

      if (!hasCamera) {
        setError("No se encontró una cámara disponible en este dispositivo.");
        return;
      }

      if (!scannerRef.current) {
        scannerRef.current = new QrScannerConstructor(
          video,
          (result) => {
            if (scanLockedRef.current) {
              return;
            }

            const token = extractTokenFromQr(result.data);

            if (!token) {
              setError(
                "El QR leído no contiene un parámetro guest válido. Usa el QR individual de INVITEA."
              );
              return;
            }

            scanLockedRef.current = true;
            scannerRef.current?.stop();
            setActive(false);
            setError("");
            onTokenDetected(token);
          },
          {
            preferredCamera: "environment",
            maxScansPerSecond: 8,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          }
        );
      }

      await scannerRef.current.start();
      if (mountedRef.current) {
        setActive(true);
      }
    } catch (cameraError) {
      console.error("No se pudo iniciar el escáner QR:", cameraError);
      scannerRef.current?.stop();

      if (mountedRef.current) {
        setError(getCameraErrorMessage(cameraError));
        setActive(false);
      }
    } finally {
      if (mountedRef.current) {
        setStarting(false);
      }
    }
  }

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  return (
    <section className="mt-6 rounded-3xl bg-[#f8f5f2] p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium">Escanear código QR</p>
          <p className="mt-1 text-sm text-neutral-500">
            Usa la cámara para leer el QR individual del invitado.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={startScanner}
            disabled={disabled || active || starting}
            className="rounded-full bg-black px-5 py-3 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting ? "Iniciando..." : "Iniciar cámara"}
          </button>

          <button
            type="button"
            onClick={stopScanner}
            disabled={!active}
            className="rounded-full border border-black px-5 py-3 text-sm transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Detener cámara
          </button>
        </div>
      </div>

      <div
        className={`mt-5 overflow-hidden rounded-3xl bg-black ${
          active || starting ? "block" : "hidden"
        }`}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="aspect-square w-full object-cover sm:aspect-video"
        />
      </div>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-4 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </section>
  );
}
