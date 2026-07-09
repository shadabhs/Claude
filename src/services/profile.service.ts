import "server-only";
import { profileRepo } from "@/repositories/profile.repo";
import type { TenantContext } from "@/lib/tenant/context";
import type { ProfileInput } from "@/lib/validation/profile";
import type { DoctorProfileDTO } from "@/types/prescription";

export const profileService = {
  async get(ctx: TenantContext): Promise<DoctorProfileDTO> {
    const p = await profileRepo.byDoctor(ctx.doctorId);
    return {
      displayName: p?.displayName ?? ctx.name,
      qualifications: p?.qualifications ?? "",
      registrationNo: p?.registrationNo ?? "",
      clinicName: p?.clinicName ?? "",
      clinicAddress: p?.clinicAddress ?? "",
      phone: p?.phone ?? "",
      footerNote: p?.footerNote ?? null,
    };
  },

  async save(ctx: TenantContext, input: ProfileInput) {
    await profileRepo.upsert(ctx.doctorId, {
      displayName: input.displayName,
      qualifications: input.qualifications,
      registrationNo: input.registrationNo,
      clinicName: input.clinicName,
      clinicAddress: input.clinicAddress,
      phone: input.phone,
      footerNote: input.footerNote || null,
    });
  },
};
