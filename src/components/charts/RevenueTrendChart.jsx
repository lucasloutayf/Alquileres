import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';

const RevenueTrendChart = ({ payments, expenses, theme }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
  const tooltipText = isDark ? '#f3f4f6' : '#111827';

  // Procesar datos de últimos 12 meses
  const data = React.useMemo(() => {
    const months = [];
    const today = new Date();
    
    // Generar últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        date: d,
        name: d.toLocaleDateString('es-AR', { month: 'short' }),
        fullDate: d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
        ingresos: 0,
        gastos: 0
      });
    }

    // Llenar ingresos
    payments.forEach(p => {
      const pDate = new Date(p.date);
      const monthData = months.find(m => 
        m.date.getMonth() === pDate.getMonth() && 
        m.date.getFullYear() === pDate.getFullYear()
      );
      if (monthData) {
        monthData.ingresos += p.amount;
      }
    });

    // Llenar gastos
    expenses.forEach(e => {
      const eDate = new Date(e.date);
      const monthData = months.find(m => 
        m.date.getMonth() === eDate.getMonth() && 
        m.date.getFullYear() === eDate.getFullYear()
      );
      if (monthData) {
        monthData.gastos += e.amount;
      }
    });

    return months;
  }, [payments, expenses]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('dashboard.revenueTrend')}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: textColor, fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: textColor, fontSize: 12 }} 
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderColor: tooltipBorder, 
                borderRadius: '8px',
                color: tooltipText 
              }}
              formatter={(value) => [`$${value.toLocaleString('es-AR')}`, undefined]}
              labelFormatter={(label, item) => item[0]?.payload?.fullDate || label}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area 
              type="monotone" 
              dataKey="ingresos" 
              name={t('stats.income')}
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorIngresos)" 
            />
            <Area 
              type="monotone" 
              dataKey="gastos" 
              name={t('stats.expenses')}
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorGastos)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
