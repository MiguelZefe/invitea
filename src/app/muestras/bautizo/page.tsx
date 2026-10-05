import SimpleDemo from "../SimpleDemo";

export const metadata = {
  title: { absolute: "Muestra de bautizo · ZefeInvita" },
  description: "Ejemplo ficticio de invitación digital sencilla para bautizo.",
};

export default function BaptismSample() {
  return <SimpleDemo
    type="Bautizo"
    name="Mateo"
    intro="Te invitamos a mi bautizo"
    message="Acompáñanos en un día lleno de cariño para nuestra familia."
    date="2026-12-19"
    time="12:00"
    place="Salón de ejemplo · Ciudad imaginaria"
    colors={{ background: "bg-[#edf3ee]", ink: "text-[#20362e]", panel: "bg-[#fbfdf9]", accent: "text-[#456d5b]", cta: "bg-[#496d61]" }}
  />;
}
