'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <Card className="max-w-md w-full text-center p-8">
        {/* Decorative element */}
        <div className="w-16 h-16 mx-auto bg-[var(--color-danger-bg)] rounded-2xl flex items-center justify-center mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        
        {/* Heading */}
        <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">
          Something went wrong
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          An unexpected error occurred. Your data is safe—the application integrity has been preserved.
        </p>
        
        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-xs text-[var(--color-text-muted)] mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
      
      {/* Subtle footer */}
      <p className="mt-8 text-sm text-[var(--color-text-muted)]">
        If this keeps happening, please contact support.
      </p>
    </div>
  );
}
