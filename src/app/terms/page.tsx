import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Trove',
  description: 'Terms and conditions for using Trove',
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          
          <p className="text-[var(--color-text-secondary)] mb-6">
            <em>Last updated: December 31, 2025</em>
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              By creating an account or using Trove, you agree to these terms. 
              If you don&apos;t agree, please don&apos;t use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              What Trove Is
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Trove is a wishlist management service that helps you create, organize, and share 
              lists of items you want. We do not sell products directly—we help you track items 
              from other websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Your Account
            </h2>
            <ul className="list-disc pl-6 text-[var(--color-text-secondary)] space-y-2">
              <li>You must provide accurate information when creating an account</li>
              <li>You&apos;re responsible for keeping your password secure</li>
              <li>You&apos;re responsible for all activity under your account</li>
              <li>You must be at least 13 years old to use Trove</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Your Content
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              You own the content you create on Trove (your lists, items, descriptions). 
              By using our service, you grant us permission to store and display this content 
              as needed to provide the service.
            </p>
            <p className="text-[var(--color-text-secondary)] mb-4">
              You agree not to use Trove for:
            </p>
            <ul className="list-disc pl-6 text-[var(--color-text-secondary)] space-y-2">
              <li>Illegal purposes</li>
              <li>Harassing or abusing others</li>
              <li>Uploading malicious content</li>
              <li>Attempting to access other users&apos; accounts</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Third-Party Links
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Wishlist items may link to external websites. We&apos;re not responsible for the 
              content, accuracy, or availability of these external sites. Prices and product 
              information may change without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Service Availability
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              We strive to keep Trove available, but we can&apos;t guarantee 100% uptime. 
              We may also modify or discontinue features with reasonable notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Limitation of Liability
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Trove is provided &ldquo;as is&rdquo; without warranties of any kind. We&apos;re not 
              liable for any damages arising from your use of the service, including but not 
              limited to lost data, duplicate gifts, or price changes on linked products.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Changes to Terms
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              We may update these terms occasionally. If we make significant changes, we&apos;ll 
              notify you via email or through the app. Continued use after changes means you 
              accept the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] font-display mb-4">
              Contact Us
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              Questions about these terms? Contact us at{' '}
              <a 
                href="mailto:support@trove.app" 
                className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                support@trove.app
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
