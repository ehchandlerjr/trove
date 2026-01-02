'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/db/client';
import { Gift, Check, X } from 'lucide-react';
import type { Insertable, Database } from '@/lib/db/database.types';

interface ClaimButtonProps {
  itemId: string;
  itemTitle: string;
}

export function ClaimButton({ itemId, itemTitle }: ClaimButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClaim = async () => {
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to claim items');
        return;
      }

      const insertData: Insertable<'claims'> = {
        item_id: itemId,
        claimer_id: user.id,
        quantity: 1,
        is_anonymous: true,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types require generated types; manual types need cast
      const { error: claimError } = await supabase
        .from('claims')
        .insert(insertData as never);

      if (claimError) {
        if (claimError.code === '23505') {
          toast.error('You already claimed this item');
        } else {
          toast.error(claimError.message);
        }
        return;
      }

      toast.success(`Claimed "${itemTitle}"`);
      router.refresh();
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <Button 
          onClick={handleClaim} 
          loading={loading}
          size="sm"
          variant="primary"
          aria-label="Confirm claim"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => setShowConfirm(false)} 
          size="sm"
          variant="ghost"
          disabled={loading}
          aria-label="Cancel claim"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => setShowConfirm(true)} 
      size="sm"
    >
      <Gift className="h-4 w-4" />
      Claim
    </Button>
  );
}
