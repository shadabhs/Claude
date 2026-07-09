"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPrescriptionAction } from "@/actions/prescription.actions";
import {
  Card,
  Field,
  Input,
  Textarea,
  inputClass,
  labelClass,
} from "@/components/ui/primitives";

type MedRow = {
  key: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
};

let keySeq = 0;
const newRow = (): MedRow => ({
  key: `m${keySeq++}`,
  name: "",
  dose: "",
  frequency: "",
  duration: "",
  instructions: "",
});

export function PrescriptionForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [meds, setMeds] = useState<MedRow[]>([newRow()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateMed(key: string, field: keyof MedRow, value: string) {
    setMeds((rows) =>
      rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => (fd.get(k) as string)?.trim() ?? "";

    const cleanMeds = meds
      .map((m) => ({
        name: m.name.trim(),
        dose: m.dose.trim(),
        frequency: m.frequency.trim(),
        duration: m.duration.trim(),
        instructions: m.instructions.trim() || undefined,
      }))
      .filter((m) => m.name.length > 0);

    if (cleanMeds.length === 0) {
      setError("Add at least one medicine (with a name).");
      return;
    }

    const payload = {
      diagnosis: s("diagnosis") || undefined,
      advice: s("advice") || undefined,
      followUpDate: s("followUpDate") || undefined,
      bpSystolic: s("bpSystolic") || undefined,
      bpDiastolic: s("bpDiastolic") || undefined,
      weightKg: s("weightKg") || undefined,
      temperatureC: s("temperatureC") || undefined,
      pulse: s("pulse") || undefined,
      spo2: s("spo2") || undefined,
      vitalsOther: s("vitalsOther") || undefined,
      medicines: cleanMeds,
    };

    startTransition(async () => {
      const res = await createPrescriptionAction(patientId, payload);
      if (res.ok) {
        router.push(`/patients/${patientId}/prescriptions/${res.id}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Diagnosis */}
      <Card className="space-y-4 p-4">
        <Field label="Diagnosis">
          <Textarea name="diagnosis" placeholder="e.g. Acute viral fever" />
        </Field>
      </Card>

      {/* Vitals */}
      <Card className="space-y-4 p-4">
        <p className="text-sm font-semibold text-slate-700">Vitals</p>
        <div>
          <label className={labelClass}>Blood pressure (mmHg)</label>
          <div className="flex items-center gap-2">
            <Input
              name="bpSystolic"
              type="number"
              inputMode="numeric"
              placeholder="Systolic"
              min={0}
              max={400}
            />
            <span className="text-slate-400">/</span>
            <Input
              name="bpDiastolic"
              type="number"
              inputMode="numeric"
              placeholder="Diastolic"
              min={0}
              max={300}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pulse (bpm)">
            <Input name="pulse" type="number" inputMode="numeric" min={0} max={400} placeholder="—" />
          </Field>
          <Field label="SpO₂ (%)">
            <Input name="spo2" type="number" inputMode="numeric" min={0} max={100} placeholder="—" />
          </Field>
          <Field label="Weight (kg)">
            <Input name="weightKg" type="number" inputMode="decimal" step="0.1" min={0} placeholder="—" />
          </Field>
          <Field label="Temp (°C)">
            <Input name="temperatureC" type="number" inputMode="decimal" step="0.1" min={0} placeholder="—" />
          </Field>
        </div>
        <Field label="Other">
          <Input name="vitalsOther" placeholder="e.g. RBS 140 mg/dL" />
        </Field>
      </Card>

      {/* Medicines */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Medicines</p>
          <button
            type="button"
            onClick={() => setMeds((r) => [...r, newRow()])}
            className="rounded-lg px-2.5 py-1 text-sm font-semibold text-primary transition hover:bg-primary-light"
          >
            + Add
          </button>
        </div>

        {meds.map((m, i) => (
          <div
            key={m.key}
            className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary-dark">
                {i + 1}
              </span>
              <input
                value={m.name}
                onChange={(e) => updateMed(m.key, "name", e.target.value)}
                placeholder="Medicine name"
                className={`${inputClass} py-2`}
              />
              {meds.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setMeds((r) => r.filter((x) => x.key !== m.key))
                  }
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove medicine"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                value={m.dose}
                onChange={(e) => updateMed(m.key, "dose", e.target.value)}
                placeholder="Dose"
                className={`${inputClass} py-2`}
              />
              <input
                value={m.frequency}
                onChange={(e) => updateMed(m.key, "frequency", e.target.value)}
                placeholder="1-0-1"
                className={`${inputClass} py-2`}
              />
              <input
                value={m.duration}
                onChange={(e) => updateMed(m.key, "duration", e.target.value)}
                placeholder="5 days"
                className={`${inputClass} py-2`}
              />
            </div>
            <input
              value={m.instructions}
              onChange={(e) => updateMed(m.key, "instructions", e.target.value)}
              placeholder="Instructions (e.g. after food)"
              className={`${inputClass} py-2`}
            />
          </div>
        ))}
      </Card>

      {/* Advice + follow-up */}
      <Card className="space-y-4 p-4">
        <Field label="Advice">
          <Textarea name="advice" placeholder="Rest, fluids, etc." />
        </Field>
        <Field label="Follow-up date">
          <Input name="followUpDate" type="date" />
        </Field>
      </Card>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-primary-dark disabled:opacity-60"
      >
        {pending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {pending ? "Saving…" : "Save prescription"}
      </button>
    </form>
  );
}
