import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export const expenseSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.string().default('Mantenimiento'),
  amount: z.number({ invalid_type_error: 'Debe ser un número' })
    .min(1, 'El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  propertyId: z.string().min(1, 'La propiedad es obligatoria')
});
