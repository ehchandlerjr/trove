import { Card } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-[var(--color-bg-subtle)] rounded mt-2 animate-pulse" />
        </div>
        <div className="h-10 w-28 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
      </div>

      {/* List cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} padding="md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--color-bg-subtle)] rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
