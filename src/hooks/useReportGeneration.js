import { useCallback } from 'react';
import { getTenantPaymentStatus } from '../utils/paymentUtils';
import { generateMonthlyReport } from '../utils/pdfGenerator';
import { exportMonthlyReport } from '../utils/exportUtils';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';

/**
 * Hook para generación de reportes (PDF y Excel).
 * Extrae la lógica de generación del componente Dashboard.
 * 
 * @param {Object} params - Datos necesarios para los reportes
 * @returns {Object} Funciones para generar reportes
 */
export const useReportGeneration = ({ 
  payments = [], 
  expenses = [], 
  tenants = [], 
  allPayments = [],
  properties = [],
  currentMonth,
  currentYear
}) => {
  /**
   * Genera y descarga el reporte mensual en PDF.
   */
  const handleGenerateMonthlyReport = useCallback(() => {
    try {
      // Filtrar pagos del mes actual
      const incomeData = payments.filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      });

      // Filtrar gastos del mes actual
      const expensesMonth = expenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
      });

      // Inquilinos activos
      const tenantsActive = tenants.filter(t => t.contractStatus === 'activo');

      // Lista de deudores con su estado de pago
      const debtorsList = tenantsActive.filter(t => {
        const status = getTenantPaymentStatus(t, allPayments);
        return status.status === 'debt';
      }).map(t => ({
        ...t,
        paymentStatus: getTenantPaymentStatus(t, allPayments)
      }));

      // Inquilinos que pagaron este mes
      const tenantsPaidIds = new Set(incomeData.map(p => p.tenantId));

      // Inquilinos al día que NO pagaron este mes (pagaron adelantado)
      // Son activos, NO están en deudores y NO están en los pagos del mes
      const upToDateTenants = tenantsActive.filter(t => {
        const isDebtor = debtorsList.some(d => d.id === t.id);
        const paidThisMonth = tenantsPaidIds.has(t.id);
        return !isDebtor && !paidThisMonth;
      });

      const reportData = {
        month: currentMonth,
        year: currentYear,
        income: incomeData,
        expenses: expensesMonth,
        tenants: tenantsActive,
        properties,
        debtors: debtorsList,
        upToDateTenants // Nueva lista
      };

      const pdf = generateMonthlyReport(reportData);
      const monthName = new Date(currentYear, currentMonth).toLocaleDateString('es-AR', { 
        month: 'long', 
        year: 'numeric' 
      });
      pdf.save(`reporte-mensual-${monthName.replace(/\s+/g, '-')}.pdf`);
      toast.success('Reporte descargado correctamente');
    } catch (error) {
      logger.error('Error generando reporte:', error);
      toast.error('Error al generar reporte');
    }
  }, [payments, expenses, tenants, allPayments, properties, currentMonth, currentYear]);

  /**
   * Exporta el reporte mensual a Excel.
   */
  const handleExportToExcel = useCallback(() => {
    try {
      const paymentsMonth = payments.filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      });

      const expensesMonth = expenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
      });

      exportMonthlyReport({
        payments: paymentsMonth,
        expenses: expensesMonth,
        tenants,
        properties,
        month: currentMonth,
        year: currentYear
      });
      
      toast.success('Excel exportado correctamente');
    } catch (error) {
      logger.error('Error exportando a Excel:', error);
      toast.error('Error al exportar a Excel');
    }
  }, [payments, expenses, tenants, properties, currentMonth, currentYear]);

  return {
    handleGenerateMonthlyReport,
    handleExportToExcel
  };
};

export default useReportGeneration;
