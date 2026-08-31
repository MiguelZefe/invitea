export const REQUIRED_INVITATION_FIELDS = [
  "event_type",
  "main_names",
  "title",
  "event_date",
  "hero_label",
] as const;

export const OPTIONAL_INVITATION_FIELDS = [
  "subtitle",
  "ceremony_place",
  "ceremony_time",
  "ceremony_address",
  "ceremony_maps_url",
  "reception_place",
  "reception_time",
  "reception_address",
  "reception_maps_url",
  "dress_code",
  "dress_code_description",
] as const;

export type InvitationField =
  | (typeof REQUIRED_INVITATION_FIELDS)[number]
  | (typeof OPTIONAL_INVITATION_FIELDS)[number];

export const INVITATION_FIELD_MAX_LENGTHS = {
  event_type: 50,
  main_names: 120,
  title: 120,
  subtitle: 240,
  event_date: 120,
  hero_label: 100,
  ceremony_place: 160,
  ceremony_time: 50,
  ceremony_address: 300,
  ceremony_maps_url: 2048,
  reception_place: 160,
  reception_time: 50,
  reception_address: 300,
  reception_maps_url: 2048,
  dress_code: 120,
  dress_code_description: 240,
} as const satisfies Record<InvitationField, number>;

type InvitationValues = Record<
  (typeof REQUIRED_INVITATION_FIELDS)[number],
  string
> &
  Record<(typeof OPTIONAL_INVITATION_FIELDS)[number], string | null>;

type InvitationFormResult =
  | { success: true; values: InvitationValues }
  | { success: false; message: string };

function getString(formData: FormData, field: InvitationField) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function isValidHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function validateInvitationForm(
  formData: FormData
): InvitationFormResult {
  const rawValues = Object.fromEntries(
    [...REQUIRED_INVITATION_FIELDS, ...OPTIONAL_INVITATION_FIELDS].map(
      (field) => [field, getString(formData, field)]
    )
  ) as Record<InvitationField, string>;

  if (REQUIRED_INVITATION_FIELDS.some((field) => !rawValues[field])) {
    return {
      success: false,
      message: "Completa todos los campos obligatorios antes de continuar.",
    };
  }

  const oversizedField = (
    Object.keys(INVITATION_FIELD_MAX_LENGTHS) as InvitationField[]
  ).find(
    (field) =>
      rawValues[field].length > INVITATION_FIELD_MAX_LENGTHS[field]
  );

  if (oversizedField) {
    return {
      success: false,
      message: "Uno de los campos supera la longitud permitida.",
    };
  }

  for (const field of [
    "ceremony_maps_url",
    "reception_maps_url",
  ] as const) {
    if (rawValues[field] && !isValidHttpsUrl(rawValues[field])) {
      return {
        success: false,
        message: "Los enlaces de ubicación deben comenzar con https://.",
      };
    }
  }

  const requiredValues = Object.fromEntries(
    REQUIRED_INVITATION_FIELDS.map((field) => [field, rawValues[field]])
  ) as Record<(typeof REQUIRED_INVITATION_FIELDS)[number], string>;
  const optionalValues = Object.fromEntries(
    OPTIONAL_INVITATION_FIELDS.map((field) => [
      field,
      rawValues[field] || null,
    ])
  ) as Record<(typeof OPTIONAL_INVITATION_FIELDS)[number], string | null>;

  return {
    success: true,
    values: { ...requiredValues, ...optionalValues },
  };
}
