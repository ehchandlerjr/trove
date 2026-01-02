export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-4">
        {/* Animated gift icon */}
        <div className="relative">
          <div className="w-16 h-16 bg-[var(--color-accent-subtle)] rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-3xl">🎁</span>
          </div>
        </div>
        
        {/* Loading text */}
        <p className="text-[var(--color-text-secondary)] text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
}
