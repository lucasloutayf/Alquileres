import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const ExpenseCatChart = ({ expenses, theme }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
  const tooltipText = isDark ? '#f3f4f6' : '#111827';

  // Agrupar gastos por categoría
  const data = React.useMemo(() => {
    const categories = {};
    expenses.forEach(e => {
      const cat = e.category || 'Otros';
      categories[cat] = (categories[cat] || 0) + e.amount;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('dashboard.expenseCategory')}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No hay gastos registrados para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('dashboard.expenseCategory')}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDark ? '#1f2937' : '#fff'} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                borderColor: tooltipBorder, 
                borderRadius: '8px',
                color: tooltipText 
              }}
              formatter={(value) => [`$${value.toLocaleString('es-AR')}`, 'Monto']}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseCatChart;
