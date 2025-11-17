import React from 'react';

const BarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ${item.value.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
              <div 
                className="bg-emerald-600 dark:bg-emerald-500 h-3 rounded-full transition-all duration-500 hover:bg-emerald-700 dark:hover:bg-emerald-600" 
                style={{width: `${(item.value/maxValue)*100}%`}}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
