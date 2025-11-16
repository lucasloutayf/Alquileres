import React from 'react';
import StatCard from '../common/StatCard';

const VacantRoomsView = ({ properties, tenants, onBack }) => {
  const vacancyData = properties.map(prop => {
    const activeTenants = tenants.filter(t => t.propertyId === prop.id && t.contractStatus === 'activo');
    const vacant = prop.totalRooms - activeTenants.length;
    return { 
      property: prop, 
      vacant, 
      total: prop.totalRooms, 
      percentage: ((vacant / prop.totalRooms) * 100).toFixed(0) 
    };
  });

  const totalVacant = vacancyData.reduce((sum, v) => sum + v.vacant, 0);
  const totalRooms = vacancyData.reduce((sum, v) => sum + v.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Habitaciones Vacías</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Total Habitaciones Vacías" 
          value={totalVacant} 
          icon="🏠" 
          colorClass="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800" 
        />
        <StatCard 
          title="Ocupación General" 
          value={`${(((totalRooms - totalVacant) / totalRooms) * 100).toFixed(0)}%`} 
          icon="📊" 
          colorClass="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800" 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          {vacancyData.map(data => (
            <div key={data.property.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{data.property.address}</h3>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {data.vacant} / {data.total} vacías
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                  style={{width: `${100 - data.percentage}%`}}
                >
                  <span className="text-xs font-bold text-white">{100 - data.percentage}% ocupado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VacantRoomsView;
