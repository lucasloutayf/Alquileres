import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, propertyTypes } from '../../schemas/propertySchema';
import Button from '../common/Button';
import { Home, MapPin, Bed, Shield, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PropertyForm = ({ isOpen, onClose, onSubmit, property }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      propertyType: '',
      description: '',
      address: '',
      totalRooms: '',
      insuranceDetails: '',
      observations: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: property?.title || '',
        propertyType: property?.propertyType || '',
        description: property?.description || '',
        address: property?.address || '',
        totalRooms: property?.totalRooms || '',
        insuranceDetails: property?.insuranceDetails || '',
        observations: property?.observations || ''
      });
    }
  }, [property, isOpen, reset]);

  const onFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  const inputClasses = (error) => `
    w-full px-4 py-2.5 rounded-lg border transition-all
    ${error 
      ? 'border-rose-500 focus:ring-rose-500' 
      : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500'
    } 
    bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white 
    focus:ring-2 focus:border-transparent outline-none
  `;

  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Título */}
      <div>
        <label className={labelClasses}>
          <span className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            {t('forms.property.title')} <span className="text-rose-500">*</span>
          </span>
        </label>
        <input
          type="text"
          {...register('title')}
          className={inputClasses(errors.title)}
          placeholder="Ej: Edificio San Martín"
        />
        {errors.title && (
          <p className="text-sm text-rose-500 mt-1">{t('validation.required')}</p>
        )}
      </div>

      {/* Tipo de Propiedad */}
      <div>
        <label className={labelClasses}>
          {t('forms.property.type')} <span className="text-rose-500">*</span>
        </label>
        <select
          {...register('propertyType')}
          className={inputClasses(errors.propertyType)}
        >
          <option value="">{t('forms.property.selectType')}</option>
          {propertyTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.propertyType && (
          <p className="text-sm text-rose-500 mt-1">{t('validation.required')}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClasses}>
          {t('forms.property.description')}
        </label>
        <textarea
          {...register('description')}
          rows={2}
          className={inputClasses(errors.description)}
          placeholder={t('forms.property.description')}
        />
        {errors.description && (
          <p className="text-sm text-rose-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Dirección */}
      <div>
        <label className={labelClasses}>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('forms.property.address')} <span className="text-rose-500">*</span>
          </span>
        </label>
        <input
          type="text"
          {...register('address')}
          className={inputClasses(errors.address)}
          placeholder="Ej: Calle Falsa 123, Piso 2, Depto A"
        />
        {errors.address && (
          <p className="text-sm text-rose-500 mt-1">{t('validation.required')}</p>
        )}
      </div>

      {/* Cantidad de Habitaciones */}
      <div>
        <label className={labelClasses}>
          <span className="flex items-center gap-2">
            <Bed className="w-4 h-4" />
            {t('forms.property.totalRooms')} <span className="text-rose-500">*</span>
          </span>
        </label>
        <input
          type="number"
          {...register('totalRooms', { valueAsNumber: true })}
          className={inputClasses(errors.totalRooms)}
          placeholder="Ej: 5"
          min="1"
        />
        {errors.totalRooms && (
          <p className="text-sm text-rose-500 mt-1">{t('validation.required')}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('forms.property.roomsHelper')}
        </p>
      </div>

      {/* Detalles del Seguro */}
      <div>
        <label className={labelClasses}>
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t('forms.property.insurance')}
          </span>
        </label>
        <textarea
          {...register('insuranceDetails')}
          rows={2}
          className={inputClasses(errors.insuranceDetails)}
          placeholder={t('forms.property.insurancePlaceholder')}
        />
        {errors.insuranceDetails && (
          <p className="text-sm text-rose-500 mt-1">{errors.insuranceDetails.message}</p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label className={labelClasses}>
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t('forms.property.observations')}
          </span>
        </label>
        <textarea
          {...register('observations')}
          rows={2}
          className={inputClasses(errors.observations)}
          placeholder={t('forms.property.observationsPlaceholder')}
        />
        {errors.observations && (
          <p className="text-sm text-rose-500 mt-1">{errors.observations.message}</p>
        )}
      </div>

      {/* Botones */}
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
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="default"
          className="flex-1"
          disabled={isSubmitting}
        >
          {property ? t('common.save') : t('dashboard.addProperty')}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
