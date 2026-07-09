import { notFound } from "next/navigation";
import { requireTenant } from "@/lib/tenant/context";
import { patientService } from "@/services/patient.service";
import { PageHeader } from "@/components/PageHeader";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";
import { ageSexLine } from "@/lib/format";

export default async function NewPrescriptionPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const ctx = await requireTenant();
  const patient = await patientService.get(ctx, patientId);
  if (!patient) notFound();

  const subtitle = ageSexLine(patient.ageYears, patient.sex);

  return (
    <div>
      <PageHeader title="New prescription" backHref={`/patients/${patientId}`} />
      <div className="mb-4 rounded-xl bg-primary-light/60 px-4 py-2.5 text-sm">
        <span className="font-semibold text-slate-900">{patient.name}</span>
        {subtitle ? <span className="text-slate-600"> · {subtitle}</span> : null}
      </div>
      <PrescriptionForm patientId={patientId} />
    </div>
  );
}
