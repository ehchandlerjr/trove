import { Card } from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-32 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-[var(--color-bg-subtle)] rounded mt-2 animate-pulse" />
      </div>

      {/* Profile card skeleton */}
      <Card padding="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-full animate-pulse" />
            <div className="h-4 w-48 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <div className="h-4 w-24 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
            <div className="h-10 w-full bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
          </div>

          <div className="h-10 w-32 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
        </div>
      </Card>

      {/* Theme card skeleton */}
      <Card padding="lg">
        <div className="space-y-4">
          <div className="h-6 w-24 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[var(--color-bg-subtle)] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
