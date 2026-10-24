import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { expect, it } from "vitest";
import Home from "./page";

it("opens with visible template choices and no incomplete quick-order form", () => {
  const html = renderToStaticMarkup(createElement(Home));
  expect(html).toContain('aria-label="Plantillas de ejemplo"');
  expect(html).toContain('href="/muestras/cumpleanos"');
  expect(html).toContain('href="/muestras/bautizo"');
  expect(html).toContain("Ver 4 estilos");
  expect(html).not.toContain("Pedido rápido");
  expect(html).not.toContain("Prepara tu mensaje");
  expect(html).toContain("$99");
});
