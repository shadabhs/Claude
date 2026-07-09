"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth.actions";
import { Field, Input } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-lg">
            Rx
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage patients &amp; prescriptions
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <Field label="Email">
            <Input
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field label="Password">
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </Field>

          {state.error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
        </form>
      </div>
    </main>
  );
}
