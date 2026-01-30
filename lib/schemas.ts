import * as z from "zod";
import { isEmailAllowed } from "@/lib/allowed-domains";

export const rsvpSchema = z
  .object({
    firstName: z.string().min(2, "Il nome è obbligatorio"),
    lastName: z.string().min(2, "Il cognome è obbligatorio"),
    
    email: z.string()
      .min(1, "L'email è obbligatoria")
      .email("Inserisci un'email valida")
      .refine((val) => isEmailAllowed(val), {
        message: "Inserisci un'email valida",
      }),

    isAttending: z.enum(["yes", "no", "maybe"], {
    }),
    
    maybeReason: z.string().optional(),

    hasIntolerances: z.boolean().optional(),
    intolerances: z.string().optional(),

    hasFoodPreferences: z.boolean().optional(),
    foodPreferenceType: z
      .enum(["Vegetariano", "Vegano", "Altro", "NO"])
      .optional(),

    needsHotel: z.boolean().optional(),
    notes: z.string().optional(),
    privacyAccepted: z.boolean().refine((val) => val === true, {
      message: "Devi accettare l'informativa per confermare.",
    }),
  })
  .superRefine((data, ctx) => {

    if (data.isAttending !== "yes") return;

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
    
    if (data.needsHotel === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleziona Sì o No",
        path: ["needsHotel"],
      });
    }
  });

export type RsvpSchemaType = z.infer<typeof rsvpSchema>;