import { requireTenant } from "@/lib/tenant/context";
import { profileService } from "@/services/profile.service";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default async function SettingsPage() {
  const ctx = await requireTenant();
  const profile = await profileService.get(ctx);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Settings</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
