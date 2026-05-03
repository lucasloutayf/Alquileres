import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getPayments,
  getPaginatedPayments,
  addPayment as addPaymentFirestore,
  deletePayment as deletePaymentFirestore
} from '../firebase/firestore';
import { logger } from '../utils/logger';
import { runFirestoreAction } from '../utils/firestoreActions';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

export const usePayments = (userId, options = {}) => {
  const [allPayments, setAllPayments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const { recent, paginated, tenantId, days, pageSize } = options;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};

    const fetchInitial = async () => {
      setLoading(true);
      if (paginated && tenantId) {
        try {
          const result = await getPaginatedPayments(userId, tenantId, pageSize || DEFAULT_PAGE_SIZE);
          setPayments(result.payments);
          setAllPayments(result.payments);
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        } catch (error) {
          logger.error('Error fetching paginated payments:', error);
          toast.error('Error al cargar pagos');
        } finally {
          setLoading(false);
        }
      } else if (recent) {
        unsubscribe = getPayments(userId, (allData) => {
          setAllPayments(allData);

          const daysLimit = days || 60;
          const dateLimit = new Date();
          dateLimit.setDate(dateLimit.getDate() - daysLimit);

          const recentData = allData
            .filter(p => new Date(p.date) >= dateLimit)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          setPayments(recentData);
          setLoading(false);
        });
      } else {
        unsubscribe = getPayments(userId, (data) => {
          const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
          setPayments(sortedData);
          setAllPayments(sortedData);
          setLoading(false);
        });
      }
    };

    fetchInitial();

    return () => unsubscribe();
  }, [userId, recent, paginated, tenantId, days, pageSize]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !paginated) return;

    setLoadingMore(true);
    try {
      const result = await getPaginatedPayments(userId, tenantId, pageSize || DEFAULT_PAGE_SIZE, lastDoc);
      setPayments(prev => [...prev, ...result.payments]);
      setAllPayments(prev => [...prev, ...result.payments]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      logger.error('Error loading more payments:', error);
      toast.error('Error al cargar más pagos');
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshFirstPage = async () => {
    const result = await getPaginatedPayments(userId, tenantId, pageSize || DEFAULT_PAGE_SIZE);
    setPayments(result.payments);
    setAllPayments(result.payments);
    setLastDoc(result.lastDoc);
    setHasMore(result.hasMore);
  };

  const addPayment = (paymentData) =>
    runFirestoreAction(
      async () => {
        await addPaymentFirestore(paymentData, userId);
        if (paginated) await refreshFirstPage();
      },
      {
        userId,
        successMsg: 'Pago registrado correctamente',
        errorMsg: 'Error al agregar pago',
      }
    );

  const deletePayment = (paymentId) =>
    runFirestoreAction(
      async () => {
        await deletePaymentFirestore(paymentId);
        if (paginated) {
          setPayments(prev => prev.filter(p => p.id !== paymentId));
          setAllPayments(prev => prev.filter(p => p.id !== paymentId));
        }
      },
      {
        successMsg: 'Pago eliminado correctamente',
        errorMsg: 'Error al eliminar pago',
      }
    );

  return {
    payments,
    allPayments,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    addPayment,
    deletePayment
  };
};
