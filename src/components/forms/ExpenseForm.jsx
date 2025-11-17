import React, { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { addTimeToDate } from '../../utils/dateUtils';
import { validateAmount, validateRequired } from '../../utils/validations';

const ExpenseForm = ({ expense, propertyId, properties, onSave, onCancel }) => {
  const [formData, setFormData] = useState(expense || {
    description: '', 
    category: 'Mantenimiento', 
    amount: '', 
    date: '', 
    propertyId: propertyId || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Validar descripción
    const descErrors = validateRequired(formData.description, 'Descripción');
    if (descErrors.length > 0) {
      newErrors.description = descErrors[0];
    }
    
    // Validar propiedad (solo si no hay propertyId predefinido)
    if (!propertyId) {
      const propErrors = validateRequired(formData.propertyId, 'Propiedad');
      if (propErrors.length > 0) {
        newErrors.propertyId = propErrors[0];
      }
    }
    
    // Validar monto
    const amountErrors = validateAmount(formData.amount, 'Monto');
    if (amountErrors.length > 0) {
      newErrors.amount = amountErrors[0];
    }
    
    // Validar fecha
    const dateErrors = validateRequired(formData.date, 'Fecha');
    if (dateErrors.length > 0) {
      newErrors.date = dateErrors[0];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dateWithTime = addTimeToDate(formData.date);
      onSave({...formData, date: dateWithTime, amount: parseInt(formData.amount)});
    }
  };

  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
    if (errors[field]) {
      setErrors({...errors, [field]: null});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción *
        </label>
        <input 
          type="text" 
          value={formData.description} 
          onChange={e => handleChange('description', e.target.value)} 
          placeholder="Ej: Reparación de cañería"
          className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white`}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector de propiedad (solo si no hay propertyId predefinido) */}
        {!propertyId && properties && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Propiedad *
            </label>
            <select 
              value={formData.propertyId} 
              onChange={e => handleChange('propertyId', e.target.value)} 
              className={`w-full border ${errors.propertyId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Seleccionar propiedad...</option>
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.address}</option>
              ))}
            </select>
            {errors.propertyId && (
              <p className="text-red-500 text-xs mt-1">{errors.propertyId}</p>
            )}
          </div>
        )}
        
        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría
          </label>
          <select 
            value={formData.category} 
            onChange={e => handleChange('category', e.target.value)} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
          >
            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monto *
          </label>
          <input 
            type="number" 
            value={formData.amount} 
            onChange={e => handleChange('amount', e.target.value)} 
            placeholder="Ej: 15000"
            min="1"
            className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha *
          </label>
          <input 
            type="date" 
            value={formData.date} 
            onChange={e => handleChange('date', e.target.value)} 
            className={`w-full border ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-3 justify-end pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
