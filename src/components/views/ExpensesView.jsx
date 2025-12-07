import React, { useState, useMemo } from 'react';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ExpenseForm from '../forms/ExpenseForm';
import BarChart from '../common/BarChart';
import { useExpenses } from '../../hooks/useExpenses';
import { useProperties } from '../../hooks/useProperties';
import ConfirmModal from '../common/ConfirmModal';
import { logger } from '../../utils/logger';

import { useNavigate } from 'react-router-dom';

const ExpensesView = ({ user, theme }) => {
  const navigate = useNavigate();
  const { 
    expenses, 
    addExpense, 
    deleteExpense,
    loadMore,
    hasMore,
    loadingMore
  } = useExpenses(user?.uid, { paginated: true, pageSize: 20 });

  const { properties } = useProperties(user?.uid);



  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = useMemo(() => {
    const grouped = {};
    expenses.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return Object.entries(grouped)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const byProperty = useMemo(() => {
    return properties.map(prop => ({
      label: prop.address,
      value: expenses.filter(e => e.propertyId === prop.id).reduce((sum, e) => sum + e.amount, 0),
    })).sort((a, b) => b.value - a.value);
  }, [expenses, properties]);

  const handleSaveExpense = async (expenseData) => {
    await addExpense(expenseData);
    setExpenseModalOpen(false);
  };

  const handleDeleteExpense = async () => {
    try {
      setIsDeleting(true);
      await deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    } catch (error) {
      logger.error('Error deleting expense:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header y botón */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-emerald-600 dark:text-emerald-400 hover:underline text-base font-medium"
        >← Volver</button>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gastos</h1>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setExpenseModalOpen(true)}
          className="font-semibold text-base"
        >
          Agregar Gasto
        </Button>
      </div>

      {/* StatCard principal */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 flex items-center gap-4 border border-gray-200 dark:border-gray-700">
          <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-lg flex items-center justify-center">
            <Receipt className="w-7 h-7 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">GASTOS TOTALES</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalExpenses.toLocaleString('es-AR')}</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 min-h-[220px]">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Gastos por Categoría</h2>
          <BarChart data={byCategory} title="" barColor="emerald" theme={theme} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 min-h-[220px]">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Gastos por Propiedad</h2>
          <BarChart data={byProperty} title="" barColor="emerald" theme={theme} />
        </div>
      </div>

      {/* Tabla detalle de gastos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow px-8 py-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Detalle de Gastos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">DESCRIPCIÓN</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">PROPIEDAD</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">CATEGORÍA</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">MONTO</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">FECHA</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
                const property = properties.find(p => p.id === expense.propertyId);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{expense.description}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{property?.address || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{expense.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">${expense.amount.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{new Date(expense.date).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpenseToDelete(expense)}
                        className="p-2 rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar gasto */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Agregar Gasto"
        size="md"
      >
        <ExpenseForm
          properties={properties}
          onSave={handleSaveExpense}
          onCancel={() => setExpenseModalOpen(false)}
        />
      </Modal>

      {hasMore && (
        <div className="flex justify-center mb-8">
          <Button 
            variant="secondary" 
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Cargando...' : 'Cargar más gastos'}
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Eliminar Gasto"
        message="¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ExpensesView;
