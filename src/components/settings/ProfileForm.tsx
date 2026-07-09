"use client";

import { useActionState } from "react";
import {
  saveProfileAction,
  type ProfileFormState,
} from "@/actions/profile.actions";
import { Card, Field, Input, Textarea } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { DoctorProfileDTO } from "@/types/prescription";

export function ProfileForm({ profile }: { profile: DoctorProfileDTO }) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    saveProfileAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <Card className="space-y-4 p-4">
        <p className="text-sm text-slate-500">
          These details appear at the top of every prescription PDF.
        </p>
        <Field label="Name">
          <Input
            name="displayName"
            defaultValue={profile.displayName}
            placeholder="Dr. Imran"
            required
          />
        </Field>
        <Field label="Qualifications">
          <Input
            name="qualifications"
            defaultValue={profile.qualifications}
            placeholder="MBBS, MD (Medicine)"
          />
        </Field>
        <Field label="Registration number">
          <Input
            name="registrationNo"
            defaultValue={profile.registrationNo}
            placeholder="e.g. 12345"
          />
        </Field>
      </Card>

      <Card className="space-y-4 p-4">
        <Field label="Clinic name">
          <Input
            name="clinicName"
            defaultValue={profile.clinicName}
            placeholder="e.g. City Care Clinic"
          />
        </Field>
        <Field label="Clinic address">
          <Textarea
            name="clinicAddress"
            defaultValue={profile.clinicAddress}
            placeholder="Street, area, city"
          />
        </Field>
        <Field label="Phone">
          <Input
            name="phone"
            type="tel"
            defaultValue={profile.phone}
            placeholder="Clinic / contact number"
          />
        </Field>
        <Field label="Footer note" hint="e.g. clinic timings or a disclaimer">
          <Input
            name="footerNote"
            defaultValue={profile.footerNote ?? ""}
            placeholder="Mon–Sat, 10am–2pm"
          />
        </Field>
      </Card>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.saved ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Saved.
        </p>
      ) : null}

      <SubmitButton pendingText="Saving…">Save profile</SubmitButton>
    </form>
  );
}
