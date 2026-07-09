import "server-only";
import { patientRepo } from "@/repositories/patient.repo";
import type { TenantContext } from "@/lib/tenant/context";
import type { PatientInput } from "@/lib/validation/patient";

export const patientService = {
  list(ctx: TenantContext, search?: string) {
    return patientRepo.list(ctx.doctorId, search);
  },

  get(ctx: TenantContext, id: string) {
    return patientRepo.byId(ctx.doctorId, id);
  },

  getWithHistory(ctx: TenantContext, id: string) {
    return patientRepo.byIdWithPrescriptions(ctx.doctorId, id);
  },

  create(ctx: TenantContext, input: PatientInput) {
    return patientRepo.create(ctx.doctorId, {
      name: input.name,
      sex: input.sex ?? "",
      ageYears: input.ageYears ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
    });
  },

  async update(ctx: TenantContext, id: string, input: PatientInput) {
    const res = await patientRepo.update(ctx.doctorId, id, {
      name: input.name,
      sex: input.sex ?? "",
      ageYears: input.ageYears ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
    });
    return res.count > 0;
  },

  async remove(ctx: TenantContext, id: string) {
    const res = await patientRepo.remove(ctx.doctorId, id);
    return res.count > 0;
  },
};
