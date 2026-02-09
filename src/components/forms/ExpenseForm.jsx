import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '../../schemas/expenseSchema';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { addTimeToDate } from '../../utils/dateUtils';
import Input from '../common/Input';
import Button from '../common/Button';
import { Calendar, DollarSign, FileText, Home, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ExpenseForm = ({ expense, propertyId, properties, onSave, onCancel }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      category: 'Mantenimiento',
      amount: '',
      date: '',
      propertyId: propertyId || ''
    }
  });

  useEffect(() => {
    if (expense) {
      reset({
        description: expense.description || '',
        category: expense.category || 'Mantenimiento',
        amount: expense.amount || '',
        date: expense.date ? expense.date.split('T')[0] : '',
        propertyId: expense.propertyId || propertyId || ''
      });
    } else {
      reset({
        description: '',
        category: 'Mantenimiento',
        amount: '',
        date: '',
        propertyId: propertyId || ''
      });
    }
  }, [expense, propertyId, reset]);

  const onFormSubmit = async (data) => {
    const dateWithTime = addTimeToDate(data.date);
    await onSave({
      ...data,
      date: dateWithTime,
      amount: Number(data.amount)
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Descripción */}
      <Input
        label={t('forms.expense.description')}
        {...register('description')}
        error={errors.description?.message && t('validation.required')}
        placeholder={t('forms.expense.descriptionPlaceholder')}
        icon={FileText}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector de propiedad (solo si no hay propertyId predefinido) */}
        {!propertyId && properties && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.expense.property')} *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Home className="w-5 h-5" />
              </div>
              <select 
                {...register('propertyId')}
                className={`w-full pl-10 pr-4 py-2 h-12 bg-white dark:bg-gray-900 border ${errors.propertyId ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none`}
              >
                <option value="">{t('forms.expense.selectProperty')}</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.address}</option>
                ))}
              </select>
            </div>
            {errors.propertyId && (
              <p className="text-rose-500 text-xs mt-1">{t('validation.required')}</p>
            )}
          </div>
        )}
        
        {/* Categoría */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('forms.expense.category')}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Tag className="w-5 h-5" />
            </div>
            <select 
              {...register('category')}
              className="w-full pl-10 pr-4 py-2 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
            >
              {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monto */}
        <Input
          label={t('forms.expense.amount')}
          type="number"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message && t('validation.required')}
          placeholder={t('forms.expense.amountPlaceholder')}
          min="1"
          icon={DollarSign}
        />

        {/* Fecha */}
        <Input
          label={t('forms.expense.date')}
          type="date"
          {...register('date')}
          error={errors.date?.message && t('validation.required')}
          icon={Calendar}
        />
      </div>
      
      <div className="flex gap-3 justify-end pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => {
            reset();
            onCancel();
          }}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          type="submit" 
          isLoading={isSubmitting}
          variant="primary"
        >
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
