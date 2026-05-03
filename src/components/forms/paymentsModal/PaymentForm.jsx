import { Plus, Minus, FileText, Calendar, DollarSign, AlertCircle, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Input from '../../common/Input';
import Button from '../../common/Button';

const PaymentForm = ({ form }) => {
  const { t } = useTranslation();
  const {
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
  } = form;

  const isSurcharge = adjustmentType === 'surcharge';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
          {t('payments.registerNew')}
        </h3>
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
                onChange={e => handleAdjustmentTypeChange(e.target.value)}
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

      {adjustmentType !== 'none' && (
        <div className="mt-6 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">{t('payments.base')}:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${parseInt(amount || 0).toLocaleString('es-AR')}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span
              className={
                isSurcharge
                  ? 'text-rose-500 flex items-center gap-1'
                  : 'text-emerald-600 dark:text-emerald-400 flex items-center gap-1'
              }
            >
              {isSurcharge ? (
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
            <span
              className={
                isSurcharge
                  ? 'text-rose-500 font-medium'
                  : 'text-emerald-600 dark:text-emerald-400 font-medium'
              }
            >
              {isSurcharge ? '+' : '-'}${parseInt(adjustment || 0).toLocaleString('es-AR')}
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

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <label className="flex items-center gap-3 mb-4 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={hasDebt}
            onChange={e => handleHasDebtChange(e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <span className="font-medium text-gray-900 dark:text-white">Debe</span>
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
              required
            />
          </div>
        )}
      </div>

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
        <Button type="submit" isLoading={isSubmitting} className="w-full" variant="default">
          {t('payments.register')}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
