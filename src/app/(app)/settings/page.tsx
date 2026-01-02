import { createClient } from '@/lib/db/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProfileForm } from '@/components/features/profile-form';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Profile } from '@/lib/db/database.types';
import type { Metadata } from 'next';
import { ThemeSettingsSection } from './theme-settings-section';

export const metadata: Metadata = {
  title: 'Settings | Trove',
  description: 'Manage your account and preferences',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = profileData as Profile | null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] font-display tracking-tight">
            Settings
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Appearance Section */}
        <ThemeSettingsSection />

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your display name and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm 
              profile={{
                id: user.id,
                email: user.email || '',
                display_name: profile?.display_name || null,
                avatar_url: profile?.avatar_url || null,
              }} 
            />
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  Email
                </label>
                <p className="text-[var(--color-text)]">{user.email}</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Contact support to change your email address
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-[var(--color-danger-bg)]">
          <CardHeader>
            <CardTitle className="text-[var(--color-danger)]">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text)]">Delete Account</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Permanently delete your account and all your data
                  </p>
                </div>
                <button className="px-4 py-2 text-sm text-[var(--color-danger)] border border-[var(--color-danger-bg)] rounded-lg hover:bg-[var(--color-danger-bg)] transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
