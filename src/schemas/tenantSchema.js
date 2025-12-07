import { z } from 'zod';

export const tenantSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  dni: z.string()
    .min(7, 'El DNI debe tener entre 7 y 10 caracteres')
    .max(10, 'El DNI debe tener entre 7 y 10 caracteres'),
  phone: z.string().min(1, 'El teléfono principal es obligatorio'),
  emergencyPhones: z.array(z.string()).optional().default([]),
  roomNumber: z.string().min(1, 'El número de habitación es obligatorio'),
  rentAmount: z.number({ invalid_type_error: 'Debe ser un número' })
    .min(0, 'El monto no puede ser negativo'),
  entryDate: z.string().min(1, 'La fecha de entrada es obligatoria'),
  exitDate: z.string().optional().or(z.literal('')),
  contractStatus: z.enum(['activo', 'finalizado']),
  propertyId: z.string().min(1, 'La propiedad es obligatoria')
});
