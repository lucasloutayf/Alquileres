import React, { useMemo } from 'react';
import { Reorder } from 'framer-motion';
import { DollarSign, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import StatCard3D from '../../common/StatCard3D';
import { useTranslation } from 'react-i18next';

/**
 * Sección de tarjetas de estadísticas draggables.
 */
const DashboardStats = ({ 
  statsOrder, 
  setStatsOrder, 
  totalIncome,
  totalExpenses,
  activeTenants,
  debtors,
  isDesktop
}) => {
  const { t } = useTranslation();

  const statsComponents = useMemo(() => ({
    income: (
      <StatCard3D 
        key="income"
        title={t('stats.income')} 
        value={`$${totalIncome.toLocaleString('es-AR')}`} 
        icon={<DollarSign />}
        colorClass="green"
        trend={12}
      />
    ),
    expenses: (
      <StatCard3D 
        key="expenses"
        title={t('stats.expenses')} 
        value={`$${totalExpenses.toLocaleString('es-AR')}`} 
        icon={<TrendingDown />}
        colorClass="red"
        trend={-5}
      />
    ),
    tenants: (
      <StatCard3D 
        key="tenants"
        title={t('stats.tenants')} 
        value={activeTenants} 
        icon={<Users />}
        colorClass="blue"
      />
    ),
    debtors: (
      <StatCard3D 
        key="debtors"
        title={t('stats.debtors')} 
        value={debtors} 
        icon={<AlertTriangle />}
        colorClass="yellow"
      />
    )
  }), [totalIncome, totalExpenses, activeTenants, debtors, t]);

  return (
    <div>
      <Reorder.Group 
        axis={isDesktop ? "x" : "y"} 
        values={statsOrder} 
        onReorder={setStatsOrder} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsOrder.map(key => (
          <Reorder.Item key={key} value={key} as="div" className="cursor-grab active:cursor-grabbing">
            {statsComponents[key]}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default DashboardStats;
