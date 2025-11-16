import React, { useState, useMemo } from 'react';
import StatCard from '../common/StatCard';
import BarChart from '../common/BarChart';
import Modal from '../common/Modal';
import ExpenseForm from '../forms/ExpenseForm';

const ExpensesView = ({ expenses, properties, onBack, onAddExpense, onDeleteExpense }) => {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const byCategory = useMemo(() => {
    const grouped = {};
    expenses.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return Object.entries(grouped)
      .map(([label, value]) => ({ label, value }))
      .sort((a,b) => b.value - a.value);
  }, [expenses]);

  const byProperty = useMemo(() => {
    return properties.map(prop => ({
      label: prop.address,
      value: expenses.filter(e => e.propertyId === prop.id).reduce((sum, e) => sum + e.amount, 0)
    })).sort((a,b) => b.value - a.value);
  }, [expenses, properties]);

  const handleSaveExpense = (expenseData) => {
    onAddExpense(expenseData);
    setExpenseModalOpen(false);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gastos</h1>
        
        <button 
          onClick={() => setExpenseModalOpen(true)} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          ➕ Agregar Gasto
        </button>
      </div>

      <StatCard 
        title="Gastos Totales" 
        value={`$${totalExpenses.toLocaleString('es-AR')}`} 
        icon="💸" 
        colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={byCategory} title="Gastos por Categoría" />
        <BarChart data={byProperty} title="Gastos por Propiedad" />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Detalle de Gastos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Propiedad
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
              {expenses.sort((a,b) => new Date(b.date) - new Date(a.date)).map(expense => {
                const property = properties.find(p => p.id === expense.propertyId);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{expense.description}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{property?.address}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{expense.category}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white font-semibold">
                      ${expense.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                      {new Date(expense.date).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={expenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
        title="Agregar Gasto Global"
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
