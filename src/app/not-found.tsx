import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="text-center max-w-md space-y-6">
        {/* Decorative element */}
        <div className="w-20 h-20 mx-auto bg-[var(--color-accent-subtle)] rounded-2xl flex items-center justify-center">
          <span className="text-4xl">🎁</span>
        </div>
        
        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl text-[var(--color-text)] tracking-tight">
            Page not found
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
            The page you&apos;re looking for has been moved, deleted, or never existed in the first place.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/dashboard">
            <Button>
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Subtle footer */}
      <p className="absolute bottom-8 text-sm text-[var(--color-text-muted)]">
        Error 404
      </p>
    </div>
  );
}
