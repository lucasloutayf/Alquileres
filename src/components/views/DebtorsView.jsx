import React from 'react';
import StatCard from '../common/StatCard';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';

const DebtorsView = ({ tenants, payments, onBack }) => {
  const debtors = tenants.filter(t => {
    if (t.contractStatus !== 'activo') return false;
    const status = getTenantPaymentStatus(t, payments);
    return status.status === 'debt';
  }).map(t => ({ ...t, paymentStatus: getTenantPaymentStatus(t, payments) }))
    .sort((a,b) => b.paymentStatus.months - a.paymentStatus.months);

  const totalDebt = debtors.reduce((sum, t) => sum + (t.rentAmount * t.paymentStatus.months), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inquilinos con Deuda</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Total Deudores" 
          value={debtors.length} 
          icon="⚠️" 
          colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" 
        />
        <StatCard 
          title="Deuda Total Estimada" 
          value={`$${totalDebt.toLocaleString('es-AR')}`} 
          icon="💸" 
          colorClass="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800" 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Habitación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Meses Adeudados
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Deuda Estimada
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Último Pago
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {debtors.map(debtor => (
                <tr key={debtor.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
                    {debtor.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {debtor.phone}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {debtor.roomNumber}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">
                      {debtor.paymentStatus.months} mes(es)
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">
                    ${(debtor.rentAmount * debtor.paymentStatus.months).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {debtor.paymentStatus.lastPayment 
                      ? new Date(debtor.paymentStatus.lastPayment).toLocaleDateString('es-AR') 
                      : 'Nunca'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtorsView;
