export default function AppSegmentLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-24 animate-pulse rounded-xl border border-line bg-surface" />
      <div className="h-72 animate-pulse rounded-xl border border-line bg-surface" />
    </div>
  );
}
