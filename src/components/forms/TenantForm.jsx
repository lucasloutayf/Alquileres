import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';
import { getTodayFormatted } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const TenantForm = ({ tenant, propertyId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    phone: '',
    emergencyPhones: [],
    roomNumber: '',
    rentAmount: '',
    entryDate: getTodayFormatted(),
    exitDate: '',
    contractStatus: 'activo',
    propertyId: propertyId
  });

  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        dni: tenant.dni || '',
        phone: tenant.phone || '',
        emergencyPhones: tenant.emergencyPhones || [],
        roomNumber: tenant.roomNumber || '',
        rentAmount: tenant.rentAmount || '',
        entryDate: tenant.entryDate || getTodayFormatted(),
        exitDate: tenant.exitDate || '',
        contractStatus: tenant.contractStatus || 'activo',
        propertyId: tenant.propertyId || propertyId
      });
    }
  }, [tenant, propertyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmergencyPhone = (e) => {
    e?.preventDefault();
    
    if (!newEmergencyPhone.trim()) {
      toast.error('Ingresa un teléfono válido');
      return;
    }

    setFormData(prev => ({
      ...prev,
      emergencyPhones: [...prev.emergencyPhones, newEmergencyPhone.trim()]
    }));
    setNewEmergencyPhone('');
  };

  const handleRemoveEmergencyPhone = (index) => {
    setFormData(prev => ({
      ...prev,
      emergencyPhones: prev.emergencyPhones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('El teléfono principal es obligatorio');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre Completo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            DNI <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="dni"
            required
            value={formData.dni}
            onChange={handleChange}
            placeholder="12345678"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Teléfono Principal <span className="text-rose-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          placeholder="+54 9 11 1234-5678"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número de Habitación <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="roomNumber"
            required
            value={formData.roomNumber}
            onChange={handleChange}
            placeholder="12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monto de Alquiler <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="rentAmount"
            required
            value={formData.rentAmount}
            onChange={handleChange}
            placeholder="70000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de Entrada <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="entryDate"
            required
            value={formData.entryDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de Salida (opcional)
          </label>
          <input
            type="date"
            name="exitDate"
            value={formData.exitDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Estado del Contrato <span className="text-rose-500">*</span>
        </label>
        <select
          name="contractStatus"
          value={formData.contractStatus}
          onChange={handleChange}
        >
          <option value="activo">Activo</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Teléfonos de Contacto de Emergencia
        </label>

        {formData.emergencyPhones.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.emergencyPhones.map((phone, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={phone}
                  disabled
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveEmergencyPhone(index);
                  }}
                  className="!p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="tel"
            value={newEmergencyPhone}
            onChange={(e) => setNewEmergencyPhone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEmergencyPhone(e);
              }
            }}
            placeholder="+54 9 11 8765-4321"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={(e) => {
              e.preventDefault();
              handleAddEmergencyPhone(e);
            }}
          >
            Agregar
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Presiona Enter o click en "Agregar" para añadir un teléfono
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
        >
          {tenant ? 'Guardar Cambios' : 'Agregar Inquilino'}
        </Button>
      </div>
    </form>
  );
};

export default TenantForm;
