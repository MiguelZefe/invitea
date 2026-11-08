"use client";

import { attendingPeopleForRsvp } from "@/lib/current-rsvp";

type RSVP = {
  id: string;
  event_slug: string;
  guest_id: string | null;
  full_name: string;
  attendance_status: string;
  guests_count: number;
  message: string | null;
  created_at: string;
};

type ExportRSVPButtonProps = {
  rsvps: RSVP[];
  eventSlug: string;
};

export default function ExportRSVPButton({
  rsvps,
  eventSlug,
}: ExportRSVPButtonProps) {
  const escapeCsvValue = (value: string | number | null) => {
    const safeValue = value === null ? "" : String(value);
    // Public names and messages must remain text when opened in a spreadsheet.
    const textValue = typeof value === "string" && /^[\s\u0000-\u001f]*[=+\-@]/u.test(safeValue)
      ? `'${safeValue}`
      : safeValue;
    return `"${textValue.replace(/"/g, '""')}"`;
  };

  const handleExport = () => {
    const headers = [
      "Nombre",
      "Vínculo con la lista",
      "Asistencia",
      "Personas que asistirán",
      "Mensaje",
      "Fecha",
    ];

    const rows = rsvps.map((rsvp) => [
      rsvp.full_name,
      rsvp.guest_id === null ? "Sin invitado vinculado" : "Invitado vinculado",
      rsvp.attendance_status === "confirmed"
        ? "Sí asistirá"
        : "No asistirá",
      attendingPeopleForRsvp(rsvp),
      rsvp.message || "",
      new Date(rsvp.created_at).toLocaleString("es-MX"),
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `confirmaciones-${eventSlug}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rsvps.length === 0}
      className="rounded-full bg-black px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:opacity-70"
    >
      Exportar CSV
    </button>
  );
}
