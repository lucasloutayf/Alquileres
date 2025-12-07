import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema } from '../../schemas/propertySchema';
import Button from '../common/Button';

const PropertyForm = ({ isOpen, onClose, onSubmit, property }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      address: '',
      totalRooms: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        address: property?.address || '',
        totalRooms: property?.totalRooms || ''
      });
    }
  }, [property, isOpen, reset]);

  const onFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dirección <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          {...register('address')}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.address 
              ? 'border-rose-500 focus:ring-rose-500' 
              : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
          } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all`}
          placeholder="Ej: Calle Falsa 123, Piso 2, Depto A"
        />
        {errors.address && (
          <p className="text-sm text-rose-500 mt-1">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cantidad de Habitaciones <span className="text-rose-500">*</span>
        </label>
        <input
          type="number"
          {...register('totalRooms', { valueAsNumber: true })}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.totalRooms 
              ? 'border-rose-500 focus:ring-rose-500' 
              : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500'
          } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent outline-none transition-all`}
          placeholder="Ej: 5"
        />
        {errors.totalRooms && (
          <p className="text-sm text-rose-500 mt-1">{errors.totalRooms.message}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          Total de habitaciones disponibles para alquilar en esta propiedad
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          onClick={() => {
            reset();
            onClose();
          }}
          variant="secondary"
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="default"
          className="flex-1"
          disabled={isSubmitting}
        >
          {property ? 'Guardar Cambios' : 'Agregar Propiedad'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
