"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant/context";
import { patientService } from "@/services/patient.service";
import { patientSchema } from "@/lib/validation/patient";

export type PatientFormState = { error?: string };

function parse(formData: FormData) {
  return patientSchema.safeParse({
    name: formData.get("name"),
    sex: formData.get("sex"),
    ageYears: formData.get("ageYears"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });
}

export async function createPatientAction(
  _prev: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  const ctx = await requireTenant();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const patient = await patientService.create(ctx, parsed.data);
  revalidatePath("/");
  redirect(`/patients/${patient.id}`);
}

export async function updatePatientAction(
  patientId: string,
  _prev: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  const ctx = await requireTenant();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const ok = await patientService.update(ctx, patientId, parsed.data);
  if (!ok) return { error: "Patient not found" };
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/");
  redirect(`/patients/${patientId}`);
}

export async function deletePatientAction(patientId: string) {
  const ctx = await requireTenant();
  await patientService.remove(ctx, patientId);
  revalidatePath("/");
  redirect("/");
}
