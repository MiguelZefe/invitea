import { expect, it } from "vitest";
import { googleMapsSearchLink } from "./google-maps";

it("builds a Google Maps search link for the displayed sample venue", () => {
  const link = new URL(googleMapsSearchLink("Jardín de ejemplo · Ciudad imaginaria"));

  expect(link.origin).toBe("https://www.google.com");
  expect(link.pathname).toBe("/maps/search/");
  expect(link.searchParams.get("api")).toBe("1");
  expect(link.searchParams.get("query")).toBe("Jardín de ejemplo · Ciudad imaginaria");
});
