import { Card } from '@/components/ui/card';

export default function ListLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back link skeleton */}
      <div className="h-4 w-24 bg-[var(--color-bg-subtle)] rounded animate-pulse" />

      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[var(--color-bg-subtle)] rounded-2xl animate-pulse" />
          <div>
            <div className="h-7 w-48 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-[var(--color-bg-subtle)] rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-20 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
      </div>

      {/* Add item form skeleton */}
      <Card padding="md">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
          <div className="h-10 w-20 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
        </div>
      </Card>

      {/* Items skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} padding="sm">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
