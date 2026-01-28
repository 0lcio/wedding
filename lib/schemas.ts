// FILE: lib/schemas.ts
import * as z from "zod";
import { isEmailAllowed } from "@/lib/allowed-domains";

export const rsvpSchema = z
  .object({
    firstName: z.string().min(2, "Il nome è obbligatorio"),
    lastName: z.string().min(2, "Il cognome è obbligatorio"),
    email: z.string().optional(),

    isAttending: z.enum(["yes", "no", "maybe"]),
    maybeReason: z.string().optional(),

    hasGuests: z.boolean().optional(),
    guests: z.string().optional(),

    hasIntolerances: z.boolean().optional(),
    intolerances: z.string().optional(),

    hasFoodPreferences: z.boolean().optional(),
    foodPreferenceType: z
      .enum(["Vegetariano", "Vegano", "Altro", "NO"])
      .optional(),

    needsHotel: z.boolean().optional(),
    notes: z.string().optional(),
    privacyAccepted: z.literal(true, {
      message: "Devi accettare l'informativa per confermare.",
    }),
  })
  .superRefine((data, ctx) => {

    if (data.isAttending !== "yes") return;

    if (
      !data.email ||
      !z.string().email().safeParse(data.email).success ||
      !isEmailAllowed(data.email)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Inserisci un'email valida",
        path: ["email"],
      });
    }

    // --- 2. VALIDAZIONE OSPITI ---
    if (data.hasGuests === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleziona Sì o No",
        path: ["hasGuests"],
      });
    } else if (data.hasGuests === true) {
      if (!data.guests || data.guests.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Inserisci i nomi degli accompagnatori",
          path: ["guests"],
        });
      }
    }

    // --- 3. VALIDAZIONE INTOLLERANZE ---
    if (data.hasIntolerances === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleziona Sì o No",
        path: ["hasIntolerances"],
      });
    } else if (data.hasIntolerances === true) {
      if (!data.intolerances || data.intolerances.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Specifica le intolleranze",
          path: ["intolerances"],
        });
      }
    }

    // --- 4. VALIDAZIONE CIBO ---
    if (data.hasFoodPreferences === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleziona Sì o No",
        path: ["hasFoodPreferences"],
      });
    } else if (data.hasFoodPreferences === true) {
      if (!data.foodPreferenceType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleziona un'opzione",
          path: ["foodPreferenceType"],
        });
      }
    }

    // --- 5. VALIDAZIONE HOTEL ---
    if (data.needsHotel === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleziona Sì o No",
        path: ["needsHotel"],
      });
    }
  });

export type RsvpSchemaType = z.infer<typeof rsvpSchema>;