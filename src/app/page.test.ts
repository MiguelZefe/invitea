import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { expect, it } from "vitest";
import Home from "./page";

it("opens with visible template choices and no incomplete quick-order form", () => {
  const html = renderToStaticMarkup(createElement(Home));
  expect(html).toContain('aria-label="Plantillas de ejemplo"');
  expect(html).toContain('href="/muestras/cumpleanos"');
  expect(html).toContain('href="/muestras/bautizo"');
  expect(html).toContain("Categorías de eventos");
  expect(html).toContain("Ver 15 estilos");
  expect(html).toContain("Ver 9 estilos");
  for (const slug of ["cumpleanos", "bautizo", "baby-shower", "boda", "xv-anos", "primera-comunion", "graduacion", "aniversario"]) {
    expect(html).toContain(`href="/muestras/${slug}"`);
  }
  for (const cover of ["cumpleanos-festival-luz", "cumpleanos-jardin-tropical", "cumpleanos-noche-ciruela"]) {
    expect(html).toContain(`/muestras/cumpleanos#plantilla-${cover}`);
  }
  expect(html).not.toContain("Pedido rápido");
  expect(html).not.toContain("Prepara tu mensaje");
  expect(html).toContain("$99");
});
