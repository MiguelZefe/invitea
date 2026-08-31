import { getInvitationTemplate } from "@/lib/event-template";
import { describe, expect, it } from "vitest";

describe("getInvitationTemplate", () => {
  it.each([
    "Baby shower",
    "BABY-SHOWER",
    "Babyshower",
    "Baby Shower de Sofía",
    "Bebé shower",
  ])(
    "selects the baby shower template for %s",
    (eventType) => {
      expect(getInvitationTemplate(eventType)).toBe("baby-shower");
    }
  );

  it("keeps the established wedding template as the safe fallback", () => {
    expect(getInvitationTemplate("Boda civil")).toBe("wedding");
    expect(getInvitationTemplate("XV años")).toBe("wedding");
  });
});
