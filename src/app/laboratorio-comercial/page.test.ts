import { afterEach, expect, it, vi } from "vitest";
import CommercialLabPage from "./page";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("404"); } }));
afterEach(() => vi.unstubAllEnvs());

it.each(["production", "test", ""])("returns not found outside development (%s)", mode => {
  vi.stubEnv("NODE_ENV", mode);
  expect(() => CommercialLabPage()).toThrow("404");
});
it("renders the isolated lab in development", () => {
  vi.stubEnv("NODE_ENV", "development");
  expect(CommercialLabPage().type.name).toBe("CommercialLab");
});
