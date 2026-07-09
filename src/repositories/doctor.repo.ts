import "server-only";
import { prisma } from "@/lib/db/prisma";

// Identity lookups (not tenant-scoped: this is how we resolve the tenant).
export const doctorRepo = {
  findByEmail(email: string) {
    return prisma.doctor.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  },

  findById(id: string) {
    return prisma.doctor.findUnique({ where: { id } });
  },
};
