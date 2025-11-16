export const getTenantPaymentStatus = (tenant, payments) => {
  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
  if (tenantPayments.length === 0) {
    return { status: 'debt', months: 999, lastPayment: null };
  }
  
  tenantPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastPaymentDate = new Date(tenantPayments[0].date);
  const today = new Date();
  
  const diffTime = today - lastPaymentDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) {
    return { status: 'upToDate', months: 0, lastPayment: lastPaymentDate };
  }
  
  const monthsOverdue = Math.floor(diffDays / 30);
  return { status: 'debt', months: monthsOverdue, lastPayment: lastPaymentDate };
};
