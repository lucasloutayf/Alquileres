import { z } from 'zod';

export const propertySchema = z.object({
  address: z.string().min(1, 'La dirección es obligatoria'),
  totalRooms: z.number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Debe tener al menos 1 habitación')
});
