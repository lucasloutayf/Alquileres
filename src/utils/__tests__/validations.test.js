import { describe, it, expect } from 'vitest';
import { validateDNI, validateAmount, validateRequired, validateRoomNumber } from '../validations';

describe('validations', () => {
  describe('validateDNI', () => {
    it('returns error for empty DNI', () => {
      expect(validateDNI('')).toContain('El DNI es obligatorio');
      expect(validateDNI(null)).toContain('El DNI es obligatorio');
      expect(validateDNI(undefined)).toContain('El DNI es obligatorio');
    });

    it('returns error for non-numeric DNI', () => {
      expect(validateDNI('abc123')).toContain('El DNI debe contener solo números');
      expect(validateDNI('12-345-678')).toContain('El DNI debe contener solo números');
    });

    it('returns error for DNI with wrong length', () => {
      expect(validateDNI('123456')).toContain('El DNI debe tener entre 7 y 8 dígitos');
      expect(validateDNI('123456789')).toContain('El DNI debe tener entre 7 y 8 dígitos');
    });

    it('accepts valid 7-digit DNI', () => {
      expect(validateDNI('1234567')).toHaveLength(0);
    });

    it('accepts valid 8-digit DNI', () => {
      expect(validateDNI('12345678')).toHaveLength(0);
    });
  });

  describe('validateAmount', () => {
    it('returns error for empty amount', () => {
      expect(validateAmount('')).toContain('Monto es obligatorio');
      expect(validateAmount(null)).toContain('Monto es obligatorio');
      expect(validateAmount(undefined)).toContain('Monto es obligatorio');
    });

    it('returns error for non-numeric amount', () => {
      expect(validateAmount('abc')).toContain('Monto debe ser un número válido');
    });

    it('returns error for zero or negative amount', () => {
      // Note: 0 is falsy in JS, so validateAmount treats it as empty
      expect(validateAmount(0)).toContain('Monto es obligatorio');
      expect(validateAmount(-100)).toContain('Monto debe ser mayor a 0');
    });

    it('returns error for very large amount', () => {
      expect(validateAmount(9999999999)).toContain('Monto es demasiado grande');
    });

    it('accepts valid positive amount', () => {
      expect(validateAmount(1000)).toHaveLength(0);
      expect(validateAmount(50000)).toHaveLength(0);
    });

    it('uses custom field name', () => {
      expect(validateAmount('', 'Precio')).toContain('Precio es obligatorio');
    });
  });

  describe('validateRequired', () => {
    it('returns error for empty value', () => {
      expect(validateRequired('', 'Nombre')).toContain('Nombre es obligatorio');
      expect(validateRequired('   ', 'Nombre')).toContain('Nombre es obligatorio');
    });

    it('accepts non-empty value', () => {
      expect(validateRequired('Juan', 'Nombre')).toHaveLength(0);
    });
  });

  describe('validateRoomNumber', () => {
    it('returns error for empty room number', () => {
      expect(validateRoomNumber('')).toContain('Número de habitación es obligatorio');
      expect(validateRoomNumber(null)).toContain('Número de habitación es obligatorio');
    });

    it('returns error for non-numeric room number', () => {
      expect(validateRoomNumber('abc')).toContain('Número de habitación debe ser un número');
    });

    it('returns error for zero or negative room number', () => {
      // Note: 0 is falsy in JS, treated as empty
      expect(validateRoomNumber(0)).toContain('Número de habitación es obligatorio');
      expect(validateRoomNumber(-1)).toContain('Número de habitación debe ser mayor a 0');
    });

    it('returns error for very large room number', () => {
      expect(validateRoomNumber(1001)).toContain('Número de habitación demasiado grande');
    });

    it('accepts valid room number', () => {
      expect(validateRoomNumber(1)).toHaveLength(0);
      expect(validateRoomNumber(100)).toHaveLength(0);
    });
  });
});
