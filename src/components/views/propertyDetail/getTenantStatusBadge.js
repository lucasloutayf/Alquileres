const FINISHED_CLASS = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
const UP_TO_DATE_CLASS = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
const NO_PAYMENTS_CLASS = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
const DEBT_MONTHS_CLASS = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
const DEBT_PARTIAL_CLASS = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';

export const getTenantStatusBadge = (tenant, paymentStatus, t) => {
  if (tenant.contractStatus !== 'activo') {
    return { label: t('propertyDetail.status.finished'), colorClass: FINISHED_CLASS };
  }

  if (paymentStatus.status === 'upToDate') {
    return { label: t('propertyDetail.status.upToDate'), colorClass: UP_TO_DATE_CLASS };
  }

  if (paymentStatus.status === 'noPayments') {
    return { label: t('propertyDetail.status.noPayments'), colorClass: NO_PAYMENTS_CLASS };
  }

  const { months, debtAmount } = paymentStatus;
  const formattedDebt = `$${debtAmount.toLocaleString('es-AR')}`;

  let label;
  if (months > 0 && debtAmount > 0) {
    label = `Debe ${months} mes(es) · ${formattedDebt}`;
  } else if (debtAmount > 0) {
    label = `Debe ${formattedDebt}`;
  } else {
    label = `Debe ${months} mes(es)`;
  }

  const colorClass = months > 0 ? DEBT_MONTHS_CLASS : DEBT_PARTIAL_CLASS;
  return { label, colorClass };
};
