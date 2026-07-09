"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant/context";
import { prescriptionService } from "@/services/prescription.service";
import { prescriptionSchema } from "@/lib/validation/prescription";

export type CreateRxResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

// Called programmatically from the client form with a structured payload
// (dynamic medicine rows make FormData awkward).
export async function createPrescriptionAction(
  patientId: string,
  input: unknown,
): Promise<CreateRxResult> {
  const ctx = await requireTenant();
  const parsed = prescriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const id = await prescriptionService.create(ctx, patientId, parsed.data);
  if (!id) return { ok: false, error: "Patient not found" };
  revalidatePath(`/patients/${patientId}`);
  return { ok: true, id };
}

export async function deletePrescriptionAction(
  patientId: string,
  rxId: string,
) {
  const ctx = await requireTenant();
  await prescriptionService.remove(ctx, rxId);
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}`);
}
