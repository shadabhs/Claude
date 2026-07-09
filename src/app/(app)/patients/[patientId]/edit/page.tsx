import { notFound } from "next/navigation";
import { requireTenant } from "@/lib/tenant/context";
import { patientService } from "@/services/patient.service";
import { PageHeader } from "@/components/PageHeader";
import { PatientForm } from "@/components/patients/PatientForm";
import { updatePatientAction } from "@/actions/patient.actions";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const ctx = await requireTenant();
  const patient = await patientService.get(ctx, patientId);
  if (!patient) notFound();

  const action = updatePatientAction.bind(null, patientId);

  return (
    <div>
      <PageHeader title="Edit patient" backHref={`/patients/${patientId}`} />
      <PatientForm
        action={action}
        submitLabel="Save changes"
        defaults={{
          name: patient.name,
          sex: patient.sex,
          ageYears: patient.ageYears,
          phone: patient.phone,
          notes: patient.notes,
        }}
      />
    </div>
  );
}
