import React from 'react';
import { TrendingDown } from 'lucide-react';
import RevenueTrendChart from '../../charts/RevenueTrendChart';
import ExpenseCatChart from '../../charts/ExpenseCatChart';
import OccupancyChart from '../../charts/OccupancyChart';
import BarChart from '../../common/BarChart';
import { useTranslation } from 'react-i18next';

/**
 * Sección de analytics con gráficos.
 */
const AnalyticsSection = ({ 
  payments, 
  expenses, 
  properties, 
  tenants,
  incomeByProperty,
  theme 
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <TrendingDown className="w-5 h-5 text-gray-500" />
        {t('dashboard.analytics')}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart 
          payments={payments} 
          expenses={expenses} 
          theme={theme} 
        />
        <OccupancyChart 
          properties={properties} 
          tenants={tenants} 
          theme={theme} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-full">
          <ExpenseCatChart 
            expenses={expenses} 
            theme={theme} 
          />
        </div>
        <div className="h-full">
          {incomeByProperty.length > 0 ? (
            <BarChart 
              data={incomeByProperty} 
              title={t('dashboard.topIncome')} 
              theme={theme}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('dashboard.noData')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
