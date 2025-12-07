import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getPayments, 
  getPaginatedPayments,
  addPayment as addPaymentFirestore,
  deletePayment as deletePaymentFirestore
} from '../firebase/firestore';
import { logger } from '../utils/logger';

export const usePayments = (userId, options = {}) => {
  const [allPayments, setAllPayments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Extraer opciones para dependencias estables
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
        // Paginated fetch
        try {
          const result = await getPaginatedPayments(userId, tenantId, pageSize || 10);
          setPayments(result.payments);
          setAllPayments(result.payments); // In paginated mode, we only have what we fetched
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        } catch (error) {
          logger.error("Error fetching paginated payments:", error);
          toast.error("Error al cargar pagos");
        } finally {
          setLoading(false);
        }
      } else if (recent) {
        // Recent fetch (client-side filtering to avoid index requirement)
        unsubscribe = getPayments(userId, (allData) => {
          setAllPayments(allData); // Store full history for status calculations
          
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
        // Default fetch (all, real-time)
        unsubscribe = getPayments(userId, (data) => {
          // Sort by date desc by default
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
      const result = await getPaginatedPayments(userId, tenantId, pageSize || 10, lastDoc);
      setPayments(prev => [...prev, ...result.payments]);
      setAllPayments(prev => [...prev, ...result.payments]); // Update allPayments too
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      logger.error("Error loading more payments:", error);
      toast.error("Error al cargar más pagos");
    } finally {
      setLoadingMore(false);
    }
  };

  const addPayment = async (paymentData) => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }
    try {
      await addPaymentFirestore(paymentData, userId);
      toast.success('Pago registrado correctamente');
      // If paginated, we might want to refresh or manually add to list. 
      // For simplicity in pagination, we might just reload or let the user see it on next refresh.
      // But if it's real-time (recent), it updates automatically.
      if (paginated) {
        // Refresh logic or manual insert could go here.
        // For now, we'll just re-fetch the first page to ensure consistency
        const result = await getPaginatedPayments(userId, tenantId, pageSize || 10);
        setPayments(result.payments);
        setAllPayments(result.payments);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      toast.error('Error al agregar pago: ' + error.message);
    }
  };

  const deletePayment = async (paymentId) => {
    try {
      await deletePaymentFirestore(paymentId);
      toast.success('Pago eliminado correctamente');
      if (options.paginated) {
        setPayments(prev => prev.filter(p => p.id !== paymentId));
        setAllPayments(prev => prev.filter(p => p.id !== paymentId));
      }
    } catch (error) {
      toast.error('Error al eliminar pago: ' + error.message);
    }
  };

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
