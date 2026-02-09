import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';

const OccupancyChart = ({ properties, tenants, theme }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
  const tooltipText = isDark ? '#f3f4f6' : '#111827';

  const data = React.useMemo(() => {
    return properties.map(prop => {
      const activeTenants = tenants.filter(t => 
        t.propertyId === prop.id && t.contractStatus === 'activo'
      ).length;
      const totalRooms = prop.totalRooms || 1;
      const vacant = Math.max(0, totalRooms - activeTenants);

      return {
        name: prop.address.split(',')[0], // Usar solo primera parte de dirección
        ocupada: activeTenants,
        vacante: vacant,
        total: totalRooms
      };
    }).sort((a, b) => b.total - a.total).slice(0, 10); // Top 10 propiedades más grandes
  }, [properties, tenants]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('dashboard.occupancy')}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: textColor, fontSize: 12 }} 
              width={100}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderColor: tooltipBorder, 
                borderRadius: '8px',
                color: tooltipText 
              }}
              cursor={{ fill: isDark ? '#374151' : '#f3f4f6' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="ocupada" name="Ocupadas" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="vacante" name="Vacantes" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OccupancyChart;
