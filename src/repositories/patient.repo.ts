import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

// Every function takes doctorId and filters by it. There is no code path that
// queries patients without the tenant scope, so cross-tenant access is
// structurally impossible.
export const patientRepo = {
  list(doctorId: string, search?: string) {
    const where: Prisma.PatientWhereInput = { doctorId };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ];
    }
    return prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { prescriptions: true } } },
    });
  },

  byId(doctorId: string, id: string) {
    return prisma.patient.findFirst({ where: { id, doctorId } });
  },

  byIdWithPrescriptions(doctorId: string, id: string) {
    return prisma.patient.findFirst({
      where: { id, doctorId },
      include: {
        prescriptions: {
          orderBy: { date: "desc" },
          include: { _count: { select: { medicines: true } } },
        },
      },
    });
  },

  create(
    doctorId: string,
    data: Omit<Prisma.PatientCreateInput, "doctor">,
  ) {
    return prisma.patient.create({
      data: { ...data, doctor: { connect: { id: doctorId } } },
    });
  },

  update(
    doctorId: string,
    id: string,
    data: Prisma.PatientUpdateInput,
  ) {
    // updateMany enforces the tenant scope in the WHERE clause.
    return prisma.patient.updateMany({ where: { id, doctorId }, data });
  },

  remove(doctorId: string, id: string) {
    return prisma.patient.deleteMany({ where: { id, doctorId } });
  },
};
