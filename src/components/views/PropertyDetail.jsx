import React, { useState, useMemo } from 'react';
import { DollarSign, Home, TrendingDown, FileText, Trash2 } from 'lucide-react';
import StatCard from '../common/StatCard';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import TenantForm from '../forms/TenantForm';
import PaymentsModal from '../forms/PaymentsModal';
import ExpenseForm from '../forms/ExpenseForm';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';
import { generateTenantReport } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

const PropertyDetail = ({ 
  property, 
  tenants, 
  payments, 
  expenses, 
  onBack, 
  onAddTenant, 
  onEditTenant, 
  onDeleteTenant, 
  onAddPayment, 
  onDeletePayment, 
  onAddExpense, 
  onDeleteExpense 
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleGenerateTenantReport = (tenant) => {
    try {
      const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
      const pdf = generateTenantReport(tenant, tenantPayments, property);
      pdf.save(`reporte-${tenant.name.replace(/\s+/g, '-')}.pdf`);
      toast.success('Reporte descargado correctamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
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

  const getSortedTenants = (tenantsToSort) => {
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
        case 'status':
          const aStatus = getTenantPaymentStatus(a, payments);
          const bStatus = getTenantPaymentStatus(b, payments);
          aValue = aStatus.status === 'upToDate' ? 0 : aStatus.months;
          bValue = bStatus.status === 'upToDate' ? 0 : bStatus.months;
          break;
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
  };

  const propTenants = useMemo(() => {
    const filtered = tenants.filter(t => t.propertyId === property.id);
    return getSortedTenants(filtered);
  }, [tenants, property.id, sortConfig]);

  const activeTenants = propTenants.filter(t => t.contractStatus === 'activo');
  const vacantRooms = property.totalRooms - activeTenants.length;
  const propExpenses = expenses.filter(e => e.propertyId === property.id);
  const totalMonthlyIncome = activeTenants.reduce((sum, t) => sum + t.rentAmount, 0);
  const totalExpensesAmount = propExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSaveTenant = (tenantData) => {
    if (editingTenant) {
      onEditTenant({ ...tenantData, id: editingTenant.id });
    } else {
      onAddTenant(tenantData);
    }
    setModalOpen(false);
    setEditingTenant(null);
  };

  const handleDeleteTenant = () => {
    onDeleteTenant(itemToDelete.id);
    setConfirmModalOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteExpense = () => {
    onDeleteExpense(itemToDelete.id);
    setConfirmModalOpen(false);
    setItemToDelete(null);
  };

  const handleSaveExpense = (expenseData) => {
    onAddExpense(expenseData);
    setExpenseModalOpen(false);
  };

  const handlePaymentClick = (tenant) => {
    setSelectedTenant(tenant);
    setPaymentsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.address}</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ingreso Mensual Potencial"
          value={totalMonthlyIncome.toLocaleString('es-AR')}
          icon={<DollarSign className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"
        />
        <StatCard
          title="Habitaciones Vacías"
          value={vacantRooms}
          icon={<Home className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800"
        />
        <StatCard
          title="Gastos Totales"
          value={totalExpensesAmount.toLocaleString('es-AR')}
          icon={<TrendingDown className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800"
        />
      </div>

      {/* TABLA DE INQUILINOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inquilinos</h2>
          <button
            onClick={() => { setEditingTenant(null); setModalOpen(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Agregar Inquilino
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th 
                  onClick={() => handleSort('room')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Habitación
                    {sortConfig.key === 'room' && (
                      <span className="text-indigo-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('rent')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Alquiler
                    {sortConfig.key === 'rent' && (
                      <span className="text-indigo-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                >
                  <div className="flex items-center gap-1">
                    Estado
                    {sortConfig.key === 'status' && (
                      <span className="text-indigo-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {propTenants.map((tenant) => {
                const paymentStatus = getTenantPaymentStatus(tenant, payments);
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {tenant.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {tenant.roomNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">
                      ${tenant.rentAmount.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tenant.contractStatus === 'activo'
                            ? paymentStatus.status === 'upToDate'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tenant.contractStatus === 'activo'
                          ? paymentStatus.status === 'upToDate'
                            ? 'Al día'
                            : `Debe ${paymentStatus.months} meses`
                          : 'Finalizado'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePaymentClick(tenant)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Pagos
                        </button>
                        <button
                          onClick={() => { setEditingTenant(tenant); setModalOpen(true); }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleGenerateTenantReport(tenant)}
                          className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                          title="Descargar reporte"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setItemToDelete(tenant); setConfirmModalOpen(true); }}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLA DE GASTOS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gastos</h2>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Agregar Gasto
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {propExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-4 text-gray-900 dark:text-white">{expense.description}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{expense.category}</td>
                  <td className="px-4 py-4 text-gray-900 dark:text-white font-semibold">
                    ${expense.amount.toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {new Date(expense.date).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => { setItemToDelete(expense); setConfirmModalOpen(true); }}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setEditingTenant(null); }} 
        title={editingTenant ? 'Editar Inquilino' : 'Agregar Inquilino'}
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
        title={`Pagos - ${selectedTenant?.name}`}
      >
        {selectedTenant && (
          <PaymentsModal 
            tenant={selectedTenant} 
            payments={payments} 
            onClose={() => { setPaymentsModalOpen(false); setSelectedTenant(null); }} 
            onAddPayment={onAddPayment} 
            onDeletePayment={onDeletePayment} 
          />
        )}
      </Modal>

      <Modal 
        isOpen={expenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
        title="Agregar Gasto"
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
        message={itemToDelete?.name ? `¿Estás seguro de eliminar al inquilino ${itemToDelete.name}?` : '¿Estás seguro de eliminar este gasto?'}
      />
    </div>
  );
};

export default PropertyDetail;
