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
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {title && <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h3>}
      <div className="w-full" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
            barSize={40}
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
              tick={{ fill: axisColor, fontSize: 12 }}
              dy={10}
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
              fill="url(#barGradient)" 
              radius={[6, 6, 0, 0]}
              filter="url(#barShadow)"
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;
