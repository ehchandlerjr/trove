import { LogoShowcase } from '@/components/brand/logo-options';
import { ChestShowcase } from '@/components/brand/treasure-chests';
import { TroveLogo, TroveIcon } from '@/components/ui/logo';

/**
 * Logo Options Page
 * Compare different logo concepts aligned with Thomistic beauty principles
 */
export default function LogoPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Treasure Chest Logos - NEW */}
      <section className="border-b border-[var(--color-border)]">
        <ChestShowcase />
      </section>
      
      {/* Current Gem Logo */}
      <section className="p-8 border-b border-[var(--color-border)]">
        <h2 className="text-2xl font-display font-semibold text-[var(--color-text)] mb-6">
          Alternative: Gem Mark
        </h2>
        <div className="bg-[var(--color-surface)] p-8 rounded-lg border border-[var(--color-border)] inline-block">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <TroveLogo size="xl" />
            </div>
            <div className="flex items-center gap-4 text-[var(--color-accent)]">
              <TroveLogo size="xl" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-8">
          <div className="text-center">
            <TroveIcon size="sm" className="text-[var(--color-text)] mx-auto" />
            <span className="text-xs text-[var(--color-text-muted)] mt-2 block">sm</span>
          </div>
          <div className="text-center">
            <TroveIcon size="md" className="text-[var(--color-text)] mx-auto" />
            <span className="text-xs text-[var(--color-text-muted)] mt-2 block">md</span>
          </div>
          <div className="text-center">
            <TroveIcon size="lg" className="text-[var(--color-text)] mx-auto" />
            <span className="text-xs text-[var(--color-text-muted)] mt-2 block">lg</span>
          </div>
          <div className="text-center">
            <TroveIcon size="xl" className="text-[var(--color-text)] mx-auto" />
            <span className="text-xs text-[var(--color-text-muted)] mt-2 block">xl</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--color-text-secondary)] max-w-xl">
          A classic cut diamond silhouette. Simple, recognizable, 
          works at any size. The gem metaphor suggests "discovered treasure."
        </p>
      </section>

      {/* Other Logo Options */}
      <section>
        <LogoShowcase />
      </section>
      
      {/* Design Principles */}
      <section className="p-8 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <h2 className="text-2xl font-display font-semibold text-[var(--color-text)] mb-4">
          Thomistic Design Principles Applied
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-2">Integritas (Wholeness)</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Each logo is a complete, self-contained form. No extraneous elements—every line 
              serves the whole. The chest/gem is recognizable whether at 16px or 160px.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-2">Consonantia (Harmony)</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Each theme's chest has distinct proportions matching its world. The Tau keyhole 
              serves dual purpose: "T for Trove" and subtle Franciscan symbolism.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-2">Claritas (Radiance)</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              The logo should feel luminous, not heavy. Each chest design captures 
              the essence of its theme—from Vatican warmth to Nordic clarity to cathedral forest.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
