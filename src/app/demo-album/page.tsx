import Link from "next/link";
import AlbumUploader from "@/components/AlbumUploader";

export const metadata = {
  title: { absolute: "Demo de álbum · ZefeInvita" },
  description: "Prueba local de selección y previsualización de fotos y videos para una etapa posterior.",
};

export default function DemoAlbumPage() {
  return (
    <main className="min-h-screen bg-[#f8f5f2] px-5 py-8 text-black">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="rounded-md text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">← Volver a ZefeInvita</Link>
        <header className="py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Función en preparación</p>
          <h1 className="mt-4 text-5xl leading-tight">Álbum de fotos y videos</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">Una prueba de cómo podría verse una galería para celebraciones futuras. Usa únicamente archivos ficticios o de prueba.</p>
        </header>
        <AlbumUploader />
        <p className="mt-8 text-center text-sm text-neutral-500">Fotos, check-in y bodas siguen fuera de la oferta inicial.</p>
      </div>
    </main>
  );
}
