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

      const reportData = {
        month: currentMonth,
        year: currentYear,
        income: incomeData,
        expenses: expensesMonth,
        tenants: tenantsActive,
        properties,
        debtors: debtorsList
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
