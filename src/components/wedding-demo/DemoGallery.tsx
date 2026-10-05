const memories = [
  { title: "Un día para recordar", tone: "from-[#ddc6ae] via-[#f7eee2] to-[#ac806f]" },
  { title: "Nuestra celebración", tone: "from-[#bec8b8] via-[#edf0e8] to-[#899783]" },
  { title: "Momentos juntos", tone: "from-[#c4b4c1] via-[#f1e8ef] to-[#927d91]" },
];

export default function DemoGallery() {
  return (
    <section className="bg-[#f8f1ea] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">Recuerdos</p>
          <h2 className="text-4xl md:text-6xl">Nuestra historia</h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600">Así se organiza una galería dentro de la invitación. Estas tarjetas son solo una muestra visual, no son fotos del evento.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {memories.map((memory) => (
            <article key={memory.title} className={`flex h-80 items-end overflow-hidden rounded-[2rem] bg-gradient-to-br ${memory.tone} p-7 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-lg`}>
              <h3 className="rounded-full bg-white/80 px-5 py-3 text-lg text-neutral-800 backdrop-blur">{memory.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
