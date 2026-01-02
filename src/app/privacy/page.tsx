import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Trove',
  description: 'How Trove handles your data',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)]/80 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-xl font-semibold text-[var(--color-text)] font-display">
            Trove
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <article className="prose prose-warm max-w-none">
          <h1 className="text-3xl font-semibold text-[var(--color-text)] font-display tracking-tight mb-8">
            Privacy Policy
          </h1>
          
          <p className="text-[var(--color-text-secondary)] mb-6">
            <em>Last updated: December 31, 2025</em>
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              What We Collect
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Trove collects the minimum information necessary to provide our service:
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-secondary)] space-y-2">
              <li><strong>Account information:</strong> Your email address and display name when you create an account.</li>
              <li><strong>Wishlist data:</strong> The lists and items you create, including titles, descriptions, prices, and links.</li>
              <li><strong>Usage data:</strong> Basic analytics to understand how the service is used (page views, feature usage).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              How We Use Your Data
            </h2>
            <ul className="list-disc pl-6 text-[var(--color-text-secondary)] space-y-2">
              <li>To provide and improve the Trove service</li>
              <li>To send you important account notifications</li>
              <li>To respond to your support requests</li>
            </ul>
            <p className="text-[var(--color-text-secondary)] mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Data Storage
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Your data is stored securely using Supabase, a database service with servers in the United States. 
              All data is encrypted in transit and at rest.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Sharing Lists
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              When you share a wishlist, anyone with the link can view the items you&apos;ve added. 
              They can also see your display name. Shared lists do not expose your email address.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Your Rights
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              You can:
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-secondary)] space-y-2">
              <li>Access your data at any time through your account</li>
              <li>Delete your lists and items whenever you choose</li>
              <li>Delete your account entirely (Settings → Danger Zone)</li>
              <li>Request a copy of your data by contacting us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Contact Us
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              If you have questions about this privacy policy or your data, please contact us at{' '}
              <a 
                href="mailto:privacy@trove.app" 
                className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                privacy@trove.app
              </a>
            </p>
          </section>
        </article>
      </main>

      <footer className="max-w-3xl mx-auto px-4 py-12 text-center border-t border-[var(--color-border)]">
        <p className="text-[var(--color-text-tertiary)] text-sm">
          © {new Date().getFullYear()} Trove. Made with care.
        </p>
      </footer>
    </div>
  );
}
