import { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getTenantPaymentStatus } from '../../../utils/paymentUtils';
import { generateTenantReport } from '../../../utils/pdfGenerator';
import { logger } from '../../../utils/logger';

export const usePropertyDetail = ({
  property,
  tenants,
  allPayments,
  addTenant,
  editTenant,
  deleteTenant,
  addExpense,
  deleteExpense,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isDeleting, setIsDeleting] = useState(false);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [increaseAmount, setIncreaseAmount] = useState('');
  const [increaseSign, setIncreaseSign] = useState('+');
  const [isApplyingIncrease, setIsApplyingIncrease] = useState(false);

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const toggleBulkMode = () => {
    setBulkMode(prev => !prev);
    setSelectedIds(new Set());
    setIncreaseAmount('');
    setIncreaseSign('+');
  };

  const toggleIncreaseSign = () => {
    setIncreaseSign(prev => (prev === '+' ? '-' : '+'));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (tenantsList) => {
    if (selectedIds.size === tenantsList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tenantsList.map(t => t.id)));
    }
  };

  const applyBulkIncrease = async (tenantsList) => {
    const rawAmount = parseFloat(increaseAmount);
    if (!rawAmount || rawAmount <= 0) {
      toast.error('Ingresá un monto válido mayor a 0');
      return;
    }
    if (selectedIds.size === 0) {
      toast.error('Seleccioná al menos un inquilino');
      return;
    }
    const delta = increaseSign === '+' ? rawAmount : -rawAmount;
    setIsApplyingIncrease(true);
    try {
      const toUpdate = tenantsList.filter(t => selectedIds.has(t.id));
      const invalid = toUpdate.find(t => t.rentAmount + delta < 0);
      if (invalid) {
        toast.error(`El monto resultante sería negativo para "${invalid.name}"`);
        return;
      }
      await Promise.all(
        toUpdate.map(t => editTenant({ ...t, rentAmount: t.rentAmount + delta }))
      );
      toast.success(
        `${increaseSign === '+' ? 'Aumento' : 'Reducción'} aplicado en ${toUpdate.length} inquilino(s)`
      );
      toggleBulkMode();
    } catch (err) {
      logger.error('Error aplicando cambio:', err);
      toast.error('Error al aplicar el cambio');
    } finally {
      setIsApplyingIncrease(false);
    }
  };

  const sortTenants = useCallback((tenantsToSort) => {
    if (!sortConfig.key) return tenantsToSort;

    return [...tenantsToSort].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'name':
          return sortConfig.direction === 'asc'
            ? a.name.localeCompare(b.name, 'es')
            : b.name.localeCompare(a.name, 'es');
        case 'room':
          aValue = parseInt(a.roomNumber) || 0;
          bValue = parseInt(b.roomNumber) || 0;
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

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortConfig, allPayments]);

  const propertyTenants = useMemo(() => {
    if (!property) return [];
    const filtered = tenants.filter(t => t.propertyId === property.id);
    return sortTenants(filtered);
  }, [tenants, property, sortTenants]);

  const generateReport = (tenant) => {
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

  const openAddTenant = () => {
    setEditingTenant(null);
    setModalOpen(true);
  };

  const openEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setModalOpen(true);
  };

  const closeTenantModal = () => {
    setModalOpen(false);
    setEditingTenant(null);
  };

  const openPayments = (tenant) => {
    setSelectedTenant(tenant);
    setPaymentsModalOpen(true);
  };

  const closePayments = () => {
    setPaymentsModalOpen(false);
    setSelectedTenant(null);
  };

  const requestDelete = (item) => {
    setItemToDelete(item);
    setConfirmModalOpen(true);
  };

  const closeDelete = () => {
    setConfirmModalOpen(false);
    setItemToDelete(null);
  };

  const saveTenant = async (tenantData) => {
    if (editingTenant) {
      await editTenant({ ...tenantData, id: editingTenant.id });
    } else {
      await addTenant(tenantData);
    }
    closeTenantModal();
  };

  const confirmDeleteTenant = async () => {
    try {
      setIsDeleting(true);
      await deleteTenant(itemToDelete.id);
      closeDelete();
    } catch (error) {
      logger.error('Error deleting tenant:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteExpense = async () => {
    try {
      setIsDeleting(true);
      await deleteExpense(itemToDelete.id);
      closeDelete();
    } catch (error) {
      logger.error('Error deleting expense:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const saveExpense = async (expenseData) => {
    await addExpense(expenseData);
    setExpenseModalOpen(false);
  };

  return {
    propertyTenants,
    sortConfig,
    handleSort,
    bulkMode,
    selectedIds,
    increaseAmount,
    increaseSign,
    isApplyingIncrease,
    setIncreaseAmount,
    toggleIncreaseSign,
    toggleBulkMode,
    toggleSelect,
    toggleSelectAll,
    applyBulkIncrease,
    modalOpen,
    paymentsModalOpen,
    expenseModalOpen,
    confirmModalOpen,
    editingTenant,
    selectedTenant,
    itemToDelete,
    isDeleting,
    setExpenseModalOpen,
    openAddTenant,
    openEditTenant,
    closeTenantModal,
    openPayments,
    closePayments,
    requestDelete,
    closeDelete,
    saveTenant,
    saveExpense,
    confirmDeleteTenant,
    confirmDeleteExpense,
    generateReport,
  };
};
