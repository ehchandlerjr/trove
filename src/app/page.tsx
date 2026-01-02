import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TroveIcon, TroveText } from '@/components/ui/logo';
import { createClient } from '@/lib/db/server';
import { Gift, Share2, Heart, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Subtle warm gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[var(--color-accent-subtle)] via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="relative max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-text)]">
          <TroveIcon size="md" />
          <TroveText className="text-2xl" />
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button>My Lists</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--color-text)] mb-6 leading-[1.1] font-display tracking-tight">
            Remember what{' '}
            <span className="text-[var(--color-accent)]">they love</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            A place to keep track of what the people in your life would love. 
            Share your own list when they ask. Never forget the perfect gift.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start your trove
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 sm:mt-32 grid gap-6 sm:gap-8 md:grid-cols-3">
          <Card className="text-center">
            <div className="w-12 h-12 bg-[var(--color-accent-subtle)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Gift className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-text)] mb-2 text-lg font-display">
              Save from anywhere
            </h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Found something perfect while browsing? Add it to your trove. Works with any store, any website.
            </p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-[var(--color-accent-subtle)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-text)] mb-2 text-lg font-display">
              Share one link
            </h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              When someone asks what you want, send them your list. They see options; you get surprises.
            </p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-[var(--color-accent-subtle)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-text)] mb-2 text-lg font-display">
              No duplicates, no spoilers
            </h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Gift-givers claim items quietly. They coordinate; you stay surprised. Everyone&apos;s happy.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-24 sm:mt-32 text-center">
          <Card className="inline-block max-w-xl mx-auto">
            <h3 className="text-2xl font-semibold text-[var(--color-text)] mb-4 font-display tracking-tight">
              Start collecting
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              Your trove is free. Make your first list in under a minute.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Create your trove
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Link 
            href="/privacy" 
            className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            Privacy
          </Link>
          <span className="text-[var(--color-text-muted)]">·</span>
          <Link 
            href="/terms" 
            className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            Terms
          </Link>
        </div>
        <p className="text-[var(--color-text-tertiary)] text-sm">
          © {new Date().getFullYear()} Trove
        </p>
      </footer>
    </div>
  );
}
