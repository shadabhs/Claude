import { z } from "zod";

const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);

const optInt = (max: number) =>
  z.preprocess(emptyToUndef, z.coerce.number().int().min(0).max(max).optional());

const optDecimal = (max: number) =>
  z.preprocess(emptyToUndef, z.coerce.number().min(0).max(max).optional());

const optText = (max: number) =>
  z.preprocess(emptyToUndef, z.string().trim().max(max).optional());

export const medicineSchema = z.object({
  name: z.string().trim().min(1, "Medicine name is required").max(200),
  dose: z.string().trim().max(100).optional().default(""),
  frequency: z.string().trim().max(100).optional().default(""),
  duration: z.string().trim().max(100).optional().default(""),
  instructions: optText(300),
});

export const prescriptionSchema = z.object({
  diagnosis: optText(2000),
  advice: optText(2000),
  followUpDate: z.preprocess(
    emptyToUndef,
    z.string().optional(),
  ),
  // Vitals
  bpSystolic: optInt(400),
  bpDiastolic: optInt(300),
  weightKg: optDecimal(500),
  temperatureC: optDecimal(50),
  pulse: optInt(400),
  spo2: optInt(100),
  vitalsOther: optText(500),
  // Line items
  medicines: z.array(medicineSchema).max(50).default([]),
});

export type MedicineInput = z.infer<typeof medicineSchema>;
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
