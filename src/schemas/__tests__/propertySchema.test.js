import { describe, it, expect } from 'vitest';
import { propertySchema, propertyTypes } from '../propertySchema';

describe('propertySchema', () => {
  const validProperty = {
    title: 'Mi Propiedad',
    propertyType: 'edificio',
    description: 'Una descripción opcional',
    address: 'Av. Corrientes 1234',
    totalRooms: 10,
    insuranceDetails: '',
    observations: ''
  };

  describe('valid property', () => {
    it('accepts valid property data', () => {
      const result = propertySchema.safeParse(validProperty);
      expect(result.success).toBe(true);
    });

    it('accepts property without optional fields', () => {
      const result = propertySchema.safeParse({
        title: 'Test',
        propertyType: 'casa',
        address: 'Dirección 123',
        totalRooms: 5
      });
      expect(result.success).toBe(true);
    });
  });

  describe('title validation', () => {
    it('rejects empty title', () => {
      const result = propertySchema.safeParse({ ...validProperty, title: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('El título es obligatorio');
    });

    it('rejects title longer than 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = propertySchema.safeParse({ ...validProperty, title: longTitle });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Máximo 100 caracteres');
    });
  });

  describe('propertyType validation', () => {
    it('rejects empty property type', () => {
      const result = propertySchema.safeParse({ ...validProperty, propertyType: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('address validation', () => {
    it('rejects empty address', () => {
      const result = propertySchema.safeParse({ ...validProperty, address: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('La dirección es obligatoria');
    });

    it('rejects address longer than 200 characters', () => {
      const longAddress = 'a'.repeat(201);
      const result = propertySchema.safeParse({ ...validProperty, address: longAddress });
      expect(result.success).toBe(false);
    });
  });

  describe('totalRooms validation', () => {
    it('rejects zero rooms', () => {
      const result = propertySchema.safeParse({ ...validProperty, totalRooms: 0 });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Debe tener al menos 1 habitación');
    });

    it('rejects negative rooms', () => {
      const result = propertySchema.safeParse({ ...validProperty, totalRooms: -5 });
      expect(result.success).toBe(false);
    });

    it('rejects more than 100 rooms', () => {
      const result = propertySchema.safeParse({ ...validProperty, totalRooms: 101 });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Máximo 100 habitaciones');
    });

    it('rejects non-integer rooms', () => {
      const result = propertySchema.safeParse({ ...validProperty, totalRooms: 5.5 });
      expect(result.success).toBe(false);
    });

    it('accepts valid room count', () => {
      expect(propertySchema.safeParse({ ...validProperty, totalRooms: 1 }).success).toBe(true);
      expect(propertySchema.safeParse({ ...validProperty, totalRooms: 50 }).success).toBe(true);
      expect(propertySchema.safeParse({ ...validProperty, totalRooms: 100 }).success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('accepts empty description', () => {
      const result = propertySchema.safeParse({ ...validProperty, description: '' });
      expect(result.success).toBe(true);
    });

    it('rejects description longer than 500 characters', () => {
      const longDesc = 'a'.repeat(501);
      const result = propertySchema.safeParse({ ...validProperty, description: longDesc });
      expect(result.success).toBe(false);
    });

    it('accepts empty insuranceDetails', () => {
      const result = propertySchema.safeParse({ ...validProperty, insuranceDetails: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty observations', () => {
      const result = propertySchema.safeParse({ ...validProperty, observations: '' });
      expect(result.success).toBe(true);
    });
  });
});

describe('propertyTypes', () => {
  it('contains expected property types', () => {
    const typeValues = propertyTypes.map(t => t.value);
    expect(typeValues).toContain('edificio');
    expect(typeValues).toContain('casa');
    expect(typeValues).toContain('departamento');
    expect(typeValues).toContain('local');
  });

  it('has label for each type', () => {
    propertyTypes.forEach(type => {
      expect(type.label).toBeDefined();
      expect(type.label.length).toBeGreaterThan(0);
    });
  });
});
