import { redirect } from 'next/navigation';
import { createClient } from '@/lib/db/server';
import { AppHeader } from '@/components/features/app-header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Subtle warm gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[var(--color-accent-subtle)] via-transparent to-transparent pointer-events-none opacity-50" />
      
      <AppHeader user={profile || { id: user.id, email: user.email || '', display_name: null, avatar_url: null }} />
      <main id="main-content" className="relative max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
