import Link from "next/link";
import { ASSISTED_OFFER, ASSISTED_WHATSAPP_NUMBER, assistedOrderLink, assistedVoiceQuoteLink } from "@/lib/assisted-sales";
import SalesCountdown from "@/components/SalesCountdown";
import QuickOrderForm from "@/components/QuickOrderForm";

export const metadata = {
  title: { absolute: "ZefeInvita · Invitaciones sencillas por $99 MXN" },
  description: "Invitaciones digitales sencillas para cumpleaños y bautizos. Mira muestras ficticias y consulta por WhatsApp.",
};
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76483d]";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f5f2] pb-20 text-black md:pb-0">
      <a href="#pedido" className={`sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 ${focus}`}>Ir al pedido</a>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-7">
        <span className="text-xl font-semibold tracking-tight">ZefeInvita<span className="text-[#98685a]">.</span></span>
        <a href="#muestras" className={`text-sm underline underline-offset-4 ${focus}`}>Ver muestras</a>
      </header>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Tu celebración empieza aquí</p>
          <h1 className="text-5xl leading-[1.08] tracking-tight sm:text-6xl">Una invitación bonita para <span className="text-neutral-500">tu gran día.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-600">Invitaciones digitales sencillas para cumpleaños y bautizos. Personalizamos una base con nombre, fecha y lugar, y revisamos los detalles contigo.</p>
          <div id="pedido" className="mt-8 scroll-mt-6">
            <p className="text-4xl font-semibold">${ASSISTED_OFFER.amountCents / 100} <span className="text-lg font-normal">{ASSISTED_OFFER.currency} por invitación</span></p>
            <p className="mt-2 text-sm text-neutral-600">Pago único por transferencia · Atención personal</p>
            <a href={assistedOrderLink()} target="_blank" rel="noopener noreferrer" className={`mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 py-4 text-center font-medium text-white transition hover:opacity-90 ${focus}`}>Pedir por WhatsApp<span className="sr-only"> (abre otra pestaña)</span></a>
            <p className="mt-3 text-sm text-neutral-600">WhatsApp directo: <a href={`https://wa.me/${ASSISTED_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className={`font-medium underline underline-offset-4 ${focus}`}>+52 55 2561 3131<span className="sr-only"> (abre otra pestaña)</span></a></p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">Antes de transferir, confirmamos qué incluye, disponibilidad y fecha de entrega. El pedido y el pago se coordinan personalmente.</p>
            <SalesCountdown />
            <QuickOrderForm />
          </div>
        </div>
        <div className="rounded-[2rem] border border-neutral-200 bg-[#f3ede7] p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-10">
          <div className="rounded-t-[8rem] rounded-b-2xl border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm motion-safe:animate-[pulse_6s_ease-in-out_infinite]">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Muestra con datos ficticios</p>
            <p className="mt-10 text-sm">¡Es mi cumpleaños!</p><h2 className="my-5 text-5xl text-[#a44f39]">Sofía</h2>
            <p className="text-lg">Celebremos mis 5 años</p>
            <div className="mx-auto my-6 h-px w-16 bg-[#d6c8b7]" />
            <p>12 de diciembre de 2026</p><p className="mt-3 text-sm text-neutral-500">Jardín de ejemplo · Ciudad imaginaria</p>
            <Link href="/muestras/cumpleanos" className="mt-9 inline-block underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Abrir esta muestra</Link>
          </div>
        </div>
      </section>
      <section id="muestras" className="mx-auto max-w-6xl scroll-mt-6 px-6 py-12" aria-labelledby="muestras-titulo">
        <h2 id="muestras-titulo" className="text-3xl">Mira cómo podría verse</h2>
        <p className="mt-3 text-[#62584f]">Son ejemplos ficticios para elegir una base. Tu invitación se prepara después de acordar el pedido.</p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <article className="rounded-3xl border border-[#e3d8cc] bg-[#fff0e2] p-7 sm:p-9">
            <p className="text-sm uppercase tracking-[0.17em]">Cumpleaños</p>
            <h3 className="mt-8 text-4xl text-[#a44f39]">Sofía</h3>
            <p className="mt-3">Celebremos sus 5 años</p>
            <Link href="/muestras/cumpleanos" className="mt-9 inline-flex min-h-11 items-center rounded-full border border-current px-5 py-2 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4">Ver muestra de cumpleaños</Link>
          </article>
          <article className="rounded-3xl border border-[#e3d8cc] bg-[#eaf2ee] p-7 sm:p-9">
            <p className="text-sm uppercase tracking-[0.17em]">Bautizo</p>
            <h3 className="mt-8 text-4xl text-[#456d5b]">Mateo</h3>
            <p className="mt-3">Un día para compartir</p>
            <Link href="/muestras/bautizo" className="mt-9 inline-flex min-h-11 items-center rounded-full border border-current px-5 py-2 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4">Ver muestra de bautizo</Link>
          </article>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="incluye">
        <h2 id="incluye" className="text-3xl">Una oferta sencilla y clara</h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-3">
          {[
            ["Celebración", "Cumpleaños o bautizo sobre una de las bases mostradas."],
            ["Datos esenciales", "Nombre, fecha y lugar, revisados contigo antes de la entrega."],
            ["Atención personal", "Acordamos el pedido, el pago y la entrega por WhatsApp."],
          ].map(([title, detail]) => <article key={title} className="rounded-2xl border border-[#e3d8cc] bg-white p-6"><h3 className="text-xl">{title}</h3><p className="mt-3 leading-relaxed text-[#62584f]">{detail}</p></article>)}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-[#62584f]">Fotos, confirmación de asistencia, check-in y diseños especiales no forman parte de esta oferta. Las bodas se atenderán en una etapa posterior.</p>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="voz-personalizada">
        <div className="rounded-3xl border border-[#d6c8b7] bg-[#fff0e2] px-6 py-8 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98685a]">Extra por cotizar</p>
          <h2 id="voz-personalizada" className="mt-3 text-3xl">Una voz hecha para tu celebración</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#62584f]">Podemos preparar una narración original para poner de fondo en tu invitación: por ejemplo, una voz tierna, tipo bebé, para un baby shower o un narrador con ambiente de aventura, cuento o del tipo de personaje que te guste.</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#62584f]">Definimos contigo el texto, el tono y la duración. Se cotiza aparte y no está incluido en la invitación de $99 MXN; sería una voz original, no una copia exacta de un personaje o intérprete existente.</p>
          <a href={assistedVoiceQuoteLink()} target="_blank" rel="noopener noreferrer" className={`mt-6 inline-flex min-h-11 items-center rounded-full border border-[#433b33] px-5 py-2 hover:bg-white/70 ${focus}`}>Consultar una voz personalizada<span className="sr-only"> (abre WhatsApp en otra pestaña)</span></a>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="pasos">
        <h2 id="pasos" className="text-3xl">Así hacemos tu pedido</h2>
        <ol className="mt-7 grid gap-6 sm:grid-cols-3">
          {[
            ["01", "Cuéntanos tu evento", "Elige cumpleaños o bautizo y envíanos los datos que quieres mostrar."],
            ["02", "Confirmamos contigo", "Acordamos la base, la disponibilidad y la entrega. Después te damos los datos para transferir."],
            ["03", "Preparamos y revisas", "Tras verificar el abono, personalizamos la invitación y revisas tus datos antes de la entrega."],
          ].map(([number, title, detail]) => <li key={number} className="border-t border-[#d6c8b7] pt-5"><p className="text-sm text-[#98685a]">{number}</p><h3 className="mt-3 text-xl">{title}</h3><p className="mt-3 leading-relaxed text-[#62584f]">{detail}</p></li>)}
        </ol>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="preguntas">
        <h2 id="preguntas" className="text-3xl">Antes de pedir</h2>
        <div className="mt-7 divide-y divide-[#d6c8b7] border-y border-[#d6c8b7]">
          <details className="py-5">
            <summary className="cursor-pointer text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4">¿Qué recibo por $99 MXN?</summary>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#62584f]">Una invitación sencilla basada en una de las muestras, con el nombre, la fecha y el lugar de tu celebración. Revisamos esos datos contigo antes de entregarla.</p>
          </details>
          <details className="py-5">
            <summary className="cursor-pointer text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4">¿Qué datos debo enviar?</summary>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#62584f]">Elige cumpleaños o bautizo y comparte el nombre, la fecha, la hora y el lugar que quieres mostrar. Puedes hacerlo todo por WhatsApp.</p>
          </details>
          <details className="py-5">
            <summary className="cursor-pointer text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4">¿Cuándo transfiero?</summary>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#62584f]">Primero confirmamos el alcance, la disponibilidad y la fecha de entrega. Solo después te compartimos los datos para transferir.</p>
          </details>
          <details className="py-5">
            <summary className="cursor-pointer text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4">¿Incluye fotos, RSVP o check-in?</summary>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#62584f]">No en esta oferta inicial. Esas funciones y las invitaciones de boda se prepararán en una etapa posterior.</p>
          </details>
          <details className="py-5">
            <summary className="cursor-pointer text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4">¿Puedo agregar una voz personalizada?</summary>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#62584f]">Sí, puedes pedir una narración original para poner de fondo, como voz tierna tipo bebé o con ambiente de aventura. Se cotiza aparte; no incluye copiar exactamente a personajes o intérpretes existentes.</p>
          </details>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="futuro">
        <div className="rounded-3xl border border-[#d6c8b7] bg-[#eaf2ee] px-6 py-8 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#456d5b]">Etapa posterior</p>
          <h2 id="futuro" className="mt-3 text-3xl">Álbum de fotos y videos</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#456d5b]">Ya puedes probar una maqueta local para visualizar la idea. Esta función aún no guarda ni publica archivos y no está incluida en la invitación inicial.</p>
          <Link href="/demo-album" className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[#456d5b] px-5 py-2 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4">Abrir demo de álbum</Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="demo-avanzada">
        <div className="rounded-3xl border border-[#d6c8b7] bg-white px-6 py-8 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98685a]">Recorrido de demostración</p>
          <h2 id="demo-avanzada" className="mt-3 text-3xl">Explora una invitación con más funciones</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#62584f]">La app local también muestra cuenta regresiva, ubicaciones con enlace a mapas, itinerario, código de vestimenta, música y una confirmación de asistencia simulada. Es un ejemplo avanzado para explorar; estas funciones no están incluidas en la oferta inicial de $99 MXN.</p>
          <Link href="/demo" className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[#433b33] px-5 py-2 hover:bg-[#f8f5f2] focus-visible:outline-2 focus-visible:outline-offset-4">Abrir demo avanzada</Link>
          <p className="mt-3 text-sm text-[#62584f]">Los datos son ficticios. La confirmación se simula en esta página y no se guarda.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="celebracion">
        <div className="rounded-3xl bg-[#433b33] px-6 py-10 text-white sm:px-10">
          <h2 id="celebracion" className="text-3xl">¿Qué vamos a celebrar?</h2>
          <p className="mt-3 text-[#eee5dc]">Pregunta por tu invitación sin compromiso de pago.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            {(["Cumpleaños", "Bautizo"] as const).map(type => <a key={type} href={assistedOrderLink(type)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/70 px-6 py-3 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Quiero una invitación de {type.toLowerCase()}<span className="sr-only"> (WhatsApp, abre otra pestaña)</span></a>)}
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-[#62584f] sm:flex-row sm:justify-between"><p>© 2026 ZefeInvita · By MiguelZefe</p><p>Contacto: <a href={`https://wa.me/${ASSISTED_WHATSAPP_NUMBER}`} className={`font-medium underline underline-offset-4 ${focus}`} target="_blank" rel="noopener noreferrer">WhatsApp +52 55 2561 3131<span className="sr-only"> (abre otra pestaña)</span></a></p></footer>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e3d8cc] bg-[#f8f5f2]/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <a href={assistedOrderLink()} target="_blank" rel="noopener noreferrer" className={`flex min-h-12 w-full items-center justify-center rounded-full bg-black px-5 py-3 text-center font-medium text-white transition hover:opacity-90 ${focus}`}>Preguntar por WhatsApp · ${ASSISTED_OFFER.amountCents / 100} MXN<span className="sr-only"> (abre otra pestaña; no envía el mensaje automáticamente)</span></a>
      </div>
    </main>
  );
}
