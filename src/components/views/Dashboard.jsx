import React, { useMemo } from 'react';
import StatCard from '../common/StatCard';
import BarChart from '../common/BarChart';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';

const Dashboard = ({ properties, tenants, payments, expenses, onSelectProperty }) => {
  const totalIncome = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    return payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
    }).reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const totalExpenses = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    }).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const activeTenants = tenants.filter(t => t.contractStatus === 'activo').length;
  
  const debtors = tenants.filter(t => {
    if (t.contractStatus !== 'activo') return false;
    const status = getTenantPaymentStatus(t, payments);
    return status.status === 'debt';
  }).length;

  const incomeByProperty = properties.map(prop => ({
    label: prop.address,
    value: tenants.filter(t => t.propertyId === prop.id && t.contractStatus === 'activo')
      .reduce((sum, t) => sum + t.rentAmount, 0)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos generados este mes" 
          value={`$${totalIncome.toLocaleString('es-AR')}`} 
          icon="💰" 
          colorClass="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800" 
        />
        <StatCard 
          title="Gastos Mensuales" 
          value={`$${totalExpenses.toLocaleString('es-AR')}`} 
          icon="📉" 
          colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" 
        />
        <StatCard 
          title="Inquilinos Activos" 
          value={activeTenants} 
          icon="👥" 
          colorClass="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800" 
        />
        <StatCard 
          title="Deudores" 
          value={debtors} 
          icon="⚠️" 
          colorClass="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800" 
        />
      </div>

      <BarChart data={incomeByProperty} title="Ingresos Potenciales por Propiedad" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Propiedades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(prop => {
            const propTenants = tenants.filter(t => t.propertyId === prop.id && t.contractStatus === 'activo');
            const occupiedRooms = propTenants.length;
            const occupancyRate = ((occupiedRooms / prop.totalRooms) * 100).toFixed(0);
            
            return (
              <div 
                key={prop.id} 
                onClick={() => onSelectProperty(prop.id)} 
                className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 p-6 rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{prop.address}</h3>
                <p className="text-gray-700 dark:text-gray-300">Habitaciones: {occupiedRooms}/{prop.totalRooms}</p>
                <div className="mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ocupación</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-500" 
                      style={{width: `${occupancyRate}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
