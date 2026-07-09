// Serializable DTOs passed from server to client components (PDF, views).
// Prisma Decimal is not serializable across the server/client boundary, so
// weight/temperature are plain numbers here.

export type MedicineDTO = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string | null;
};

export type PrescriptionPatientDTO = {
  id: string;
  name: string;
  sex: string;
  ageYears: number | null;
  phone: string | null;
};

export type PrescriptionDTO = {
  id: string;
  date: string; // ISO
  diagnosis: string | null;
  advice: string | null;
  followUpDate: string | null; // ISO
  bpSystolic: number | null;
  bpDiastolic: number | null;
  weightKg: number | null;
  temperatureC: number | null;
  pulse: number | null;
  spo2: number | null;
  vitalsOther: string | null;
  medicines: MedicineDTO[];
  patient: PrescriptionPatientDTO;
};

export type DoctorProfileDTO = {
  displayName: string;
  qualifications: string;
  registrationNo: string;
  clinicName: string;
  clinicAddress: string;
  phone: string;
  footerNote: string | null;
};
