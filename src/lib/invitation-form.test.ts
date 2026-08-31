import {
  INVITATION_FIELD_MAX_LENGTHS,
  validateInvitationForm,
} from "@/lib/invitation-form";
import { describe, expect, it } from "vitest";

function createValidFormData() {
  const formData = new FormData();
  formData.set("event_type", "Boda");
  formData.set("main_names", "Persona A y Persona B");
  formData.set("title", "Nuestro evento");
  formData.set("event_date", "30 de agosto de 2026");
  formData.set("hero_label", "Celebremos");
  return formData;
}

describe("validateInvitationForm", () => {
  it("normalizes valid required and optional values", () => {
    const formData = createValidFormData();
    formData.set("subtitle", "  Te esperamos  ");
    formData.set("ceremony_maps_url", "https://maps.example/location");

    const result = validateInvitationForm(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.values.subtitle).toBe("Te esperamos");
      expect(result.values.reception_place).toBeNull();
    }
  });

  it("rejects missing required values", () => {
    const formData = createValidFormData();
    formData.delete("title");

    expect(validateInvitationForm(formData)).toEqual({
      success: false,
      message: "Completa todos los campos obligatorios antes de continuar.",
    });
  });

  it("rejects oversized values", () => {
    const formData = createValidFormData();
    formData.set(
      "main_names",
      "x".repeat(INVITATION_FIELD_MAX_LENGTHS.main_names + 1)
    );

    expect(validateInvitationForm(formData)).toMatchObject({
      success: false,
    });
  });

  it("accepts only HTTPS location links", () => {
    const formData = createValidFormData();
    formData.set("reception_maps_url", "http://maps.example/location");

    expect(validateInvitationForm(formData)).toEqual({
      success: false,
      message: "Los enlaces de ubicación deben comenzar con https://.",
    });
  });
});
