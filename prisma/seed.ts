import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_DOCTOR_EMAIL ?? "imran@example.com")
    .trim()
    .toLowerCase();
  const password = process.env.SEED_DOCTOR_PASSWORD ?? "changeme123";
  const name = process.env.SEED_DOCTOR_NAME ?? "Dr. Imran";

  const passwordHash = await bcrypt.hash(password, 10);

  const doctor = await prisma.doctor.upsert({
    where: { email },
    update: { name },
    create: {
      email,
      name,
      passwordHash,
      role: "OWNER",
    },
  });

  await prisma.doctorProfile.upsert({
    where: { doctorId: doctor.id },
    update: {},
    create: {
      doctorId: doctor.id,
      displayName: name,
      qualifications: "MBBS, MD (Medicine)",
      registrationNo: "",
      clinicName: "",
      clinicAddress: "",
      phone: "",
    },
  });

  console.log(`✔ Seeded doctor: ${email} (id: ${doctor.id})`);
  console.log(
    `  Login password is the SEED_DOCTOR_PASSWORD value ("${password}"). Change it after first login is recommended.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
