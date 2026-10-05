"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { createAlbumItemId } from "@/lib/album-item-id";

type MediaItem = { id: string; file: File; url: string };

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

export default function AlbumUploader() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const itemsRef = useRef<MediaItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const next = files.map((file) => ({
      id: createAlbumItemId(file.name, file.lastModified, file.size),
      file,
      url: URL.createObjectURL(file),
    }));
    setItems((current) => [...current, ...next]);
    event.target.value = "";
  }

  function removeItem(id: string) {
    setItems((current) => {
      const item = current.find((candidate) => candidate.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return current.filter((candidate) => candidate.id !== id);
    });
  }

  function clearItems() {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    setItems([]);
  }

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="album-titulo">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Demo local</p>
          <h2 id="album-titulo" className="mt-3 text-3xl">Sube fotos y videos</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-neutral-600">Selecciona varios archivos para ver cómo podría funcionar un álbum. Se mantienen solo en esta pestaña y no se envían a ningún servidor.</p>
        </div>
        {items.length > 0 && <span className="rounded-full bg-[#eaf2ee] px-3 py-1 text-sm text-[#456d5b]">{items.length} {items.length === 1 ? "archivo" : "archivos"}</span>}
      </div>
      <label className="mt-7 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cbb9a7] bg-[#faf7f2] px-5 text-center transition-colors hover:border-[#98685a] hover:bg-[#fff8f1] focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#76483d]">
        <span className="text-lg font-medium">Elegir fotos o videos</span>
        <span className="mt-2 text-sm text-[#62584f]">JPG, PNG, WEBP, MP4, MOV y otros formatos del navegador</span>
        <input className="sr-only" type="file" accept="image/*,video/*" multiple onChange={addFiles} />
      </label>
      {items.length > 0 ? (
        <div className="mt-7">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[#e3d8cc] bg-[#faf7f2]">
                <div className="aspect-video bg-[#302b27]">
                  {isVideo(item.file) ? <video className="h-full w-full object-cover" src={item.url} controls preload="metadata" /> : <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="h-full w-full object-cover" src={item.url} alt={"Vista previa de " + item.file.name} />
                  </>}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="min-w-0 truncate text-sm" title={item.file.name}>{item.file.name}</p>
                  <button type="button" onClick={() => removeItem(item.id)} className="shrink-0 rounded-full border border-[#b98f80] px-3 py-1 text-sm text-[#76483d] hover:bg-[#fff0e2] focus-visible:outline-2 focus-visible:outline-offset-2">Quitar</button>
                </div>
              </article>
            ))}
          </div>
          <button type="button" onClick={clearItems} className="mt-5 rounded-full border border-[#433b33] px-5 py-2 text-sm hover:bg-[#433b33] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4">Limpiar álbum de prueba</button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-[#756357]">Todavía no hay archivos seleccionados.</p>
      )}
      <p className="mt-7 border-t border-[#e3d8cc] pt-5 text-xs leading-relaxed text-[#756357]">Esta función es una demostración de una etapa posterior. No guarda el álbum, no genera enlaces y no forma parte del precio inicial de $99 MXN.</p>
    </section>
  );
}
