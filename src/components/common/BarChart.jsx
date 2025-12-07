import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-bold">
          ${payload[0].value.toLocaleString('es-AR')}
        </p>
      </div>
    );
  }
  return null;
};

// Colores para múltiples barras
const BAR_COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
];

const BarChart = ({ data, title, barColor = 'emerald', theme }) => {
  // Definir colores basados en el tema
  const isDark = theme === 'dark';
  
  const axisColor = isDark ? '#9ca3af' : '#4b5563'; // gray-400 : gray-600
  const gridColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 : gray-200
  
  // Don't render chart if no data - show empty state instead
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-[400px] flex flex-col items-center justify-center">
        {title && <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>}
        <p className="text-gray-500 dark:text-gray-400">No hay datos para mostrar</p>
      </div>
    );
  }

  // Calcular tamaño de barra dinámicamente basado en cantidad de datos
  const calculateBarSize = () => {
    const count = data.length;
    if (count <= 3) return 60;
    if (count <= 5) return 45;
    if (count <= 8) return 35;
    if (count <= 12) return 25;
    return 20;
  };

  // Truncar labels largos
  const truncateLabel = (label, maxLength = 15) => {
    if (!label) return '';
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 3) + '...';
  };

  // Calcular ángulo del label basado en cantidad de datos
  const getLabelAngle = () => {
    const count = data.length;
    if (count <= 4) return 0;
    if (count <= 6) return -25;
    return -45;
  };

  const angle = getLabelAngle();
  const barSize = calculateBarSize();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {title && <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h3>}
      <div className="w-full" style={{ height: data.length > 6 ? 350 : 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: angle < 0 ? 60 : 20,
            }}
            barSize={barSize}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={barColor === 'emerald' ? '#10b981' : '#3b82f6'} stopOpacity={1} />
                <stop offset="100%" stopColor={barColor === 'emerald' ? '#059669' : '#2563eb'} stopOpacity={1} />
              </linearGradient>
              <filter id="barShadow" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
                <feFlood floodColor="rgba(0,0,0,0.2)" result="colorBlur" />
                <feComposite in="colorBlur" in2="offsetBlur" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={gridColor}
            />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 11 }}
              angle={angle}
              textAnchor={angle < 0 ? 'end' : 'middle'}
              height={angle < 0 ? 80 : 40}
              interval={0}
              tickFormatter={(value) => truncateLabel(value)}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString('es-AR', { notation: 'compact' })}`}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'transparent' }}
            />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]}
              filter="url(#barShadow)"
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;
