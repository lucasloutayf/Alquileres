import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenantSchema } from '../../schemas/tenantSchema';
import Button from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';
import { getTodayFormatted } from '../../utils/dateUtils';

const TenantForm = ({ tenant, propertyId, onSave, onCancel }) => {
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
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
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyPhones"
  });

  useEffect(() => {
    if (tenant) {
      reset({
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
    } else {
      reset({
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
    }
  }, [tenant, propertyId, reset]);

  const handleAddEmergencyPhone = (e) => {
    e?.preventDefault();
    if (newEmergencyPhone.trim()) {
      append(newEmergencyPhone.trim());
      setNewEmergencyPhone('');
    }
  };

  const onFormSubmit = async (data) => {
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre Completo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.name 
                ? 'border-rose-500 focus:ring-rose-500' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
            } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all`}
            placeholder="Juan Pérez"
          />
          {errors.name && (
            <p className="text-sm text-rose-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            DNI <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('dni')}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.dni 
                ? 'border-rose-500 focus:ring-rose-500' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
            } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all`}
            placeholder="12345678"
          />
          {errors.dni && (
            <p className="text-sm text-rose-500 mt-1">{errors.dni.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Teléfono Principal <span className="text-rose-500">*</span>
        </label>
        <input
          type="tel"
          {...register('phone')}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.phone 
              ? 'border-rose-500 focus:ring-rose-500' 
              : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
          } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all`}
          placeholder="+54 9 11 1234-5678"
        />
        {errors.phone && (
          <p className="text-sm text-rose-500 mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número de Habitación <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('roomNumber')}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.roomNumber 
                ? 'border-rose-500 focus:ring-rose-500' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
            } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all`}
            placeholder="12"
          />
          {errors.roomNumber && (
            <p className="text-sm text-rose-500 mt-1">{errors.roomNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monto de Alquiler <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            {...register('rentAmount', { valueAsNumber: true })}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.rentAmount 
                ? 'border-rose-500 focus:ring-rose-500' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
            } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all`}
            placeholder="70000"
          />
          {errors.rentAmount && (
            <p className="text-sm text-rose-500 mt-1">{errors.rentAmount.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de Entrada <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            {...register('entryDate')}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.entryDate 
                ? 'border-rose-500 focus:ring-rose-500' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
            } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all`}
          />
          {errors.entryDate && (
            <p className="text-sm text-rose-500 mt-1">{errors.entryDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de Salida (opcional)
          </label>
          <input
            type="date"
            {...register('exitDate')}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Estado del Contrato <span className="text-rose-500">*</span>
        </label>
        <select
          {...register('contractStatus')}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        >
          <option value="activo">Activo</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Teléfonos de Contacto de Emergencia
        </label>

        {fields.length > 0 && (
          <div className="space-y-2 mb-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={field} 
                  readOnly
                  {...register(`emergencyPhones.${index}`)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
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
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
          <Button
            type="button"
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddEmergencyPhone}
          >
            Agregar
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Presiona Enter o click en "Agregar" para añadir un teléfono
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          onClick={() => {
            reset();
            onCancel();
          }}
          variant="secondary"
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={isSubmitting}
        >
          {tenant ? 'Guardar Cambios' : 'Agregar Inquilino'}
        </Button>
      </div>
    </form>
  );
};

export default TenantForm;
