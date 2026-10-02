type AdminTableSkeletonProps = {
  columns?: number;
  rows?: number;
};

export function AdminTableSkeleton({ columns = 5, rows = 5 }: AdminTableSkeletonProps) {
  return (
    <div className="mt-8" role="status" aria-label="Carregando dados">
      <div className="hidden gap-5 px-6 py-4 md:grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: columns }, (_, index) => <div key={index} className="skeleton-shimmer h-3 w-2/3 rounded" />)}
      </div>
      <div className="space-y-1" aria-hidden="true">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex min-h-20 flex-col gap-4 px-5 py-5 md:grid md:items-center md:px-6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, column) => (
              <div key={column} className={`skeleton-shimmer h-4 rounded ${column === 0 ? "w-4/5" : column === columns - 1 ? "w-10 md:ml-auto" : "w-2/3"}`} />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando dados...</span>
    </div>
  );
}

export function AdminFormSkeleton() {
  return (
    <div className="mt-8 space-y-6 p-6 sm:p-8" role="status" aria-label="Carregando formulário">
      <div className="grid gap-5 sm:grid-cols-2" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={index === 4 ? "sm:col-span-2" : ""}>
            <div className="skeleton-shimmer h-4 w-28 rounded" />
            <div className={`skeleton-shimmer mt-3 w-full rounded-xl ${index === 4 ? "h-32" : "h-12"}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-6" aria-hidden="true">
        <div className="skeleton-shimmer h-12 w-24 rounded-xl" />
        <div className="skeleton-shimmer h-12 w-36 rounded-xl" />
      </div>
      <span className="sr-only">Carregando formulário...</span>
    </div>
  );
}

export function AdminDetailsSkeleton({ withMap = false }: { withMap?: boolean }) {
  return (
    <div role="status" aria-label="Carregando detalhes">
      <div className="mt-8 p-6" aria-hidden="true">
        <div className="skeleton-shimmer h-7 w-2/5 rounded-md" />
        <div className="skeleton-shimmer mt-3 h-4 w-1/3 rounded" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index}>
              <div className="skeleton-shimmer h-3 w-20 rounded" />
              <div className="skeleton-shimmer mt-3 h-5 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 p-6" aria-hidden="true">
        <div className="skeleton-shimmer h-6 w-48 rounded-md" />
        {withMap ? (
          <>
            <div className="skeleton-shimmer mx-auto mt-10 h-8 max-w-2xl rounded-[50%]" />
            <div className="mx-auto mt-8 max-w-3xl space-y-2">
              {Array.from({ length: 7 }, (_, row) => <div key={row} className="skeleton-shimmer mx-auto h-7 rounded-md" style={{ width: `${72 + (row % 3) * 8}%` }} />)}
            </div>
          </>
        ) : (
          <div className="mt-6 space-y-1">
            {Array.from({ length: 4 }, (_, row) => <div key={row} className="skeleton-shimmer h-16 w-full rounded-md" />)}
          </div>
        )}
      </div>
      <span className="sr-only">Carregando detalhes...</span>
    </div>
  );
}
