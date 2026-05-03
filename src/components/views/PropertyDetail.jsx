import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import Button from '../common/Button';
import TenantForm from '../forms/TenantForm';
import PaymentsModal from '../forms/PaymentsModal';
import ExpenseForm from '../forms/ExpenseForm';

import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

import PropertyHeader from './propertyDetail/PropertyHeader';
import TenantsSection from './propertyDetail/TenantsSection';
import ExpensesSection from './propertyDetail/ExpensesSection';
import { usePropertyDetail } from './propertyDetail/usePropertyDetail';

const PropertyDetail = ({ user }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { properties } = useProperties(user?.uid);
  const { tenants, addTenant, editTenant, deleteTenant } = useTenants(user?.uid);
  const { allPayments } = usePayments(user?.uid, { recent: true, days: 60 });
  const {
    expenses,
    allExpenses,
    addExpense,
    deleteExpense,
    loadMore: loadMoreExpenses,
    hasMore: hasMoreExpenses,
    loadingMore: loadingMoreExpenses,
  } = useExpenses(user?.uid, { paginated: true, propertyId: id, pageSize: DEFAULT_PAGE_SIZE });

  const property = properties.find(p => p.id === id);

  const detail = usePropertyDetail({
    property,
    tenants,
    allPayments,
    addTenant,
    editTenant,
    deleteTenant,
    addExpense,
    deleteExpense,
  });

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t('propertyDetail.notFound')}
        </h2>
        <Button onClick={() => navigate('/')} variant="default">
          {t('propertyDetail.backToDashboard')}
        </Button>
      </div>
    );
  }

  const activeTenants = detail.propertyTenants.filter(t => t.contractStatus === 'activo');
  const vacantRooms = property.totalRooms - activeTenants.length;
  const totalMonthlyIncome = activeTenants.reduce((sum, t) => sum + t.rentAmount, 0);
  const totalExpensesAmount = (allExpenses || [])
    .filter(e => e.propertyId === id)
    .reduce((sum, e) => sum + e.amount, 0);
  const propertyExpenses = expenses.filter(e => e.propertyId === id);

  return (
    <div className="space-y-8">
      <PropertyHeader
        property={property}
        totalMonthlyIncome={totalMonthlyIncome}
        vacantRooms={vacantRooms}
        totalExpensesAmount={totalExpensesAmount}
      />

      <TenantsSection
        tenants={detail.propertyTenants}
        allPayments={allPayments}
        sortConfig={detail.sortConfig}
        bulkMode={detail.bulkMode}
        selectedIds={detail.selectedIds}
        increaseAmount={detail.increaseAmount}
        increaseSign={detail.increaseSign}
        isApplyingIncrease={detail.isApplyingIncrease}
        onSort={detail.handleSort}
        onToggleBulkMode={detail.toggleBulkMode}
        onToggleSelect={detail.toggleSelect}
        onToggleSelectAll={detail.toggleSelectAll}
        onSetIncreaseAmount={detail.setIncreaseAmount}
        onToggleSign={detail.toggleIncreaseSign}
        onApplyBulkIncrease={detail.applyBulkIncrease}
        onAddTenant={detail.openAddTenant}
        onEditTenant={detail.openEditTenant}
        onPayments={detail.openPayments}
        onGenerateReport={detail.generateReport}
        onRequestDelete={detail.requestDelete}
      />

      <ExpensesSection
        expenses={propertyExpenses}
        hasMore={hasMoreExpenses}
        loadingMore={loadingMoreExpenses}
        onAddExpense={() => detail.setExpenseModalOpen(true)}
        onLoadMore={loadMoreExpenses}
        onRequestDelete={detail.requestDelete}
      />

      <Modal
        isOpen={detail.modalOpen}
        onClose={detail.closeTenantModal}
        title={detail.editingTenant ? t('propertyDetail.editTenant') : t('propertyDetail.addTenant')}
      >
        <TenantForm
          tenant={detail.editingTenant}
          propertyId={property.id}
          onSave={detail.saveTenant}
          onCancel={detail.closeTenantModal}
        />
      </Modal>

      <Modal
        isOpen={detail.paymentsModalOpen}
        onClose={detail.closePayments}
        title={t('propertyDetail.paymentsTitle', { name: detail.selectedTenant?.name })}
        size="lg"
      >
        {detail.selectedTenant && (
          <div className="space-y-6">
            <PaymentsModal
              user={user}
              tenant={detail.selectedTenant}
              onClose={detail.closePayments}
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={detail.expenseModalOpen}
        onClose={() => detail.setExpenseModalOpen(false)}
        title={t('propertyDetail.addExpense')}
      >
        <ExpenseForm
          propertyId={property.id}
          onSave={detail.saveExpense}
          onCancel={() => detail.setExpenseModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={detail.confirmModalOpen}
        onClose={detail.closeDelete}
        onConfirm={detail.itemToDelete?.name ? detail.confirmDeleteTenant : detail.confirmDeleteExpense}
        message={
          detail.itemToDelete?.name
            ? t('propertyDetail.deleteTenantMessage', { name: detail.itemToDelete.name })
            : t('expenses.deleteConfirm.message')
        }
        isLoading={detail.isDeleting}
      />
    </div>
  );
};

export default PropertyDetail;
