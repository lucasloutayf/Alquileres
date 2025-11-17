import React from 'react';

const StatCard = ({ title, value, icon, colorClass, subtitle, change }) => {
  const getColorClasses = () => {
    const colorMap = {
      green: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800',
      red: 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800',
      blue: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
      yellow: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
      purple: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
      orange: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
    };
    
    return colorMap[colorClass] || 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800';
  };

  return (
    <div className={`${getColorClasses()} rounded-xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-gray-700 dark:text-gray-300">
            {icon}
          </div>
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-md ${
            change > 0 
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900' 
              : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
