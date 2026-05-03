import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePayments } from '../../hooks/usePayments';
import { logger } from '../../utils/logger';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import ConfirmModal from '../common/ConfirmModal';
import ReceiptGenerator from '../receipts/ReceiptGenerator';
import PaymentForm from './paymentsModal/PaymentForm';
import PaymentHistory from './paymentsModal/PaymentHistory';
import { usePaymentForm } from './paymentsModal/usePaymentForm';

const PaymentsModal = ({ user, tenant }) => {
  const { t } = useTranslation();
  const {
    payments,
    addPayment,
    deletePayment,
    loadMore,
    hasMore,
    loadingMore
  } = usePayments(user?.uid, { paginated: true, tenantId: tenant.id, pageSize: DEFAULT_PAGE_SIZE });

  const form = usePaymentForm({ tenant, addPayment });

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleGenerateReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setSelectedPayment(null);
  };

  const confirmDelete = async () => {
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

  if (showReceipt && selectedPayment) {
    return <ReceiptGenerator payment={selectedPayment} tenant={tenant} onClose={closeReceipt} />;
  }

  return (
    <div className="space-y-8">
      <PaymentForm form={form} />

      <PaymentHistory
        payments={payments}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        onGenerateReceipt={handleGenerateReceipt}
        onRequestDelete={setPaymentToDelete}
      />

      <ConfirmModal
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={confirmDelete}
        title={t('payments.deleteTitle')}
        message={t('payments.deleteMessage')}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PaymentsModal;
