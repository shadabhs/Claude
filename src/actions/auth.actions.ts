"use server";

import { redirect } from "next/navigation";
import { doctorRepo } from "@/repositories/doctor.repo";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const doctor = await doctorRepo.findByEmail(parsed.data.email);
  // Verify against the stored hash. Same generic error for unknown email or
  // wrong password so we don't reveal which accounts exist.
  const ok =
    doctor && (await verifyPassword(parsed.data.password, doctor.passwordHash));

  if (!doctor || !ok) {
    return { error: "Incorrect email or password" };
  }

  const token = await createSessionToken({
    doctorId: doctor.id,
    role: doctor.role,
    name: doctor.name,
  });
  await setSessionCookie(token);
  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
