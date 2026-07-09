import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export const prescriptionRepo = {
  byId(doctorId: string, id: string) {
    return prisma.prescription.findFirst({
      where: { id, doctorId },
      include: {
        medicines: { orderBy: { sortOrder: "asc" } },
        patient: true,
      },
    });
  },

  create(
    doctorId: string,
    patientId: string,
    data: Omit<
      Prisma.PrescriptionCreateInput,
      "doctor" | "patient" | "medicines"
    >,
    medicines: Array<
      Omit<Prisma.MedicineCreateManyInput, "prescriptionId" | "doctorId">
    >,
  ) {
    return prisma.prescription.create({
      data: {
        ...data,
        doctor: { connect: { id: doctorId } },
        patient: { connect: { id: patientId } },
        medicines: {
          create: medicines.map((m, i) => ({
            ...m,
            sortOrder: i,
            doctor: { connect: { id: doctorId } },
          })),
        },
      },
      include: { medicines: true },
    });
  },

  remove(doctorId: string, id: string) {
    return prisma.prescription.deleteMany({ where: { id, doctorId } });
  },
};
