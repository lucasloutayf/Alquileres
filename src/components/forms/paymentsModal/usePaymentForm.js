import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getTodayFormatted, addTimeToDate } from '../../../utils/dateUtils';
import { logger } from '../../../utils/logger';

export const usePaymentForm = ({ tenant, addPayment }) => {
  const { t } = useTranslation();

  const [amount, setAmount] = useState(tenant.rentAmount);
  const [date, setDate] = useState(getTodayFormatted());
  const [dueDate, setDueDate] = useState(getTodayFormatted());
  const [adjustment, setAdjustment] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState('none');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [hasDebt, setHasDebt] = useState(false);
  const [debtAmount, setDebtAmount] = useState('');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalAmount = useMemo(() => {
    const base = parseInt(amount) || 0;
    const adj = parseInt(adjustment) || 0;
    if (adjustmentType === 'surcharge') return base + adj;
    if (adjustmentType === 'discount') return base - adj;
    return base;
  }, [amount, adjustment, adjustmentType]);

  const reset = () => {
    setAmount(tenant.rentAmount);
    setDate(getTodayFormatted());
    setDueDate(getTodayFormatted());
    setAdjustment(0);
    setAdjustmentType('none');
    setAdjustmentReason('');
    setHasDebt(false);
    setDebtAmount('');
    setObservations('');
  };

  const handleAdjustmentTypeChange = (value) => {
    setAdjustmentType(value);
    if (value === 'none') {
      setAdjustment(0);
      setAdjustmentReason('');
    }
  };

  const handleHasDebtChange = (checked) => {
    setHasDebt(checked);
    if (!checked) setDebtAmount('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseInt(amount) <= 0) {
      toast.error(t('payments.errorAmountZero'));
      return;
    }

    if (adjustmentType !== 'none') {
      if (!adjustment || parseInt(adjustment) <= 0) {
        toast.error(t('payments.errorAdjustmentZero'));
        return;
      }
      if (!adjustmentReason || adjustmentReason.trim() === '') {
        toast.error(t('payments.errorReasonRequired'));
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const paymentData = {
        tenantId: tenant.id,
        baseAmount: parseInt(amount),
        adjustment: adjustmentType !== 'none' ? parseInt(adjustment) : 0,
        adjustmentType: adjustmentType !== 'none' ? adjustmentType : null,
        adjustmentReason: adjustmentType !== 'none' ? adjustmentReason : null,
        amount: finalAmount,
        date: addTimeToDate(date),
        dueDate: addTimeToDate(dueDate),
        debt: hasDebt ? parseInt(debtAmount) : 0,
        observations: observations.trim()
      };

      await addPayment(paymentData);
      reset();
    } catch (error) {
      logger.error('Error adding payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    amount, setAmount,
    date, setDate,
    dueDate, setDueDate,
    adjustment, setAdjustment,
    adjustmentType, handleAdjustmentTypeChange,
    adjustmentReason, setAdjustmentReason,
    hasDebt, handleHasDebtChange,
    debtAmount, setDebtAmount,
    observations, setObservations,
    finalAmount,
    isSubmitting,
    handleSubmit,
  };
};
