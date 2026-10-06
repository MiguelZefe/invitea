import { createElement } from "react";
import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DemoAccessCard from "./DemoAccessCard";

it("keeps the QR and check-in clearly marked as a local-only demo", () => {
  const html = renderToStaticMarkup(createElement(DemoAccessCard, { eventType: "Boda", allowCheckin: true }));

  expect(html).toContain("ZEFEINVITA|DEMO|boda|INVITADO-001");
  expect(html).toContain("Simular check-in");
  expect(html).toContain("No consulta invitados y no guarda entradas");
  expect(html).not.toContain("https://");
});

it("does not show wedding check-in controls for other event types", () => {
  const html = renderToStaticMarkup(createElement(DemoAccessCard, { eventType: "Cumpleaños", allowCheckin: false }));

  expect(html).toContain("Acceso de muestra");
  expect(html).not.toContain("Simular check-in");
});
