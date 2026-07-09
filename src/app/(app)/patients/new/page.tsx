import { PageHeader } from "@/components/PageHeader";
import { PatientForm } from "@/components/patients/PatientForm";
import { createPatientAction } from "@/actions/patient.actions";

export default function NewPatientPage() {
  return (
    <div>
      <PageHeader title="New patient" backHref="/" />
      <PatientForm action={createPatientAction} submitLabel="Save patient" />
    </div>
  );
}
