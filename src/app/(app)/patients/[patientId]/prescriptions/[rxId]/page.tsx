import { notFound } from "next/navigation";
import { requireTenant } from "@/lib/tenant/context";
import { prescriptionService } from "@/services/prescription.service";
import { profileService } from "@/services/profile.service";
import { PageHeader } from "@/components/PageHeader";
import { PrescriptionView } from "@/components/prescriptions/PrescriptionView";

export default async function PrescriptionPage({
  params,
}: {
  params: Promise<{ patientId: string; rxId: string }>;
}) {
  const { patientId, rxId } = await params;
  const ctx = await requireTenant();
  const [rx, profile] = await Promise.all([
    prescriptionService.get(ctx, rxId),
    profileService.get(ctx),
  ]);
  if (!rx) notFound();

  return (
    <div>
      <PageHeader title="Prescription" backHref={`/patients/${patientId}`} />
      <PrescriptionView rx={rx} profile={profile} patientId={patientId} />
    </div>
  );
}
