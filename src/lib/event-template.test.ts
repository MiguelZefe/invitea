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

  it("uses the celebration template for other supported event types", () => {
    for (const eventType of ["Cumpleaños", "Bautizo", "XV años", "Primera comunión", "Graduación", "Aniversario"]) {
      expect(getInvitationTemplate(eventType)).toBe("celebration");
    }
  });

  it("keeps weddings on the established design and uses a neutral fallback", () => {
    expect(getInvitationTemplate("Boda civil")).toBe("wedding");
    expect(getInvitationTemplate("Matrimonio civil")).toBe("wedding");
    expect(getInvitationTemplate("Evento especial")).toBe("celebration");
  });
});
