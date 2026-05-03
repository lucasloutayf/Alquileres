import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tenantSchema } from '../../schemas/tenantSchema';
import { getTodayFormatted } from '../../utils/dateUtils';
import Button from '../common/Button';
import Input from '../common/Input';

const buildDefaults = (tenant, propertyId) => ({
  name: tenant?.name || '',
  dni: tenant?.dni || '',
  phone: tenant?.phone || '',
  emergencyPhones: tenant?.emergencyPhones || [],
  roomNumber: tenant?.roomNumber || '',
  rentAmount: tenant?.rentAmount || '',
  entryDate: tenant?.entryDate || getTodayFormatted(),
  exitDate: tenant?.exitDate || '',
  contractStatus: tenant?.contractStatus || 'activo',
  propertyId: tenant?.propertyId || propertyId,
  observations: tenant?.observations || '',
});

const TenantForm = ({ tenant, propertyId, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(tenantSchema),
    defaultValues: buildDefaults(null, propertyId),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyPhones'
  });

  useEffect(() => {
    reset(buildDefaults(tenant, propertyId));
  }, [tenant, propertyId, reset]);

  const errorMessage = (field) => errors[field]?.message || (errors[field] ? t('validation.required') : undefined);

  const handleAddEmergencyPhone = (e) => {
    e?.preventDefault();
    if (newEmergencyPhone.trim()) {
      append(newEmergencyPhone.trim());
      setNewEmergencyPhone('');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('forms.tenant.name')}
          type="text"
          placeholder={t('forms.tenant.name')}
          error={errorMessage('name')}
          {...register('name')}
        />
        <Input
          label={t('forms.tenant.dni')}
          type="text"
          placeholder="12345678"
          error={errorMessage('dni')}
          {...register('dni')}
        />
      </div>

      <Input
        label={t('forms.tenant.phone')}
        type="tel"
        placeholder={t('forms.tenant.phonePlaceholder')}
        error={errorMessage('phone')}
        {...register('phone')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('forms.tenant.room')}
          type="text"
          placeholder="12"
          error={errorMessage('roomNumber')}
          {...register('roomNumber')}
        />
        <Input
          label={t('forms.tenant.rent')}
          type="number"
          placeholder="70000"
          error={errorMessage('rentAmount')}
          {...register('rentAmount', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('forms.tenant.entryDate')}
          type="date"
          error={errorMessage('entryDate')}
          {...register('entryDate')}
        />
        <Input
          label={t('forms.tenant.exitDate')}
          type="date"
          error={errorMessage('exitDate')}
          {...register('exitDate')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.tenant.contractStatus')} <span className="text-rose-500">*</span>
        </label>
        <select
          {...register('contractStatus')}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        >
          <option value="activo">{t('propertyDetail.status.active')}</option>
          <option value="finalizado">{t('propertyDetail.status.finished')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('forms.tenant.observations')}
        </label>
        <textarea
          {...register('observations')}
          rows="3"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
          placeholder={t('forms.tenant.observationsPlaceholder')}
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('forms.tenant.emergencyPhones')}
        </label>

        {fields.length > 0 && (
          <div className="space-y-2 mb-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
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
            placeholder={t('forms.tenant.phonePlaceholder')}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
          <Button
            type="button"
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddEmergencyPhone}
          >
            {t('forms.tenant.addPhone')}
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('forms.tenant.enterToAdd')}
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
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={isSubmitting}
        >
          {tenant ? t('common.save') : t('forms.tenant.titleAdd')}
        </Button>
      </div>
    </form>
  );
};

export default TenantForm;
