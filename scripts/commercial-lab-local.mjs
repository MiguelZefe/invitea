// Isolated launcher: only explicitly allowlisted demo routes/assets; never .env files or real clients.
import { cp, mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const production = process.argv.includes("--production");
const portIndex = process.argv.indexOf("--port");
const port = portIndex === -1 ? "3100" : process.argv[portIndex + 1];
if (!port || !/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) {
  throw new Error("Usa --port con un puerto entre 1024 y 65535.");
}
await mkdir(join(root, ".next"), { recursive: true });
const stage = await mkdtemp(join(root, ".next", "commercial-lab-"));
const files = [
  "package.json", "tsconfig.json", "postcss.config.mjs", "src/app/globals.css",
  "src/app/page.tsx", "src/lib/assisted-sales.ts",
  "src/app/og-zefeinvita/route.tsx",
  "src/app/HomePreview.module.css",
  "src/lib/google-maps.ts",
  "src/lib/album-item-id.ts",
  "src/components/SalesCountdown.tsx",
  "src/components/AlbumUploader.tsx",
  "src/app/muestras/SimpleDemo.tsx",
  "src/app/muestras/SampleMusicPlayer.tsx",
  "src/app/muestras/sample-music.ts",
  "src/app/muestras/music-links.ts",
  "src/app/muestras/SampleMotion.module.css",
  "src/app/muestras/cumpleanos/page.tsx",
  "src/app/muestras/bautizo/page.tsx",
  "src/app/muestras/[evento]/page.tsx",
  "src/app/muestras/boda/editorial/page.tsx",
  "src/app/boda/elizabeth-y-alonso/page.tsx",
  "src/components/wedding-story/WeddingStory.tsx",
  "src/components/wedding-story/WeddingStory.module.css",
  "src/lib/wedding-story.ts",
  "src/app/demo-album/page.tsx",
  "src/app/demo/page.tsx",
  "src/components/EventCountdown.tsx",
  "src/components/EventCountdown.module.css",
  "src/app/muestras/DemoAccessCard.tsx",
  "src/lib/demo-access.ts",
  "src/components/wedding-demo/DemoGallery.tsx",
  "src/components/wedding-demo/DemoRSVP.tsx",
  "src/components/wedding-demo/WeddingDressCode.tsx",
  "src/components/wedding-demo/WeddingHero.tsx",
  "src/components/wedding-demo/WeddingItinerary.tsx",
  "src/components/wedding-demo/WeddingLocations.tsx",
  "src/components/wedding-demo/WeddingMusicPlayer.tsx",
  "src/lib/event-date.ts",
  "src/lib/event-whatsapp.ts",
  "src/types/event.ts",
  "public/music/demo-wedding.mp3",
  "public/music/wedding-story-original.wav",
  "public/music/elizabeth-alonso-original.mp3",
  "public/music/sample-brisa.wav",
  "public/music/sample-jardin.wav",
  "public/music/sample-luces.wav",
  "public/images/wedding-elizabeth-alonso/city.jpg",
  "public/images/wedding-elizabeth-alonso/christ.jpg",
  "public/images/wedding-elizabeth-alonso/tlayacapan.jpg",
  "public/images/wedding-elizabeth-alonso/forest.jpg",
  "public/images/sample-templates/granja-alegre.webp",
  "public/images/sample-templates/neon-gamer.webp",
  "public/images/sample-templates/jardin-orquideas.webp",
  "public/images/sample-templates/noche-dorada.webp",
  "public/images/sample-templates/sobre-azul-noche.webp",
  "public/images/sample-templates/graduacion-noche.webp",
  "public/images/sample-templates/fiesta-colorida.webp",
  "public/images/sample-templates/cumpleanos-festival-luz.webp",
  "public/images/sample-templates/cumpleanos-jardin-tropical.webp",
  "public/images/sample-templates/cumpleanos-noche-ciruela.webp",
  "public/images/sample-templates/dulce-minimal.webp",
  "public/images/sample-templates/jardin-romantico.webp",
  "public/images/sample-templates/bautizo-jardin-luz.webp",
  "public/images/sample-templates/bautizo-nube-celestial.webp",
  "public/images/sample-templates/bautizo-recuerdo-enmarcado.webp",
  "public/images/sample-templates/bautizo-pase-botanico.webp",
  "public/images/sample-templates/bautizo-luz-amanecer.webp",
  "public/images/sample-templates/baby-nube-tierna.webp",
  "public/images/sample-templates/baby-jardin-botanico.webp",
  "public/images/sample-templates/baby-dulce-bienvenida.webp",
  "public/images/sample-templates/baby-pequena-estrella.webp",
  "public/images/sample-templates/baby-nube-algodon.webp",
  "public/images/sample-templates/boda-retrato-amor.webp",
  "public/images/sample-templates/boda-aurora-amor.webp",
  "public/images/sample-templates/boda-votos-champana.webp",
  "public/images/sample-templates/xv-noche-glam.webp",
  "public/images/sample-templates/xv-dorado-moderno.webp",
  "public/images/sample-templates/xv-pase-gala.webp",
  "public/images/sample-templates/xv-sueno-coral.webp",
  "public/images/sample-templates/comunion-luz-serena.webp",
  "public/images/sample-templates/comunion-flores-delicadas.webp",
  "public/images/sample-templates/comunion-marco-luz.webp",
  "public/images/sample-templates/comunion-pan-luz.webp",
  "public/images/sample-templates/comunion-cielo-sereno.webp",
  "public/images/sample-templates/graduacion-noche-gala.webp",
  "public/images/sample-templates/graduacion-pase-futuro.webp",
  "public/images/sample-templates/graduacion-gran-logro.webp",
  "public/images/sample-templates/graduacion-horizonte-nuevo.webp",
  "public/images/sample-templates/aniversario-clasico-dorado.webp",
  "public/images/sample-templates/aniversario-jardin-eterno.webp",
  "public/images/sample-templates/aniversario-nuestra-historia.webp",
  "public/images/sample-templates/aniversario-brindis-eterno.webp",
  "public/images/sample-templates/aniversario-jardin-recuerdos.webp",
];
if (!production) {
  files.push(
    "src/app/laboratorio-comercial/page.tsx",
    "src/app/laboratorio-comercial/CommercialLab.tsx",
    "src/lib/commercial-lab/contract.ts",
    "src/lib/commercial-lab/draft.ts",
  );
}
for (const file of files) {
  await mkdir(dirname(join(stage, file)), { recursive: true });
  await cp(join(root, file), join(stage, file));
}
await symlink(join(root, "node_modules"), join(stage, "node_modules"), process.platform === "win32" ? "junction" : "dir");
await writeFile(join(stage, "next.config.mjs"), "export default { outputFileTracingRoot: process.cwd() };\n");
await writeFile(join(stage, "postcss.config.mjs"), `export default {
  plugins: { "@tailwindcss/postcss": { base: ${JSON.stringify(join(stage, "src"))} } },
};
`);
// A local-only shell avoids the main layout's Google Fonts downloads.
await writeFile(join(stage, "src/app/layout.tsx"), `import "./globals.css";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body style={{ fontFamily: "Arial, sans-serif" }}><style>{"h1,h2,h3,h4{font-family: Georgia, 'Times New Roman', serif;}"}</style>{children}</body></html>;
}
`);

const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
// Inherited shell credentials must not enter this demonstration process either.
for (const key of Object.keys(env)) {
  if (/SUPABASE|^NEXT_PUBLIC_|^NODE_ENV$/i.test(key)) delete env[key];
}
const next = join(root, "node_modules/next/dist/bin/next");
function run(args) {
  return new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [next, ...args], { cwd: stage, env, stdio: "inherit", windowsHide: true });
    const stop = () => child.kill();
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    child.once("error", reject);
    child.once("exit", code => {
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
      resolveExit(code ?? 1);
    });
  });
}

console.log(`Demostración aislada: http://127.0.0.1:${port}/laboratorio-comercial`);
console.log(`Portada de venta asistida: http://127.0.0.1:${port}/`);
console.log("Sin archivos de entorno ni servicios reales. Ctrl+C para detener.");
if (production) {
  const result = await run(["build", "--webpack"]);
  if (result !== 0) process.exit(result);
  console.log("Verificación de producción: la ruta debe responder 404.");
}
process.exitCode = await run([production ? "start" : "dev", ...(production ? [] : ["--webpack"]), "--hostname", "127.0.0.1", "--port", port]);
