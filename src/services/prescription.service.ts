import "server-only";
import { prescriptionRepo } from "@/repositories/prescription.repo";
import { patientRepo } from "@/repositories/patient.repo";
import type { TenantContext } from "@/lib/tenant/context";
import type { PrescriptionInput } from "@/lib/validation/prescription";
import type { PrescriptionDTO } from "@/types/prescription";
import type { Prisma } from "@prisma/client";

type PrescriptionWithRelations = Prisma.PrescriptionGetPayload<{
  include: { medicines: true; patient: true };
}>;

function toDTO(p: PrescriptionWithRelations): PrescriptionDTO {
  return {
    id: p.id,
    date: p.date.toISOString(),
    diagnosis: p.diagnosis,
    advice: p.advice,
    followUpDate: p.followUpDate ? p.followUpDate.toISOString() : null,
    bpSystolic: p.bpSystolic,
    bpDiastolic: p.bpDiastolic,
    weightKg: p.weightKg ? Number(p.weightKg) : null,
    temperatureC: p.temperatureC ? Number(p.temperatureC) : null,
    pulse: p.pulse,
    spo2: p.spo2,
    vitalsOther: p.vitalsOther,
    medicines: p.medicines
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => ({
        id: m.id,
        name: m.name,
        dose: m.dose,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
    patient: {
      id: p.patient.id,
      name: p.patient.name,
      sex: p.patient.sex,
      ageYears: p.patient.ageYears,
      phone: p.patient.phone,
    },
  };
}

export const prescriptionService = {
  async get(ctx: TenantContext, id: string): Promise<PrescriptionDTO | null> {
    const p = await prescriptionRepo.byId(ctx.doctorId, id);
    return p ? toDTO(p) : null;
  },

  async create(
    ctx: TenantContext,
    patientId: string,
    input: PrescriptionInput,
  ): Promise<string | null> {
    // Verify the patient belongs to this doctor before writing.
    const patient = await patientRepo.byId(ctx.doctorId, patientId);
    if (!patient) return null;

    const created = await prescriptionRepo.create(
      ctx.doctorId,
      patientId,
      {
        diagnosis: input.diagnosis ?? null,
        advice: input.advice ?? null,
        followUpDate: input.followUpDate
          ? new Date(input.followUpDate)
          : null,
        bpSystolic: input.bpSystolic ?? null,
        bpDiastolic: input.bpDiastolic ?? null,
        weightKg: input.weightKg ?? null,
        temperatureC: input.temperatureC ?? null,
        pulse: input.pulse ?? null,
        spo2: input.spo2 ?? null,
        vitalsOther: input.vitalsOther ?? null,
      },
      input.medicines.map((m) => ({
        name: m.name,
        dose: m.dose ?? "",
        frequency: m.frequency ?? "",
        duration: m.duration ?? "",
        instructions: m.instructions ?? null,
      })),
    );
    return created.id;
  },

  async remove(ctx: TenantContext, id: string) {
    const res = await prescriptionRepo.remove(ctx.doctorId, id);
    return res.count > 0;
  },
};
