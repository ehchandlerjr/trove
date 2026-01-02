import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Trove',
    default: 'Sign In | Trove',
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Subtle warm gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[var(--color-accent-subtle)] via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="relative p-6">
        <a href="/" className="inline-block">
          <h1 className="text-2xl font-semibold text-[var(--color-text)] font-display tracking-tight">
            Trove
          </h1>
        </a>
      </header>
      
      {/* Main content */}
      <main id="main-content" className="relative flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative p-6 text-center text-sm text-[var(--color-text-tertiary)]">
        © {new Date().getFullYear()} Trove. Made with care.
      </footer>
    </div>
  );
}
