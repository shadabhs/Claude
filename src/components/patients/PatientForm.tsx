"use client";

import { useActionState } from "react";
import type { PatientFormState } from "@/actions/patient.actions";
import { Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/SubmitButton";

export type PatientDefaults = {
  name?: string;
  sex?: string;
  ageYears?: number | null;
  phone?: string | null;
  notes?: string | null;
};

export function PatientForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (
    prev: PatientFormState,
    formData: FormData,
  ) => Promise<PatientFormState>;
  defaults?: PatientDefaults;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<PatientFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Full name">
        <Input
          name="name"
          defaultValue={defaults?.name ?? ""}
          placeholder="e.g. Ayesha Khan"
          autoComplete="off"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Age (years)">
          <Input
            name="ageYears"
            type="number"
            inputMode="numeric"
            min={0}
            max={150}
            defaultValue={defaults?.ageYears ?? ""}
            placeholder="—"
          />
        </Field>
        <Field label="Sex">
          <Select name="sex" defaultValue={defaults?.sex ?? ""}>
            <option value="">—</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </Select>
        </Field>
      </div>

      <Field label="Phone" hint="Used for the WhatsApp share button">
        <Input
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={defaults?.phone ?? ""}
          placeholder="e.g. 98765 43210"
          autoComplete="off"
        />
      </Field>

      <Field label="Notes">
        <Textarea
          name="notes"
          defaultValue={defaults?.notes ?? ""}
          placeholder="Allergies, chronic conditions, etc."
        />
      </Field>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
    </form>
  );
}
