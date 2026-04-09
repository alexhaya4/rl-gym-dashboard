interface SkeletonTextProps {
  width?: string;
  className?: string;
}

export function SkeletonText({ width = 'w-full', className = '' }: SkeletonTextProps) {
  return (
    <div
      className={`h-4 rounded animate-pulse dark:bg-dark-border bg-light-border ${width} ${className}`}
    />
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border p-5 dark:bg-dark-card dark:border-dark-border bg-light-card border-light-border ${className}`}
    >
      <div className="space-y-3">
        <SkeletonText width="w-3/4" />
        <SkeletonText width="w-1/2" />
        <SkeletonText width="w-2/3" />
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="rounded-[var(--radius-card)] border dark:bg-dark-card dark:border-dark-border bg-light-card border-light-border overflow-hidden">
      <div className="border-b dark:border-dark-border border-light-border p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonText key={i} width="w-20" className="h-3" />
          ))}
        </div>
      </div>
      <div className="divide-y dark:divide-dark-border divide-light-border">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <SkeletonText key={colIdx} width={colIdx === 0 ? 'w-3/4' : 'w-1/2'} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText width="w-24" className="h-3" />
          <div className="h-10 rounded-[var(--radius-input)] animate-pulse dark:bg-dark-border bg-light-border" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonText width="w-48" className="h-6" />
        <SkeletonText width="w-64" className="h-3" />
      </div>
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}
