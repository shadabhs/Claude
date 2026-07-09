"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/tenant/context";
import { profileService } from "@/services/profile.service";
import { profileSchema } from "@/lib/validation/profile";

export type ProfileFormState = { error?: string; saved?: boolean };

export async function saveProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const ctx = await requireTenant();
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    qualifications: formData.get("qualifications"),
    registrationNo: formData.get("registrationNo"),
    clinicName: formData.get("clinicName"),
    clinicAddress: formData.get("clinicAddress"),
    phone: formData.get("phone"),
    footerNote: formData.get("footerNote"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await profileService.save(ctx, parsed.data);
  revalidatePath("/settings");
  return { saved: true };
}
