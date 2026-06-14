"use client";

type RSVP = {
  id: string;
  event_slug: string;
  full_name: string;
  attendance_status: string;
  guests_count: number;
  message: string | null;
  created_at: string;
};

type ExportRSVPButtonProps = {
  rsvps: RSVP[];
};

export default function ExportRSVPButton({ rsvps }: ExportRSVPButtonProps) {
  const escapeCsvValue = (value: string | number | null) => {
    const safeValue = value === null ? "" : String(value);
    return `"${safeValue.replace(/"/g, '""')}"`;
  };

  const handleExport = () => {
    const headers = [
      "Nombre",
      "Asistencia",
      "Personas",
      "Mensaje",
      "Fecha",
    ];

    const rows = rsvps.map((rsvp) => [
      rsvp.full_name,
      rsvp.attendance_status === "confirmed"
        ? "Sí asistirá"
        : "No asistirá",
      rsvp.guests_count,
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
    link.download = "confirmaciones-demo-boda.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rsvps.length === 0}
      className="rounded-full bg-black px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Exportar CSV
    </button>
  );
}