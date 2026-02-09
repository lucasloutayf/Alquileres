import { describe, it, expect } from 'vitest';
import { tenantSchema } from '../tenantSchema';

describe('tenantSchema', () => {
  const validTenant = {
    name: 'Juan Pérez',
    dni: '12345678',
    phone: '1122334455',
    emergencyPhones: [],
    roomNumber: '1',
    rentAmount: 50000,
    entryDate: '2024-01-01',
    exitDate: '',
    contractStatus: 'activo',
    propertyId: 'prop123'
  };

  describe('valid tenant', () => {
    it('accepts valid tenant data', () => {
      const result = tenantSchema.safeParse(validTenant);
      expect(result.success).toBe(true);
    });

    it('accepts 7-character DNI', () => {
      const result = tenantSchema.safeParse({ ...validTenant, dni: '1234567' });
      expect(result.success).toBe(true);
    });

    it('accepts 10-character DNI', () => {
      const result = tenantSchema.safeParse({ ...validTenant, dni: '1234567890' });
      expect(result.success).toBe(true);
    });
  });

  describe('name validation', () => {
    it('rejects empty name', () => {
      const result = tenantSchema.safeParse({ ...validTenant, name: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('El nombre es obligatorio');
    });
  });

  describe('dni validation', () => {
    it('rejects DNI shorter than 7 characters', () => {
      const result = tenantSchema.safeParse({ ...validTenant, dni: '123456' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('7');
    });

    it('rejects DNI longer than 10 characters', () => {
      const result = tenantSchema.safeParse({ ...validTenant, dni: '12345678901' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('10');
    });
  });

  describe('phone validation', () => {
    it('rejects empty phone', () => {
      const result = tenantSchema.safeParse({ ...validTenant, phone: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('rentAmount validation', () => {
    it('rejects negative rent amount', () => {
      const result = tenantSchema.safeParse({ ...validTenant, rentAmount: -100 });
      expect(result.success).toBe(false);
    });

    it('accepts zero rent amount', () => {
      const result = tenantSchema.safeParse({ ...validTenant, rentAmount: 0 });
      expect(result.success).toBe(true);
    });
  });

  describe('contractStatus validation', () => {
    it('accepts activo status', () => {
      const result = tenantSchema.safeParse({ ...validTenant, contractStatus: 'activo' });
      expect(result.success).toBe(true);
    });

    it('accepts finalizado status', () => {
      const result = tenantSchema.safeParse({ ...validTenant, contractStatus: 'finalizado' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = tenantSchema.safeParse({ ...validTenant, contractStatus: 'pendiente' });
      expect(result.success).toBe(false);
    });
  });

  describe('entryDate validation', () => {
    it('rejects empty entry date', () => {
      const result = tenantSchema.safeParse({ ...validTenant, entryDate: '' });
      expect(result.success).toBe(false);
    });
  });
});
