import { useMemo } from 'react';
import { getTenantPaymentStatus } from '../utils/paymentUtils';

/**
 * Hook para calcular notificaciones de vencimiento de pagos
 * @param {Array} tenants - Lista de inquilinos
 * @param {Array} payments - Lista de pagos
 * @returns {Object} - Notificaciones organizadas por tipo
 */
export const useNotifications = (tenants, payments) => {
  const notifications = useMemo(() => {
    if (!tenants || !payments) {
      return { overdue: [], upcoming: [], total: 0, overdueCount: 0 };
    }

    const activeTenants = tenants.filter(t => t.contractStatus === 'activo');
    const overdue = [];
    const upcoming = [];

    activeTenants.forEach(tenant => {
      const status = getTenantPaymentStatus(tenant, payments);
      
      // Calcular próximo vencimiento basándose en el dueDate del último pago
      const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
      let nextDueDate = null;
      let daysPending = 0;
      
      if (tenantPayments.length > 0) {
        // Ordenar por dueDate (más reciente primero)
        const sortedByDueDate = [...tenantPayments].sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.date);
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.date);
          return dateB - dateA;
        });
        
        const lastPayment = sortedByDueDate[0];
        
        // Usar directamente el dueDate del último pago
        if (lastPayment.dueDate) {
          nextDueDate = new Date(lastPayment.dueDate);
        } else {
          // Fallback: usar fecha del pago
          nextDueDate = new Date(lastPayment.date);
        }
      } else {
        // Sin pagos: el primer vencimiento es 30 días después de la entrada
        nextDueDate = new Date(tenant.entryDate);
        nextDueDate.setDate(nextDueDate.getDate() + 30);
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      nextDueDate.setHours(0, 0, 0, 0);
      
      daysPending = Math.floor((today - nextDueDate) / (1000 * 60 * 60 * 24));
      
      if (status.status === 'debt') {
        // Tiene deuda
        overdue.push({
          id: tenant.id,
          type: 'overdue',
          tenantName: tenant.name,
          roomNumber: tenant.roomNumber,
          propertyId: tenant.propertyId,
          daysPending: Math.abs(daysPending), // Días de atraso
          monthsPending: status.months,
          amount: tenant.rentAmount,
          message: `${tenant.name} tiene ${status.months} mes(es) de atraso`,
          severity: status.months >= 3 ? 'critical' : status.months >= 2 ? 'high' : 'medium'
        });
      } else if (status.status === 'upToDate' || status.status === 'noPayments') {
        // Al día o sin pagos pero sin deuda aún
        const daysUntilDue = -daysPending; // Convertir a días restantes
        
        if (daysUntilDue > 0 && daysUntilDue <= 7) {
          // Próximo a vencer (dentro de 7 días)
          upcoming.push({
            id: tenant.id,
            type: 'upcoming',
            tenantName: tenant.name,
            roomNumber: tenant.roomNumber,
            propertyId: tenant.propertyId,
            daysRemaining: daysUntilDue,
            amount: tenant.rentAmount,
            message: `${tenant.name} vence en ${daysUntilDue} días`,
            severity: 'low'
          });
        }
      }
    });

    // Ordenar por severidad/días
    overdue.sort((a, b) => b.monthsPending - a.monthsPending);
    upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return {
      overdue,
      upcoming,
      total: overdue.length + upcoming.length,
      criticalCount: overdue.filter(n => n.severity === 'critical').length,
      overdueCount: overdue.length
    };
  }, [tenants, payments]);

  return notifications;
};

export default useNotifications;
