import React, { useState, useMemo, useCallback } from 'react';
import { DollarSign, Home, TrendingDown, FileText, Trash2, Plus, Edit, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import StatCard3D from '../common/StatCard3D';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import Button from '../common/Button';
import TenantForm from '../forms/TenantForm';
import PaymentsModal from '../forms/PaymentsModal';
import ExpenseForm from '../forms/ExpenseForm';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';
import { generateTenantReport } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../common/Table';

import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';
import { logger } from '../../utils/logger';

import { useTranslation } from 'react-i18next';

const PropertyDetail = ({ user }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { 
    properties 
  } = useProperties(user?.uid);

  const { 
    tenants, 
    addTenant, 
    editTenant, 
    deleteTenant 
  } = useTenants(user?.uid);

  // Fetch recent payments for status calculation in the table
  const { 
    allPayments
  } = usePayments(user?.uid, { recent: true, days: 60 });

  // Fetch paginated expenses for this property (for the table)
  // También incluye allExpenses para calcular totales sin duplicar llamadas
  const { 
    expenses, 
    allExpenses,
    addExpense, 
    deleteExpense,
    loadMore: loadMoreExpenses,
    hasMore: hasMoreExpenses,
    loadingMore: loadingMoreExpenses
  } = useExpenses(user?.uid, { paginated: true, propertyId: id, pageSize: 10 });

  
  // Buscar la propiedad actual
  const property = properties.find(p => p.id === id);

  const [modalOpen, setModalOpen] = useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleGenerateTenantReport = (tenant) => {
    try {
      const tenantPayments = (allPayments || []).filter(p => p.tenantId === tenant.id);
      const pdf = generateTenantReport(tenant, tenantPayments, property);
      pdf.save(`reporte-${tenant.name.replace(/\s+/g, '-')}.pdf`);
      toast.success('Reporte descargado correctamente');
    } catch (error) {
      logger.error('Error generando reporte:', error);
      toast.error('Error al generar reporte');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedTenants = useCallback((tenantsToSort) => {
    if (!sortConfig.key) return tenantsToSort;

    return [...tenantsToSort].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'room':
          aValue = a.roomNumber || 0;
          bValue = b.roomNumber || 0;
          break;
        case 'rent':
          aValue = a.rentAmount || 0;
          bValue = b.rentAmount || 0;
          break;
        case 'status': {
          const aStatus = getTenantPaymentStatus(a, allPayments || []);
          const bStatus = getTenantPaymentStatus(b, allPayments || []);
          aValue = aStatus.status === 'upToDate' ? 0 : aStatus.months;
          bValue = bStatus.status === 'upToDate' ? 0 : bStatus.months;
          break;
        }
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [sortConfig, allPayments]);

  const propTenants = useMemo(() => {
    if (!property) return [];
    const filtered = tenants.filter(t => t.propertyId === property.id);
    return getSortedTenants(filtered);
  }, [tenants, property, getSortedTenants]);

  const activeTenants = propTenants.filter(t => t.contractStatus === 'activo');
  const vacantRooms = property ? property.totalRooms - activeTenants.length : 0;
  const propExpenses = expenses.filter(e => e.propertyId === id);
  const totalMonthlyIncome = activeTenants.reduce((sum, t) => sum + t.rentAmount, 0);
  
  const totalExpensesAmount = (allExpenses || [])
    .filter(e => e.propertyId === id)
    .reduce((sum, e) => sum + e.amount, 0);

  const handleSaveTenant = async (tenantData) => {
    if (editingTenant) {
      await editTenant({ ...tenantData, id: editingTenant.id });
    } else {
      await addTenant(tenantData);
    }
    setModalOpen(false);
    setEditingTenant(null);
  };

  const handleDeleteTenant = async () => {
    try {
      setIsDeleting(true);
      await deleteTenant(itemToDelete.id);
      setConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      logger.error('Error deleting tenant:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      setIsDeleting(true);
      await deleteExpense(itemToDelete.id);
      setConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      logger.error('Error deleting expense:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveExpense = async (expenseData) => {
    await addExpense(expenseData);
    setExpenseModalOpen(false);
  };

  const handlePaymentClick = (tenant) => {
    setSelectedTenant(tenant);
    setPaymentsModalOpen(true);
  };

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">{t('propertyDetail.notFound')}</h2>
        <Button onClick={() => navigate('/')} variant="default">
          {t('propertyDetail.backToDashboard')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{property.address}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard3D
          title={t('propertyDetail.potentialIncome')}
          value={`$${totalMonthlyIncome.toLocaleString('es-AR')}`}
          icon={<DollarSign />}
          colorClass="green"
        />
        <StatCard3D
          title={t('propertyDetail.vacantRooms')}
          value={vacantRooms}
          icon={<Home />}
          colorClass="blue"
        />
        <StatCard3D
          title={t('propertyDetail.totalExpenses')}
          value={`$${totalExpensesAmount.toLocaleString('es-AR')}`}
          icon={<TrendingDown />}
          colorClass="red"
        />
      </div>

      {/* TABLA DE INQUILINOS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('propertyDetail.tenantsTitle')}</h2>
          <Button 
            variant="default"
            onClick={() => { setEditingTenant(null); setModalOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('propertyDetail.addTenant')}
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-gray-500 dark:text-gray-400">{t('propertyDetail.table.name')}</TableHead>
                <TableHead 
                  onClick={() => handleSort('room')}
                  className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors select-none text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1">
                    {t('propertyDetail.table.room')}
                    {sortConfig.key === 'room' && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('rent')}
                  className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors select-none text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1">
                    {t('propertyDetail.table.rent')}
                    {sortConfig.key === 'rent' && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('status')}
                  className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors select-none text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1">
                    {t('propertyDetail.table.status')}
                    {sortConfig.key === 'status' && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('propertyDetail.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>

          <TableBody>
            {propTenants.length === 0 ? (
              <TableRow className="border-0">
                <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('propertyDetail.noTenants')}
                </TableCell>
              </TableRow>
            ) : (
              propTenants.map((tenant, index) => {
                const paymentStatus = getTenantPaymentStatus(tenant, allPayments || []);
                return (
                  <TableRow key={tenant.id} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {tenant.name}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {tenant.roomNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      ${tenant.rentAmount.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.contractStatus === 'activo'
                            ? paymentStatus.status === 'upToDate'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : paymentStatus.status === 'noPayments'
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {tenant.contractStatus === 'activo'
                          ? paymentStatus.status === 'upToDate'
                            ? t('propertyDetail.status.upToDate')
                            : paymentStatus.status === 'noPayments'
                              ? t('propertyDetail.status.noPayments')
                              : t('propertyDetail.status.late', { months: paymentStatus.months })
                          : t('propertyDetail.status.finished')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handlePaymentClick(tenant)}
                        >
                          {t('common.payments')}
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setEditingTenant(tenant); setModalOpen(true); }}
                          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleGenerateTenantReport(tenant)}
                          title="Descargar reporte"
                          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setItemToDelete(tenant); setConfirmModalOpen(true); }}
                          title="Eliminar inquilino"
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* TABLA DE GASTOS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('propertyDetail.expensesTitle')}</h2>
          <Button 
            variant="default"
            onClick={() => setExpenseModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('propertyDetail.addExpense')}
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
                <TableHead className="text-gray-500 dark:text-gray-400">{t('propertyDetail.table.description')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('propertyDetail.table.category')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('propertyDetail.table.amount')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('propertyDetail.table.date')}</TableHead>
                <TableHead className="text-gray-500 dark:text-gray-400">{t('propertyDetail.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propExpenses.length === 0 ? (
                <TableRow className="border-0">
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('propertyDetail.noExpenses')}
                  </TableCell>
                </TableRow>
              ) : (
                propExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense, index) => (
                  <TableRow key={expense.id} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <TableCell className="text-gray-900 dark:text-white font-medium">{expense.description}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{expense.category}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white font-semibold">
                      ${expense.amount.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {new Date(expense.date).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setItemToDelete(expense); setConfirmModalOpen(true); }}
                        title="Eliminar gasto"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODALES */}
      {hasMoreExpenses && (
        <div className="flex justify-center mt-4 mb-6">
          <Button 
            variant="secondary" 
            onClick={loadMoreExpenses}
            disabled={loadingMoreExpenses}
          >
            {loadingMoreExpenses ? t('common.loading') : t('expenses.loadMore')}
          </Button>
        </div>
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setEditingTenant(null); }} 
        title={editingTenant ? t('propertyDetail.editTenant') : t('propertyDetail.addTenant')}
      >
        <TenantForm 
          tenant={editingTenant} 
          propertyId={property.id} 
          onSave={handleSaveTenant} 
          onCancel={() => { setModalOpen(false); setEditingTenant(null); }} 
        />
      </Modal>

      <Modal 
        isOpen={paymentsModalOpen} 
        onClose={() => { setPaymentsModalOpen(false); setSelectedTenant(null); }} 
        title={t('propertyDetail.paymentsTitle', { name: selectedTenant?.name })}
        size="lg"
      >
        {selectedTenant && (
          <div className="space-y-6">
            <PaymentsModal 
              user={user}
              tenant={selectedTenant} 
              onClose={() => { setPaymentsModalOpen(false); setSelectedTenant(null); }} 
            />
            

          </div>
        )}
      </Modal>

      <Modal 
        isOpen={expenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
        title={t('propertyDetail.addExpense')}
      >
        <ExpenseForm 
          propertyId={property.id} 
          onSave={handleSaveExpense} 
          onCancel={() => setExpenseModalOpen(false)} 
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setItemToDelete(null); }}
        onConfirm={itemToDelete?.name ? handleDeleteTenant : handleDeleteExpense}
        message={itemToDelete?.name ? t('propertyDetail.deleteTenantMessage', { name: itemToDelete.name }) : t('expenses.deleteConfirm.message')}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PropertyDetail;
