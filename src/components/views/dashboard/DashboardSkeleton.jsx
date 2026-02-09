import React from 'react';

/**
 * Componente skeleton de carga para el Dashboard.
 */
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Properties Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
