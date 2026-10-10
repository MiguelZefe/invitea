import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { editorialWeddingSample, elizabethAndAlonso, weddingDateLabel, weddingInitials, weddingTimeLabel, weddingWeekdayLabel } from "@/lib/wedding-story";
import WeddingStory from "./WeddingStory";

it("renders the confirmed wedding details without inventing a reception hour", () => {
  const html = renderToStaticMarkup(createElement(WeddingStory, { initial: elizabethAndAlonso }));
  expect(html).toContain("Elizabeth &amp; Alonso");
  expect(html).toContain("17 de octubre de 2026");
  expect(html).toContain("9:30 a. m.");
  expect(html).toContain("Registro Civil No. 30");
  expect(html).toContain("San Juan de Dios y Coscomate s/n");
  expect(html).toContain("3ra cerrada de Encinos #29");
  expect(html).toContain("Hora por confirmar");
  expect(html).toContain("https://maps.app.goo.gl/iAFs3bEnfUuhjzeD7");
  expect(html).toContain("https://maps.app.goo.gl/cTsCt4EfStBL66rT6");
  expect(html).toContain('<source src="/music/elizabeth-alonso-original.mp3" type="audio/mpeg"');
  expect(html).toContain("Confirma tu asistencia");
  expect(html).toContain("55 2561 3131");
  expect(html).toContain("https://wa.me/525525613131?text=Hola%2C%20quiero%20confirmar");
  expect(html).toContain('target="_blank" rel="noopener noreferrer"');
  expect(html).not.toMatch(/Dragon ball|Mi corazón encantado|supabase/i);
});

it("keeps the reusable editorial sample fictitious and locally editable", () => {
  const html = renderToStaticMarkup(createElement(WeddingStory, { initial: editorialWeddingSample, isSample: true }));
  expect(html).toContain("DATOS FICTICIOS");
  expect(html).toContain("Hazla tuya");
  expect(html).toContain("Los cambios solo viven en este navegador");
  expect(html).toContain("Mar &amp; Sol");
  expect(html).toMatch(/>M<span[^>]*>&amp;<\/span>S<\/div>/);
  expect(html).not.toContain("Elizabeth");
  expect(html).not.toContain("maps.app.goo.gl");
  expect(html).not.toContain("/images/wedding-elizabeth-alonso/");
  expect(html).toContain('<source src="/music/wedding-story-original.wav" type="audio/wav"');
  expect(html).not.toContain("/music/elizabeth-alonso-original.mp3");
  expect(html).not.toContain("wa.me");
  expect(html).not.toContain("55 2561 3131");
});

it("derives initials from both names without splitting names that contain y", () => {
  expect(weddingInitials("Mayra y Yahir")).toEqual(["M", "Y"]);
  expect(weddingInitials("Mar&Sol")).toEqual(["M", "S"]);
  expect(weddingInitials("  ")).toEqual([]);
});

it("formats the ceremony date and hour and rejects invalid dates", () => {
  expect(weddingDateLabel("2026-10-17")).toBe("17 de octubre de 2026");
  expect(weddingTimeLabel("09:30")).toBe("9:30 a. m.");
  expect(weddingWeekdayLabel("2026-10-17")).toBe("sábado");
  expect(weddingWeekdayLabel("2027-05-16")).toBe("domingo");
  expect(weddingDateLabel("2026-02-30")).toBe("Fecha por confirmar");
  expect(weddingTimeLabel("25:00")).toBe("Hora por confirmar");
});
