import React from 'react';

export function SkeletonLine({ width = '100%', className = '' }) {
  return <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} style={{ width }} />;
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-3">
      <SkeletonLine width="40%" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={`${60 + Math.random() * 30}%`} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
      <div className="space-y-3">
        <div className="flex gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonLine key={i} width={`${60 / cols}%`} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 py-2">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonLine key={c} width={`${60 / cols}%`} className="h-3" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-2">
          <SkeletonLine width="60%" className="h-3" />
          <SkeletonLine width="40%" className="h-8" />
        </div>
      ))}
    </div>
  );
}
