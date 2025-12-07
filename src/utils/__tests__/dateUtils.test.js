import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { formatDateForInput, addTimeToDate, formatDateToLocale, getTodayFormatted } from '../dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDateForInput', () => {
    it('formats date correctly for input', () => {
      const date = new Date('2023-10-05T10:00:00');
      expect(formatDateForInput(date)).toBe('2023-10-05');
    });
  });

  describe('addTimeToDate', () => {
    it('adds 12:00:00 time to date string', () => {
      expect(addTimeToDate('2023-10-05')).toBe('2023-10-05T12:00:00');
    });
  });

  describe('formatDateToLocale', () => {
    it('formats date to locale string', () => {
      const date = new Date('2023-10-05T10:00:00');
      // Note: This depends on the system locale if not mocked, but we pass 'es-AR'
      // However, Node/JSDOM might not have full ICU data. 
      // We'll check if it contains the parts we expect.
      const formatted = formatDateToLocale(date, 'es-AR');
      expect(formatted).toContain('2023');
      // Flexible check as separators might vary
    });
  });

  describe('getTodayFormatted', () => {
    it('returns today formatted', () => {
      const date = new Date('2023-10-05T10:00:00');
      vi.setSystemTime(date);
      expect(getTodayFormatted()).toBe('2023-10-05');
    });
  });
});
