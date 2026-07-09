import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenant } from "@/lib/tenant/context";
import { patientService } from "@/services/patient.service";
import { deletePatientAction } from "@/actions/patient.actions";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Card } from "@/components/ui/primitives";
import { ageSexLine, formatDate } from "@/lib/format";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const ctx = await requireTenant();
  const patient = await patientService.getWithHistory(ctx, patientId);
  if (!patient) notFound();

  const subtitle = ageSexLine(patient.ageYears, patient.sex);
  const deleteAction = deletePatientAction.bind(null, patientId);

  return (
    <div className="space-y-5">
      <PageHeader
        title={patient.name}
        backHref="/"
        action={
          <Link
            href={`/patients/${patientId}/edit`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary-light"
          >
            Edit
          </Link>
        }
      />

      <Card className="p-4">
        <dl className="space-y-2 text-sm">
          {subtitle ? (
            <div className="flex justify-between">
              <dt className="text-slate-500">Details</dt>
              <dd className="font-medium text-slate-900">{subtitle}</dd>
            </div>
          ) : null}
          {patient.phone ? (
            <div className="flex justify-between">
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium text-slate-900">
                <a href={`tel:${patient.phone}`} className="text-primary">
                  {patient.phone}
                </a>
              </dd>
            </div>
          ) : null}
          {patient.notes ? (
            <div>
              <dt className="mb-0.5 text-slate-500">Notes</dt>
              <dd className="whitespace-pre-wrap text-slate-800">
                {patient.notes}
              </dd>
            </div>
          ) : null}
          {!subtitle && !patient.phone && !patient.notes ? (
            <p className="text-slate-400">No additional details.</p>
          ) : null}
        </dl>
      </Card>

      <Link
        href={`/patients/${patientId}/prescriptions/new`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.99]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New prescription
      </Link>

      <section>
        <h2 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
          History ({patient.prescriptions.length})
        </h2>
        {patient.prescriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-8 text-center text-sm text-slate-500">
            No prescriptions yet.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {patient.prescriptions.map((rx) => (
              <li key={rx.id}>
                <Link
                  href={`/patients/${patientId}/prescriptions/${rx.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">
                      {formatDate(rx.date)}
                    </p>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {rx._count.medicines} med
                      {rx._count.medicines === 1 ? "" : "s"}
                    </span>
                  </div>
                  {rx.diagnosis ? (
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {rx.diagnosis}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmForm
        action={deleteAction}
        confirm={`Delete ${patient.name} and all their prescriptions? This cannot be undone.`}
        className="pt-2"
      >
        <button
          type="submit"
          className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete patient
        </button>
      </ConfirmForm>
    </div>
  );
}
