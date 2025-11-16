import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'bg-white dark:bg-gray-800', subtitle }) => (
  <div className={`shadow-lg rounded-lg p-6 ${colorClass} transition-transform duration-300 hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
);

export default StatCard;
