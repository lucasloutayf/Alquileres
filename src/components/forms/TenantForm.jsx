import React, { useState } from 'react';
import { validateDNI, validateAmount, validateRequired, validateRoomNumber } from '../../utils/validations';

const TenantForm = ({ tenant, propertyId, onSave, onCancel }) => {
  const [formData, setFormData] = useState(() => {
  if (tenant) {
    // Migrar emergencyPhone viejo a emergencyPhones nuevo
    const emergencyPhones = tenant.emergencyPhones || [];
    
    // Si tiene el campo viejo (emergencyPhone singular), agregarlo al array
    if (tenant.emergencyPhone && !emergencyPhones.includes(tenant.emergencyPhone)) {
      emergencyPhones.push(tenant.emergencyPhone);
    }
    
    return {
      ...tenant,
      emergencyPhones
    };
  }
  
  // Valores por defecto para nuevo inquilino
  return {
    name: '', 
    dni: '', 
    phone: '', 
    emergencyPhones: [],
    roomNumber: '', 
    entryDate: '', 
    exitDate: '', 
    contractStatus: 'activo', 
    rentAmount: '', 
    propertyId
  };
});


  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    const nameErrors = validateRequired(formData.name, 'Nombre');
    if (nameErrors.length > 0) {
      newErrors.name = nameErrors[0];
    }
    
    const dniErrors = validateDNI(formData.dni);
    if (dniErrors.length > 0) {
      newErrors.dni = dniErrors[0];
    }
    
    const phoneErrors = validateRequired(formData.phone, 'Teléfono');
    if (phoneErrors.length > 0) {
      newErrors.phone = phoneErrors[0];
    }
    
    const roomErrors = validateRoomNumber(formData.roomNumber);
    if (roomErrors.length > 0) {
      newErrors.roomNumber = roomErrors[0];
    }
    
    const entryDateErrors = validateRequired(formData.entryDate, 'Fecha de entrada');
    if (entryDateErrors.length > 0) {
      newErrors.entryDate = entryDateErrors[0];
    }
    
    const rentErrors = validateAmount(formData.rentAmount, 'Monto de alquiler');
    if (rentErrors.length > 0) {
      newErrors.rentAmount = rentErrors[0];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSave = {
        ...formData,
        roomNumber: parseInt(formData.roomNumber),
        rentAmount: parseInt(formData.rentAmount)
      };
      onSave(dataToSave);
    }
  };

  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
    if (errors[field]) {
      setErrors({...errors, [field]: null});
    }
  };

  // ← NUEVAS FUNCIONES PARA MANEJAR TELÉFONOS DE EMERGENCIA
  const addEmergencyPhone = () => {
    setFormData({
      ...formData,
      emergencyPhones: [...formData.emergencyPhones, '']
    });
  };

  const removeEmergencyPhone = (index) => {
    const newPhones = formData.emergencyPhones.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      emergencyPhones: newPhones
    });
  };

  const updateEmergencyPhone = (index, value) => {
    const newPhones = [...formData.emergencyPhones];
    newPhones[index] = value;
    setFormData({
      ...formData,
      emergencyPhones: newPhones
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre Completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre Completo *
          </label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => handleChange('name', e.target.value)} 
            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* DNI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            DNI *
          </label>
          <input 
            type="text" 
            value={formData.dni} 
            onChange={e => handleChange('dni', e.target.value)} 
            placeholder="12345678"
            maxLength="8"
            className={`w-full border ${errors.dni ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.dni && (
            <p className="text-red-500 text-xs mt-1">{errors.dni}</p>
          )}
        </div>

        {/* Teléfono Principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Teléfono Principal *
          </label>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={e => handleChange('phone', e.target.value)} 
            className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Número de Habitación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número de Habitación *
          </label>
          <input 
            type="number" 
            value={formData.roomNumber} 
            onChange={e => handleChange('roomNumber', e.target.value)} 
            className={`w-full border ${errors.roomNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.roomNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>
          )}
        </div>

        {/* Fecha de Entrada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de Entrada *
          </label>
          <input 
            type="date" 
            value={formData.entryDate} 
            onChange={e => handleChange('entryDate', e.target.value)} 
            className={`w-full border ${errors.entryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.entryDate && (
            <p className="text-red-500 text-xs mt-1">{errors.entryDate}</p>
          )}
        </div>

        {/* Fecha de Salida */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de Salida (opcional)
          </label>
          <input 
            type="date" 
            value={formData.exitDate || ''} 
            onChange={e => handleChange('exitDate', e.target.value || null)} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>

        {/* Monto de Alquiler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monto de Alquiler *
          </label>
          <input 
            type="number" 
            value={formData.rentAmount} 
            onChange={e => handleChange('rentAmount', e.target.value)} 
            placeholder="0"
            min="1"
            className={`w-full border ${errors.rentAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.rentAmount && (
            <p className="text-red-500 text-xs mt-1">{errors.rentAmount}</p>
          )}
        </div>

        {/* Estado del Contrato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado del Contrato
          </label>
          <select 
            value={formData.contractStatus} 
            onChange={e => handleChange('contractStatus', e.target.value)} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      {/* SECCIÓN DE TELÉFONOS DE EMERGENCIA */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Teléfonos de Contacto de Emergencia
          </label>
          <button
            type="button"
            onClick={addEmergencyPhone}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <span className="text-lg">+</span>
            <span>Agregar</span>
          </button>
        </div>

        {formData.emergencyPhones.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No hay teléfonos de emergencia agregados
          </p>
        ) : (
          <div className="space-y-2">
            {formData.emergencyPhones.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => updateEmergencyPhone(index, e.target.value)}
                  placeholder={`Teléfono de emergencia ${index + 1}`}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeEmergencyPhone(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
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
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default TenantForm;
