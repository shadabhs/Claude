"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/primitives";
import { ConfirmForm } from "@/components/ConfirmForm";
import { deletePrescriptionAction } from "@/actions/prescription.actions";
import { ageSexLine, formatDate } from "@/lib/format";
import type { PrescriptionDTO, DoctorProfileDTO } from "@/types/prescription";

function vitals(rx: PrescriptionDTO): string[] {
  const v: string[] = [];
  if (rx.bpSystolic != null || rx.bpDiastolic != null)
    v.push(`BP ${rx.bpSystolic ?? "–"}/${rx.bpDiastolic ?? "–"}`);
  if (rx.pulse != null) v.push(`Pulse ${rx.pulse}`);
  if (rx.spo2 != null) v.push(`SpO₂ ${rx.spo2}%`);
  if (rx.weightKg != null) v.push(`Wt ${rx.weightKg} kg`);
  if (rx.temperatureC != null) v.push(`Temp ${rx.temperatureC}°C`);
  if (rx.vitalsOther) v.push(rx.vitalsOther);
  return v;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function PrescriptionView({
  rx,
  profile,
  patientId,
}: {
  rx: PrescriptionDTO;
  profile: DoctorProfileDTO;
  patientId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const safeName = rx.patient.name.replace(/[^a-z0-9]+/gi, "-");
  const filename = `Rx-${safeName}-${formatDate(rx.date).replace(/\s/g, "-")}.pdf`;
  const v = vitals(rx);
  const deleteAction = deletePrescriptionAction.bind(null, patientId, rx.id);

  async function makeBlob(): Promise<Blob> {
    const [{ pdf }, mod] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/pdf/PrescriptionPdf"),
    ]);
    return pdf(<mod.PrescriptionPdf rx={rx} profile={profile} />).toBlob();
  }

  async function sharePdf() {
    setBusy(true);
    setNote(null);
    try {
      const blob = await makeBlob();
      const file = new File([blob], filename, { type: "application/pdf" });
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: filename });
      } else {
        downloadBlob(blob, filename);
        setNote("PDF downloaded. Attach it in WhatsApp to send.");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setNote("Could not generate the PDF. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    setBusy(true);
    setNote(null);
    try {
      downloadBlob(await makeBlob(), filename);
    } catch {
      setNote("Could not generate the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const waLink = rx.patient.phone
    ? `https://wa.me/${rx.patient.phone.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={sharePdf}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-primary-dark disabled:opacity-60"
        >
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="m16 6-4-4-4 4M12 2v14" />
            </svg>
          )}
          {busy ? "Preparing…" : "Share prescription (PDF)"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={downloadPdf}
            disabled={busy}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Download
          </button>
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-center text-sm font-medium text-green-700 transition hover:bg-green-100"
            >
              WhatsApp chat
            </a>
          ) : null}
        </div>
        {note ? <p className="text-center text-xs text-slate-500">{note}</p> : null}
      </div>

      {/* On-screen preview */}
      <Card className="space-y-4 p-4">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="font-bold text-slate-900">{rx.patient.name}</p>
            <p className="text-sm text-slate-500">
              {ageSexLine(rx.patient.ageYears, rx.patient.sex) || "—"}
            </p>
          </div>
          <p className="text-sm font-medium text-slate-600">
            {formatDate(rx.date)}
          </p>
        </div>

        {v.length > 0 ? (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Vitals
            </p>
            <p className="text-sm text-slate-700">{v.join("  •  ")}</p>
          </div>
        ) : null}

        {rx.diagnosis ? (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Diagnosis
            </p>
            <p className="text-sm text-slate-800">{rx.diagnosis}</p>
          </div>
        ) : null}

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Medicines
          </p>
          <ul className="space-y-2">
            {rx.medicines.map((m, i) => (
              <li key={m.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-medium text-slate-900">
                  {i + 1}. {m.name}
                </p>
                <p className="text-sm text-slate-500">
                  {[m.dose, m.frequency, m.duration].filter(Boolean).join(" · ") ||
                    "—"}
                </p>
                {m.instructions ? (
                  <p className="text-xs text-slate-500">{m.instructions}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {rx.advice ? (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Advice
            </p>
            <p className="text-sm text-slate-800">{rx.advice}</p>
          </div>
        ) : null}

        {rx.followUpDate ? (
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Follow-up:</span>{" "}
            {formatDate(rx.followUpDate)}
          </p>
        ) : null}
      </Card>

      <ConfirmForm
        action={deleteAction}
        confirm="Delete this prescription? This cannot be undone."
      >
        <button
          type="submit"
          className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete prescription
        </button>
      </ConfirmForm>
    </div>
  );
}
