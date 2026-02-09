import { useMemo } from 'react';
import { getTenantPaymentStatus } from '../utils/paymentUtils';

/**
 * Hook para calcular estadísticas del dashboard.
 * Extrae la lógica de cálculo del componente Dashboard para mejor mantenibilidad.
 * 
 * @param {Object} params - Parámetros del hook
 * @param {Array} params.tenants - Lista de inquilinos
 * @param {Array} params.payments - Pagos del mes actual
 * @param {Array} params.allPayments - Todos los pagos (para cálculo de deudores)
 * @param {Array} params.expenses - Gastos del mes actual
 * @param {Array} params.properties - Lista de propiedades
 * @returns {Object} Estadísticas calculadas
 */
export const useDashboardStats = ({ 
  tenants = [], 
  payments = [], 
  allPayments = [], 
  expenses = [],
  properties = []
}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Inquilinos activos
  const activeTenants = useMemo(() => {
    return tenants.filter(t => t.contractStatus === 'activo').length;
  }, [tenants]);
  
  // Deudores (inquilinos activos con pagos pendientes)
  const debtors = useMemo(() => {
    return tenants.filter(t => {
      if (t.contractStatus !== 'activo') return false;
      const status = getTenantPaymentStatus(t, allPayments);
      return status.status === 'debt';
    }).length;
  }, [tenants, allPayments]);

  // Ingresos del mes actual
  const totalIncome = useMemo(() => {
    return payments
      .filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, currentMonth, currentYear]);

  // Gastos del mes actual
  const totalExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonth, currentYear]);

  // Ingresos por propiedad (para gráfico de barras)
  const incomeByProperty = useMemo(() => {
    return properties.map(prop => {
      const propTenants = tenants.filter(t => t.propertyId === prop.id);
      const propIncome = payments
        .filter(p => {
          const tenant = propTenants.find(t => t.id === p.tenantId);
          const pDate = new Date(p.date);
          return tenant && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      return { label: prop.address, value: propIncome };
    }).sort((a, b) => b.value - a.value);
  }, [properties, tenants, payments, currentMonth, currentYear]);

  // Balance neto
  const netBalance = totalIncome - totalExpenses;

  return {
    activeTenants,
    debtors,
    totalIncome,
    totalExpenses,
    incomeByProperty,
    netBalance,
    currentMonth,
    currentYear
  };
};

export default useDashboardStats;
