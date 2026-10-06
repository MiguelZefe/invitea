import SimpleDemo from "../SimpleDemo";

export const metadata = {
  title: { absolute: "Muestra de cumpleaños · ZefeInvita" },
  description: "Ejemplo ficticio de invitación digital sencilla para cumpleaños.",
};

export default function BirthdaySample() {
  return <SimpleDemo
    type="Cumpleaños"
    name="Sofía"
    intro="¡Es mi cumpleaños!"
    message="Ven a celebrar mis 5 años. Habrá juegos, alegría y muchas sonrisas."
    date="2026-12-12"
    time="16:00"
    place="Jardín de ejemplo · Ciudad imaginaria"
  />;
}
