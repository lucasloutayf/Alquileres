import React from 'react';
import StatCard3D from '../common/StatCard3D';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';
import { AlertTriangle, DollarSign, ArrowLeft } from 'lucide-react';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';
import Button from '../common/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../common/Table';

import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const DebtorsView = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenants, loading: tenantsLoading } = useTenants(user?.uid);
  const { payments, loading: paymentsLoading } = usePayments(user?.uid, { recent: true, days: 60 });

  const loading = tenantsLoading || paymentsLoading;

  const debtors = tenants.filter(t => {
    if (t.contractStatus !== 'activo') return false;
    const status = getTenantPaymentStatus(t, payments);
    return status.status === 'debt';
  }).map(t => ({ ...t, paymentStatus: getTenantPaymentStatus(t, payments) }))
    .sort((a,b) => b.paymentStatus.months - a.paymentStatus.months);

  const totalDebt = debtors.reduce((sum, t) => sum + (t.rentAmount * t.paymentStatus.months), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')} 
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">{t('debtors.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('debtors.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard3D 
          title={t('debtors.totalDebtors')} 
          value={debtors.length} 
          icon={<AlertTriangle />} 
          colorClass="red" 
        />
        <StatCard3D 
          title={t('debtors.totalDebt')} 
          value={`$${totalDebt.toLocaleString('es-AR')}`} 
          icon={<DollarSign />}
          colorClass="orange" 
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('debtors.listTitle')}</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-gray-500 dark:text-gray-400">{t('debtors.table.name')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('debtors.table.phone')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('debtors.table.room')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('debtors.table.monthsOwed')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('debtors.table.estimatedDebt')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('debtors.table.lastPayment')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debtors.length === 0 ? (
                <TableRow className="border-0">
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('debtors.table.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                debtors.map((debtor, index) => (
                  <TableRow key={debtor.id} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {debtor.name}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {debtor.phone}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {debtor.roomNumber}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                        {debtor.paymentStatus.months} {t('debtors.table.months')}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                      ${(debtor.rentAmount * debtor.paymentStatus.months).toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {debtor.paymentStatus.lastPayment 
                        ? new Date(debtor.paymentStatus.lastPayment).toLocaleDateString('es-AR') 
                        : t('debtors.table.never')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DebtorsView;
