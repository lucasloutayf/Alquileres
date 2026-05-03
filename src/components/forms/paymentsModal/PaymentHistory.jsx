import { Plus, Minus, FileText, Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../common/Button';

const SURCHARGE_BADGE = 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
const DISCOUNT_BADGE = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';

const AdjustmentBadge = ({ type, t }) => {
  const isSurcharge = type === 'surcharge';
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${
        isSurcharge ? SURCHARGE_BADGE : DISCOUNT_BADGE
      }`}
    >
      {isSurcharge ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      <span>{isSurcharge ? t('payments.surcharge') : t('payments.discount')}</span>
    </span>
  );
};

const PaymentHistory = ({ payments, hasMore, loadingMore, onLoadMore, onGenerateReceipt, onRequestDelete }) => {
  const { t } = useTranslation();
  const sorted = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
        {t('payments.history')}
      </h3>

      {sorted.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          {t('payments.noPayments')}
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {sorted.map(payment => (
            <div
              key={payment.id}
              className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(payment.date).toLocaleDateString('es-AR')}
                  </span>
                  {payment.adjustmentType && (
                    <AdjustmentBadge type={payment.adjustmentType} t={t} />
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    ${payment.amount.toLocaleString('es-AR')}
                  </span>
                  {payment.adjustmentType && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({t('payments.base')}: ${payment.baseAmount.toLocaleString('es-AR')}{' '}
                      {payment.adjustmentType === 'surcharge' ? '+' : '-'}$
                      {payment.adjustment.toLocaleString('es-AR')})
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
                  onClick={() => onGenerateReceipt(payment)}
                  variant="secondary"
                  size="sm"
                  icon={<FileText className="w-4 h-4" />}
                >
                  {t('payments.receipt')}
                </Button>
                <Button
                  onClick={() => onRequestDelete(payment)}
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
          <Button variant="secondary" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? t('common.loading') : t('payments.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
