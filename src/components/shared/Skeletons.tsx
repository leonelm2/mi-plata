export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800 p-6 h-44 w-full" />
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-2">
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 px-4 md:px-8 pt-6 pb-28 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-40 h-7 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
      <CardSkeleton />
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800/80 space-y-4">
        <TransactionSkeleton />
        <TransactionSkeleton />
        <TransactionSkeleton />
      </div>
    </div>
  );
}
