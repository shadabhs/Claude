import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

// The single tenant choke-point. Every data-access path derives the acting
// doctor from here. Nothing is hardcoded to "the one doctor" — it returns
// whoever is logged in, so multi-doctor support is purely additive.
export type TenantContext = {
  doctorId: string;
  role: string;
  name: string;
};

/**
 * Returns the current tenant context, or redirects to /login if there is no
 * valid session. Use in server components and server actions for protected work.
 */
export async function requireTenant(): Promise<TenantContext> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return {
    doctorId: session.doctorId,
    role: session.role,
    name: session.name,
  };
}

/** Returns the tenant context or null (no redirect). */
export async function getTenant(): Promise<TenantContext | null> {
  const session = await getSession();
  if (!session) return null;
  return {
    doctorId: session.doctorId,
    role: session.role,
    name: session.name,
  };
}
