'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { createClient } from '@/lib/db/client';
import { updateProfileSchema } from '@/lib/core/schemas';
import { validateForm, type FieldErrors } from '@/lib/utils/validation';
import { Check } from 'lucide-react';
import type { Updatable, Database } from '@/lib/db/database.types';

interface ProfileFormProps {
  profile: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);

    // Validate with Zod schema
    const validation = validateForm(updateProfileSchema, {
      displayName: displayName.trim() || undefined,
    });
    if (!validation.success) {
      setFieldErrors(validation.errors || {});
      setSaving(false);
      return;
    }

    const supabase = createClient();
    
    const updateData: Updatable<'profiles'> = {
      display_name: validation.data!.displayName || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types require generated types; manual types need cast
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData as never)
      .eq('id', profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
    router.refresh();
    
    // Hide success message after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const hasChanges = displayName !== (profile.display_name || '');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar 
          src={profile.avatar_url} 
          name={displayName || profile.email} 
          size="xl" 
        />
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Profile picture is synced from your login provider
          </p>
        </div>
      </div>

      {/* Display Name */}
      <Input
        label="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
        error={fieldErrors.displayName}
      />

      {error && (
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <Button 
          type="submit" 
          disabled={saving || !hasChanges}
          loading={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--color-success)]">
            <Check className="h-4 w-4" />
            Saved!
          </span>
        )}
      </div>
    </form>
  );
}
