"use client";

export default function Loading() {
  return (
    <div className="pt-16 min-h-screen bg-paper dark:bg-ink-navy flex flex-col items-center justify-center p-6 space-y-12">
      {/* Skeletons block */}
      <div className="w-full max-w-4xl space-y-8 animate-pulse">
        
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-3.5 w-20 bg-line-gray-light dark:bg-line-gray-dark rounded" />
          <div className="h-7 w-64 bg-line-gray-light dark:bg-line-gray-dark rounded-lg" />
          <div className="h-3.5 w-96 bg-line-gray-light dark:bg-line-gray-dark rounded max-w-full" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 space-y-4">
              <div className="h-3.5 w-10 bg-line-gray-light dark:bg-line-gray-dark rounded" />
              <div className="h-5 w-40 bg-line-gray-light dark:bg-line-gray-dark rounded-lg" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-line-gray-light dark:bg-line-gray-dark rounded" />
                <div className="h-3 w-5/6 bg-line-gray-light dark:bg-line-gray-dark rounded" />
              </div>
              <div className="pt-3 border-t border-line-gray-light dark:border-line-gray-dark flex justify-between items-center">
                <div className="h-4 w-12 bg-line-gray-light dark:bg-line-gray-dark rounded" />
                <div className="h-4 w-16 bg-line-gray-light dark:bg-line-gray-dark rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
