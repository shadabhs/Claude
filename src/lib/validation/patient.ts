import { z } from "zod";

const emptyToUndef = (v: unknown) =>
  v === "" || v == null ? undefined : v;

export const patientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  sex: z.preprocess(emptyToUndef, z.enum(["M", "F", "O"]).optional()),
  ageYears: z.preprocess(
    emptyToUndef,
    z.coerce.number().int().min(0).max(150).optional(),
  ),
  phone: z.preprocess(emptyToUndef, z.string().trim().max(20).optional()),
  notes: z.preprocess(emptyToUndef, z.string().trim().max(2000).optional()),
});

export type PatientInput = z.infer<typeof patientSchema>;
