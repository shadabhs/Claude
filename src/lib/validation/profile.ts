import { z } from "zod";

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required").max(120),
  qualifications: z.string().trim().max(200).default(""),
  registrationNo: z.string().trim().max(100).default(""),
  clinicName: z.string().trim().max(200).default(""),
  clinicAddress: z.string().trim().max(500).default(""),
  phone: z.string().trim().max(40).default(""),
  footerNote: z.string().trim().max(500).default(""),
});

export type ProfileInput = z.infer<typeof profileSchema>;
