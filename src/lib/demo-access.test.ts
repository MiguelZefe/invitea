import { expect, it } from "vitest";
import { createDemoAccessPayload } from "./demo-access";

it("creates a deterministic QR payload with a fictional guest id and no URL", () => {
  expect(createDemoAccessPayload("Primera comunión")).toBe("ZEFEINVITA|DEMO|primera-comunion|INVITADO-001");
  expect(createDemoAccessPayload("Boda")).toBe("ZEFEINVITA|DEMO|boda|INVITADO-001");
  expect(createDemoAccessPayload("   ")).toBe("ZEFEINVITA|DEMO|celebracion|INVITADO-001");
  expect(createDemoAccessPayload("Boda")).not.toMatch(/^https?:/);
});
