import React, { useState, useMemo } from 'react';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ExpenseForm from '../forms/ExpenseForm';
import BarChart from '../common/BarChart';

const ExpensesView = ({
  expenses,
  properties,
  onBack,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

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

  const handleSaveExpense = (expenseData) => {
    onAddExpense(expenseData);
    setExpenseModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      {/* Header y botón */}
      <div className="flex items-center justify-between px-8 pt-2 pb-4">
        <button
          onClick={onBack}
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
      <div className="px-8 pt-1 pb-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 flex items-center gap-4 border border-gray-100 dark:border-gray-800">
          <div className="bg-rose-100 dark:bg-rose-950 p-3 rounded-lg flex items-center justify-center">
            <Receipt className="w-7 h-7 text-rose-700 dark:text-rose-300" />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">GASTOS TOTALES</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">${totalExpenses.toLocaleString('es-AR')}</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 pt-2">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800 min-h-[220px]">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Gastos por Categoría</h2>
          <BarChart data={byCategory} title="" barColor="emerald" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-800 min-h-[220px]">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Gastos por Propiedad</h2>
          <BarChart data={byProperty} title="" barColor="emerald" />
        </div>
      </div>

      {/* Tabla detalle de gastos */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow px-8 py-6 mt-8 mx-8 border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Detalle de Gastos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">DESCRIPCIÓN</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">PROPIEDAD</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">CATEGORÍA</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">MONTO</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">FECHA</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
                const property = properties.find(p => p.id === expense.propertyId);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{expense.description}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{property?.address || '-'}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{expense.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">${expense.amount.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{new Date(expense.date).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
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
    </div>
  );
};

export default ExpensesView;
