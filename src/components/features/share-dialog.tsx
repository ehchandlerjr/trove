'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Share2, Copy, Check, X } from 'lucide-react';

interface ShareDialogProps {
  shareCode: string;
  listTitle: string;
}

export function ShareDialog({ shareCode, listTitle }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${shareCode}`
    : `/share/${shareCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listTitle,
          text: `Check out my wishlist: ${listTitle}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dialog */}
          <Card 
            className="relative z-10 w-full max-w-md" 
            padding="lg"
            role="dialog"
            aria-labelledby="share-dialog-title"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="share-dialog-title" className="text-lg font-semibold text-[var(--color-text)]">
                Share this list
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            <p className="text-[var(--color-text-secondary)] text-sm mb-4">
              Anyone with this link can view your wishlist and claim items.
            </p>

            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 bg-[var(--color-bg-subtle)]"
                aria-label="Share URL"
              />
              <Button onClick={handleCopy} variant="secondary" aria-label={copied ? "Copied" : "Copy link"}>
                {copied ? (
                  <Check className="h-4 w-4 text-[var(--color-success)]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {copied && (
              <p className="text-sm text-[var(--color-success)] mt-2">
                Link copied to clipboard!
              </p>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
