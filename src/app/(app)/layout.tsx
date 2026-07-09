import { requireTenant } from "@/lib/tenant/context";
import { logoutAction } from "@/actions/auth.actions";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await requireTenant();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="safe-top sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            Rx
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">
              {tenant.name}
            </p>
            <p className="text-xs text-slate-500">Prescriptions</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <BottomNav />
    </div>
  );
}
