import React, { useMemo } from 'react';
import StatCard from '../common/StatCard';
import BarChart from '../common/BarChart';
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { generateAnnualReport } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';
import { useTenants } from '../../hooks/useTenants';
import { useProperties } from '../../hooks/useProperties';
import { logger } from '../../utils/logger';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MonthlyIncomeView = ({ user, theme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { payments, loading: paymentsLoading } = usePayments(user?.uid);
  const { expenses, loading: expensesLoading } = useExpenses(user?.uid);
  const { tenants, loading: tenantsLoading } = useTenants(user?.uid);
  const { properties, loading: propertiesLoading } = useProperties(user?.uid);

  const loading = paymentsLoading || expensesLoading || tenantsLoading || propertiesLoading;

  const handleGenerateAnnualReport = () => {
    try {
      const currentYear = new Date().getFullYear();
      
      const monthlyData = [];
      for (let month = 0; month < 12; month++) {
        const monthName = new Date(currentYear, month, 1).toLocaleDateString('es-AR', { month: 'long' });
        
        const monthIncome = payments.filter(p => {
          const date = new Date(p.date);
          return date.getFullYear() === currentYear && date.getMonth() === month;
        }).reduce((sum, p) => sum + p.amount, 0);
        
        const monthExpenses = (expenses || []).filter(e => {
          const date = new Date(e.date);
          return date.getFullYear() === currentYear && date.getMonth() === month;
        }).reduce((sum, e) => sum + (e.amount || 0), 0);
        
        monthlyData.push({
          name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          income: monthIncome,
          expenses: monthExpenses,
          balance: monthIncome - monthExpenses
        });
      }
      
      const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
      const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
      
      const reportData = {
        year: currentYear,
        monthlyData,
        properties: properties || [],
        tenants: tenants || [],
        totalIncome,
        totalExpenses
      };
      
      const pdf = generateAnnualReport(reportData);
      pdf.save(`reporte-anual-${currentYear}.pdf`);
      
      toast.success(t('income.toastSuccess'));
    } catch (error) {
      logger.error('Error generando reporte:', error);
      toast.error('Error al generar reporte');
    }
  };

  const monthlyData = useMemo(() => {
    const grouped = {};
    payments.forEach(p => {
      const date = new Date(p.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + p.amount;
    });
    return Object.entries(grouped)
      .sort((a,b) => b[0].localeCompare(a[0]))
      .slice(0, 12)
      .map(([key, value]) => ({
        label: new Date(key + '-01').toLocaleDateString('es-AR', { year: 'numeric', month: 'long' }),
        value
      }));
  }, [payments]);

  const thisMonthIncome = monthlyData.length > 0 ? monthlyData[0].value : 0;
  const lastMonthIncome = monthlyData.length > 1 ? monthlyData[1].value : 0;
  const change = lastMonthIncome > 0 ? (((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span> {t('common.back')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('income.title')}</h1>
        <button
          onClick={handleGenerateAnnualReport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          <span>{t('income.annualReport')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title={t('income.thisMonth')} 
          value={`$${thisMonthIncome.toLocaleString('es-AR')}`} 
          icon={<DollarSign className="w-6 h-6" />}
          colorClass="green" 
        />
        <StatCard 
          title={t('income.variation')} 
          value={`${change > 0 ? '+' : ''}${change}%`} 
          icon={change >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          colorClass={change >= 0 ? "blue" : "red"} 
        />
      </div>

      <BarChart data={monthlyData} title={t('income.history')} theme={theme} />
    </div>
  );
};

export default MonthlyIncomeView;
