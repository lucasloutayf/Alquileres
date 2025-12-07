import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePayments } from '../usePayments';
import * as firestore from '../../firebase/firestore';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../../firebase/firestore', () => ({
  getPayments: vi.fn(),
  getRecentPayments: vi.fn(),
  getPaginatedPayments: vi.fn(),
  addPayment: vi.fn(),
  deletePayment: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('usePayments', () => {
  const userId = 'user123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches recent payments correctly', async () => {
    const mockData = [{ id: '1', amount: 100 }];
    firestore.getRecentPayments.mockImplementation((uid, days, callback) => {
      setTimeout(() => {
        callback(mockData);
      }, 10);
      return () => {}; // unsubscribe
    });

    const { result } = renderHook(() => usePayments(userId, { recent: true, days: 30 }));

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.payments).toEqual(mockData);
    expect(firestore.getRecentPayments).toHaveBeenCalledWith(userId, 30, expect.any(Function));
  });

  it('fetches paginated payments correctly', async () => {
    const mockResult = {
      payments: [{ id: '1', amount: 100 }],
      lastDoc: { id: 'doc1' },
      hasMore: true
    };
    firestore.getPaginatedPayments.mockResolvedValue(mockResult);

    const { result } = renderHook(() => usePayments(userId, { paginated: true, tenantId: 't1' }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.payments).toEqual(mockResult.payments);
    expect(result.current.hasMore).toBe(true);
    expect(firestore.getPaginatedPayments).toHaveBeenCalledWith(userId, 't1', 10);
  });

  it('adds a payment successfully', async () => {
    // Setup for paginated refresh
    const mockResult = {
      payments: [{ id: '1', amount: 100 }],
      lastDoc: { id: 'doc1' },
      hasMore: false
    };
    firestore.getPaginatedPayments.mockResolvedValue(mockResult);
    firestore.addPayment.mockResolvedValue('newId');

    const { result } = renderHook(() => usePayments(userId, { paginated: true, tenantId: 't1' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addPayment({ amount: 100 });
    });

    expect(firestore.addPayment).toHaveBeenCalledWith({ amount: 100 }, userId);
    expect(toast.success).toHaveBeenCalled();
    // Should re-fetch
    expect(firestore.getPaginatedPayments).toHaveBeenCalledTimes(2);
  });

  it('deletes a payment successfully', async () => {
    // Initial state
    const mockResult = {
      payments: [{ id: '1', amount: 100 }],
      lastDoc: { id: 'doc1' },
      hasMore: false
    };
    firestore.getPaginatedPayments.mockResolvedValue(mockResult);
    firestore.deletePayment.mockResolvedValue();

    const { result } = renderHook(() => usePayments(userId, { paginated: true, tenantId: 't1' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deletePayment('1');
    });

    expect(firestore.deletePayment).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalled();
    expect(result.current.payments).toEqual([]);
  });
});
