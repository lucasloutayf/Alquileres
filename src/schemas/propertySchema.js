import { z } from 'zod';

// Tipos de propiedad disponibles
export const propertyTypes = [
  { value: 'edificio', label: 'Edificio' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'monoambiente', label: 'Monoambiente' },
  { value: 'pension', label: 'Pensión' },
  { value: 'cabaña', label: 'Cabaña' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'ph', label: 'PH' },
  { value: 'local', label: 'Local Comercial' },
  { value: 'otro', label: 'Otro' }
];

export const propertySchema = z.object({
  title: z.string()
    .min(1, 'El título es obligatorio')
    .max(100, 'Máximo 100 caracteres'),
  
  propertyType: z.string()
    .min(1, 'Seleccione un tipo de propiedad'),
  
  description: z.string()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .min(1, 'La dirección es obligatoria')
    .max(200, 'Máximo 200 caracteres'),
  
  totalRooms: z.number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Debe tener al menos 1 habitación')
    .max(100, 'Máximo 100 habitaciones'),
  
  insuranceDetails: z.string()
    .max(300, 'Máximo 300 caracteres')
    .optional()
    .or(z.literal('')),
  
  observations: z.string()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal(''))
});
