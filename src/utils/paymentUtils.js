export const getTenantPaymentStatus = (tenant, payments) => {
  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
  
  // Si no tiene pagos, verificar cuánto tiempo lleva sin pagar desde su entrada
  if (tenantPayments.length === 0) {
    const entryDate = new Date(tenant.entryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    entryDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
    
    // El primer pago debe hacerse a los 30 días de la entrada
    // Si difDays >= 30, ya venció al menos 1 período
    if (diffDays < 30) {
      // Aún está en el primer período, pero no tiene pagos
      return { status: 'noPayments', months: 0, lastPayment: null };
    }
    
    // Calcular cuántos períodos completos vencieron
    // Si pasaron 30-59 días, debe 1 mes
    // Si pasaron 60-89 días, debe 2 meses, etc.
    const monthsOverdue = Math.floor(diffDays / 30);
    return { status: 'debt', months: monthsOverdue, lastPayment: null };
  }
  
  // Ordenar pagos por fecha (más reciente primero)
  tenantPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastPayment = tenantPayments[0];
  const lastPaymentDate = new Date(lastPayment.date);
  
  // Si el último pago tiene dueDate, verificar si pagó después de la fecha de vencimiento
  if (lastPayment.dueDate) {
    const dueDate = new Date(lastPayment.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    // Si hoy es posterior al vencimiento, debe dinero
    const diffDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      // Todavía no venció o pagó a tiempo
      return { status: 'upToDate', months: 0, lastPayment: lastPaymentDate };
    }
    
    // Ya venció, calcular meses que debe
    const monthsOverdue = Math.floor(diffDays / 30) + 1;
    return { status: 'debt', months: monthsOverdue, lastPayment: lastPaymentDate };
  }
  
  // Si no tiene dueDate, usar la lógica anterior basada en períodos desde entryDate
  const entryDate = new Date(tenant.entryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  entryDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
  const periodsElapsed = Math.floor(diffDays / 30);
  const paymentsMade = tenantPayments.length;
  const monthsOverdue = periodsElapsed - paymentsMade;
  
  if (monthsOverdue <= 0) {
    return { status: 'upToDate', months: 0, lastPayment: lastPaymentDate };
  }
  
  return { status: 'debt', months: monthsOverdue, lastPayment: lastPaymentDate };
};
