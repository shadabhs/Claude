import Link from "next/link";
import { requireTenant } from "@/lib/tenant/context";
import { patientService } from "@/services/patient.service";
import { SearchBar } from "@/components/patients/SearchBar";
import { ageSexLine } from "@/lib/format";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const ctx = await requireTenant();
  const { q } = await searchParams;
  const patients = await patientService.list(ctx, q);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Patients</h1>
        <span className="text-sm text-slate-500">{patients.length}</span>
      </div>

      <SearchBar initial={q ?? ""} />

      {patients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center">
          <p className="font-medium text-slate-700">
            {q ? "No patients match your search" : "No patients yet"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {q ? "Try a different name or number." : "Add your first patient to get started."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {patients.map((p) => {
            const subtitle = ageSexLine(p.ageYears, p.sex);
            return (
              <li key={p.id}>
                <Link
                  href={`/patients/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
                >
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary-light text-base font-semibold text-primary-dark">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {p.name}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {subtitle || p.phone || "—"}
                    </p>
                  </div>
                  <span className="flex-none rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {p._count.prescriptions} Rx
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/patients/new"
        className="fixed bottom-20 right-5 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-white shadow-lg shadow-primary/30 transition active:scale-95"
        aria-label="Add patient"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add
      </Link>
    </div>
  );
}
