import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export const profileRepo = {
  byDoctor(doctorId: string) {
    return prisma.doctorProfile.findUnique({ where: { doctorId } });
  },

  upsert(doctorId: string, data: Prisma.DoctorProfileUpdateInput) {
    return prisma.doctorProfile.upsert({
      where: { doctorId },
      update: data,
      create: {
        doctorId,
        displayName: (data.displayName as string) ?? "Doctor",
        qualifications: (data.qualifications as string) ?? "",
        registrationNo: (data.registrationNo as string) ?? "",
        clinicName: (data.clinicName as string) ?? "",
        clinicAddress: (data.clinicAddress as string) ?? "",
        phone: (data.phone as string) ?? "",
        footerNote: (data.footerNote as string) ?? null,
      },
    });
  },
};
