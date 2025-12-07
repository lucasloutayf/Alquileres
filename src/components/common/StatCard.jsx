import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, icon, colorClass, subtitle, change }) => {
  const getColorClasses = () => {
    const colorMap = {
      green: 'bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800/50',
      red: 'bg-white dark:bg-gray-800 border-rose-200 dark:border-rose-800/50',
      blue: 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800/50',
      yellow: 'bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-800/50',
      purple: 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800/50',
      orange: 'bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800/50',
    };
    
    return colorMap[colorClass] || 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  return (
    <Card 
      hover3d 
      className={cn(
        "transition-all duration-300",
        getColorClasses()
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <div className="text-gray-900 dark:text-white">
              {icon}
            </div>
          </div>
          {change && (
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full border",
              change > 0 
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' 
                : 'text-rose-700 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800'
            )}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
        
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-display">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
