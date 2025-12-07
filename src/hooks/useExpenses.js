import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getExpenses, 
  getPaginatedExpenses,
  addExpense as addExpenseFirestore,
  deleteExpense as deleteExpenseFirestore
} from '../firebase/firestore';
import { logger } from '../utils/logger';

export const useExpenses = (userId, options = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]); // Todos los gastos para cálculos de totales
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Extraer opciones para dependencias estables
  const { monthly, paginated, propertyId, month, year, pageSize } = options;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};
    let unsubscribeAll = () => {};

    const fetchInitial = async () => {
      setLoading(true);
      if (paginated && propertyId) {
        // Paginated fetch para la tabla
        try {
          const result = await getPaginatedExpenses(userId, propertyId, pageSize || 10);
          setExpenses(result.expenses);
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        } catch (error) {
          logger.error("Error fetching paginated expenses:", error);
          toast.error("Error al cargar gastos");
        } finally {
          setLoading(false);
        }
        
        // También suscribirse a todos los gastos para cálculos de totales
        unsubscribeAll = getExpenses(userId, (allData) => {
          setAllExpenses(allData);
        });
      } else if (monthly) {
        // Monthly fetch (client-side filtering to avoid index requirement)
        unsubscribe = getExpenses(userId, (allData) => {
          setAllExpenses(allData);
          const date = new Date();
          const monthFilter = month !== undefined ? month : date.getMonth();
          const yearFilter = year !== undefined ? year : date.getFullYear();
          
          const monthlyData = allData
            .filter(e => {
              const eDate = new Date(e.date);
              return eDate.getMonth() === monthFilter && eDate.getFullYear() === yearFilter;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
          setExpenses(monthlyData);
          setLoading(false);
        });
      } else {
        // Default fetch (all, real-time)
        unsubscribe = getExpenses(userId, (data) => {
          // Sort by date desc by default
          const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
          setExpenses(sortedData);
          setAllExpenses(sortedData);
          setLoading(false);
        });
      }
    };

    fetchInitial();

    return () => {
      unsubscribe();
      unsubscribeAll();
    };
  }, [userId, monthly, paginated, propertyId, month, year, pageSize]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !paginated) return;

    setLoadingMore(true);
    try {
      const result = await getPaginatedExpenses(userId, propertyId, pageSize || 10, lastDoc);
      setExpenses(prev => [...prev, ...result.expenses]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      logger.error("Error loading more expenses:", error);
      toast.error("Error al cargar más gastos");
    } finally {
      setLoadingMore(false);
    }
  };

  const addExpense = async (expenseData) => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }
    try {
      await addExpenseFirestore(expenseData, userId);
      toast.success('Gasto agregado correctamente');
      if (paginated) {
        // Refresh logic
        const result = await getPaginatedExpenses(userId, propertyId, pageSize || 10);
        setExpenses(result.expenses);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      toast.error('Error al agregar gasto: ' + error.message);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await deleteExpenseFirestore(expenseId);
      toast.success('Gasto eliminado correctamente');
      if (paginated) {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        setAllExpenses(prev => prev.filter(e => e.id !== expenseId));
      }
    } catch (error) {
      toast.error('Error al eliminar gasto: ' + error.message);
    }
  };

  return {
    expenses,
    allExpenses, // Nuevo: todos los gastos para cálculos de totales
    loading,
    loadingMore,
    hasMore,
    loadMore,
    addExpense,
    deleteExpense
  };
};
