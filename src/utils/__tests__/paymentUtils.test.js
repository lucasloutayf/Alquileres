import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTenantPaymentStatus } from '../paymentUtils';

describe('paymentUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTenantPaymentStatus', () => {
    it('returns noPayments if no payments but still in first period', () => {
      const today = new Date('2023-10-15');
      vi.setSystemTime(today);

      const tenant = { 
        id: 't1', 
        entryDate: '2023-10-01' // 14 days ago, still in first period
      };
      const payments = [];
      
      const status = getTenantPaymentStatus(tenant, payments);
      expect(status.status).toBe('noPayments'); // No payments yet, in first period
      expect(status.months).toBe(0);
    });

    it('returns debt if no payments and first period ended', () => {
      const today = new Date('2023-11-15');
      vi.setSystemTime(today);

      const tenant = { 
        id: 't1', 
        entryDate: '2023-10-01' // 45 days ago, should have 1 payment
      };
      const payments = [];
      
      const status = getTenantPaymentStatus(tenant, payments);
      expect(status.status).toBe('debt');
      expect(status.months).toBe(1); // 1 period elapsed, 0 payments made
    });

    it('returns upToDate if payments match periods', () => {
      const today = new Date('2023-11-15');
      vi.setSystemTime(today);

      const tenant = { 
        id: 't1', 
        entryDate: '2023-10-01' // 45 days ago, 1 period elapsed
      };
      const payments = [
        { tenantId: 't1', date: '2023-11-10T10:00:00' }
      ];
      
      const status = getTenantPaymentStatus(tenant, payments);
      expect(status.status).toBe('upToDate');
      expect(status.months).toBe(0); // 1 period, 1 payment, all good
    });

    it('calculates correct months overdue for multiple periods', () => {
      const today = new Date('2024-01-15');
      vi.setSystemTime(today);

      const tenant = { 
        id: 't1', 
        entryDate: '2023-10-01' // 106 days ago, 3 periods elapsed
      };
      const payments = [
        { tenantId: 't1', date: '2023-11-01T10:00:00' }
      ];
      
      const status = getTenantPaymentStatus(tenant, payments);
      expect(status.status).toBe('debt');
      expect(status.months).toBe(2); // 3 periods - 1 payment = 2 months overdue
    });
  });
});
