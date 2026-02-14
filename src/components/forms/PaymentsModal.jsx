import React, { useState, useMemo } from 'react';
import { Plus, Minus, FileText, Trash2, Calendar, DollarSign, AlertCircle, CreditCard } from 'lucide-react';
import { getTodayFormatted, addTimeToDate } from '../../utils/dateUtils';
import ReceiptGenerator from '../receipts/ReceiptGenerator';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { usePayments } from '../../hooks/usePayments';
import { logger } from '../../utils/logger';
import { useTranslation } from 'react-i18next';

const PaymentsModal = ({ user, tenant }) => {
  const { t } = useTranslation();
  const { 
    payments, 
    addPayment, 
    deletePayment,
    loadMore,
    hasMore,
    loadingMore
  } = usePayments(user?.uid, { paginated: true, tenantId: tenant.id, pageSize: 10 });

  const [amount, setAmount] = useState(tenant.rentAmount);
  const [date, setDate] = useState(getTodayFormatted());
  const [adjustment, setAdjustment] = useState(0);
  const [dueDate, setDueDate] = useState(getTodayFormatted());
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('none');
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDebt, setHasDebt] = useState(false);
  const [debtAmount, setDebtAmount] = useState('');
  const [observations, setObservations] = useState('');

  const finalAmount = useMemo(() => {
    const base = parseInt(amount) || 0;
    const adj = parseInt(adjustment) || 0;
    if (adjustmentType === 'surcharge') return base + adj;
    if (adjustmentType === 'discount') return base - adj;
    return base;
  }, [amount, adjustment, adjustmentType]);

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
      const dateWithTime = addTimeToDate(date);
      const dueDateWithTime = addTimeToDate(dueDate);
      
      const paymentData = {
        tenantId: tenant.id,
        baseAmount: parseInt(amount),
        adjustment: adjustmentType !== 'none' ? parseInt(adjustment) : 0,
        adjustmentType: adjustmentType !== 'none' ? adjustmentType : null,
        adjustmentReason: adjustmentType !== 'none' ? adjustmentReason : null,
        amount: finalAmount,
        date: dateWithTime,
        dueDate: dueDateWithTime,
        debt: hasDebt ? parseInt(debtAmount) : 0,
        observations: observations.trim()
      };

      await addPayment(paymentData);
      
      setAmount(tenant.rentAmount);
      setDate(getTodayFormatted());
      setAdjustment(0);
      setAdjustmentReason('');
      setAdjustmentType('none');
      setDueDate(getTodayFormatted());
      setHasDebt(false);
      setDebtAmount('');
      setObservations('');
    } catch (error) {
      logger.error('Error adding payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async () => {
    try {
      setIsDeleting(true);
      await deletePayment(paymentToDelete.id);
      setPaymentToDelete(null);
    } catch (error) {
      logger.error('Error deleting payment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const tenantPayments = payments
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  if (showReceipt && selectedPayment) {
    return (
      <ReceiptGenerator 
        payment={selectedPayment} 
        tenant={tenant} 
        onClose={() => {
          setShowReceipt(false);
          setSelectedPayment(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{t('payments.registerNew')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input
            label={t('payments.baseAmount')}
            type="number"
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
            icon={DollarSign}
          />
          <Input
            label={t('payments.paymentDate')}
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            icon={Calendar}
          />
          <Input
            label={t('payments.dueDate')}
            type="date"
            required
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            icon={Calendar}
          />
        </div>

        {/* Multas/Descuentos */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
            {t('payments.adjustments')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <select 
                  value={adjustmentType} 
                  onChange={e => {
                    setAdjustmentType(e.target.value);
                    if (e.target.value === 'none') {
                      setAdjustment(0);
                      setAdjustmentReason('');
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  <option value="none">{t('payments.noAdjustment')}</option>
                  <option value="surcharge">{t('payments.surcharge')}</option>
                  <option value="discount">{t('payments.discount')}</option>
                </select>
              </div>
            </div>

            {adjustmentType !== 'none' && (
              <>
                <Input
                  placeholder={t('payments.amount')}
                  type="number"
                  value={adjustment}
                  onChange={e => setAdjustment(e.target.value)}
                  icon={DollarSign}
                />
                <Input
                  placeholder={t('payments.reason')}
                  type="text"
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  icon={FileText}
                />
              </>
            )}
          </div>
        </div>

        {/* Resumen del pago */}
        {adjustmentType !== 'none' && (
          <div className="mt-6 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">{t('payments.base')}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${parseInt(amount || 0).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className={adjustmentType === 'surcharge' ? 'text-rose-500 flex items-center gap-1' : 'text-emerald-600 dark:text-emerald-400 flex items-center gap-1'}>
                {adjustmentType === 'surcharge' ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t('payments.surcharge')}:</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4" />
                    <span>{t('payments.discount')}:</span>
                  </>
                )}
              </span>
              <span className={adjustmentType === 'surcharge' ? 'text-rose-500 font-medium' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
                {adjustmentType === 'surcharge' ? '+' : '-'}${parseInt(adjustment || 0).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between items-center text-base font-bold border-t border-emerald-100 dark:border-emerald-900/20 pt-3 mt-2">
              <span className="text-gray-900 dark:text-white">{t('payments.totalToPay')}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-xl">
                ${finalAmount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        )}

        {/* Deuda Pendiente */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <label className="flex items-center gap-3 mb-4 cursor-pointer w-fit">
            <input 
              type="checkbox"
              checked={hasDebt}
              onChange={e => {
                setHasDebt(e.target.checked);
                if (!e.target.checked) setDebtAmount('');
              }}
              className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <span className="font-medium text-gray-900 dark:text-white">
              Debe
            </span>
          </label>

          {hasDebt && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <Input
                label="Monto que debe"
                placeholder="0"
                type="number"
                value={debtAmount}
                onChange={e => setDebtAmount(e.target.value)}
                icon={AlertCircle}
                required={hasDebt}
              />
            </div>
          )}

        </div>

        {/* Observaciones */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <Input
            label={t('Observaciones')}
            placeholder={t('Observaciones')}
            type="textarea"
            value={observations}
            onChange={e => setObservations(e.target.value)}
            icon={FileText}
            rows={3}
          />
        </div>

        <div className="mt-6">
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="w-full"
            variant="default"
          >
            {t('payments.register')}
          </Button>
        </div>
      </form>

      <div>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">{t('payments.history')}</h3>
        {tenantPayments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            {t('payments.noPayments')}
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {tenantPayments.map(payment => (
              <div key={payment.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(payment.date).toLocaleDateString('es-AR')}
                    </span>
                    {payment.adjustmentType && (
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${
                        payment.adjustmentType === 'surcharge' 
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' 
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {payment.adjustmentType === 'surcharge' ? (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>{t('payments.surcharge')}</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-3 h-3" />
                            <span>{t('payments.discount')}</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                      ${payment.amount.toLocaleString('es-AR')}
                    </span>
                    {payment.adjustmentType && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({t('payments.base')}: ${payment.baseAmount.toLocaleString('es-AR')} {payment.adjustmentType === 'surcharge' ? '+' : '-'}${payment.adjustment.toLocaleString('es-AR')})
                      </span>
                    )}
                    {payment.debt > 0 && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Debe: ${payment.debt.toLocaleString('es-AR')}
                      </span>
                    )}
                  </div>
                  {payment.adjustmentReason && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                      "{payment.adjustmentReason}"
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleGenerateReceipt(payment)}
                    variant="secondary"
                    size="sm"
                    icon={<FileText className="w-4 h-4" />}
                  >
                    {t('payments.receipt')}
                  </Button>
                  <Button 
                    onClick={() => setPaymentToDelete(payment)}
                    variant="ghost"
                    size="icon"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button 
              variant="secondary" 
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? t('common.loading') : t('payments.loadMore')}
            </Button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={handleDeletePayment}
        title={t('payments.deleteTitle')}
        message={t('payments.deleteMessage')}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PaymentsModal;
