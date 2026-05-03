import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getExpenses,
  getPaginatedExpenses,
  addExpense as addExpenseFirestore,
  deleteExpense as deleteExpenseFirestore
} from '../firebase/firestore';
import { logger } from '../utils/logger';
import { runFirestoreAction } from '../utils/firestoreActions';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

export const useExpenses = (userId, options = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

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
        try {
          const result = await getPaginatedExpenses(userId, propertyId, pageSize || DEFAULT_PAGE_SIZE);
          setExpenses(result.expenses);
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        } catch (error) {
          logger.error('Error fetching paginated expenses:', error);
          toast.error('Error al cargar gastos');
        } finally {
          setLoading(false);
        }

        unsubscribeAll = getExpenses(userId, (allData) => {
          setAllExpenses(allData);
        });
      } else if (monthly) {
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
        unsubscribe = getExpenses(userId, (data) => {
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
      const result = await getPaginatedExpenses(userId, propertyId, pageSize || DEFAULT_PAGE_SIZE, lastDoc);
      setExpenses(prev => [...prev, ...result.expenses]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      logger.error('Error loading more expenses:', error);
      toast.error('Error al cargar más gastos');
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshFirstPage = async () => {
    const result = await getPaginatedExpenses(userId, propertyId, pageSize || DEFAULT_PAGE_SIZE);
    setExpenses(result.expenses);
    setLastDoc(result.lastDoc);
    setHasMore(result.hasMore);
  };

  const addExpense = (expenseData) =>
    runFirestoreAction(
      async () => {
        await addExpenseFirestore(expenseData, userId);
        if (paginated) await refreshFirstPage();
      },
      {
        userId,
        successMsg: 'Gasto agregado correctamente',
        errorMsg: 'Error al agregar gasto',
      }
    );

  const deleteExpense = (expenseId) =>
    runFirestoreAction(
      async () => {
        await deleteExpenseFirestore(expenseId);
        if (paginated) {
          setExpenses(prev => prev.filter(e => e.id !== expenseId));
          setAllExpenses(prev => prev.filter(e => e.id !== expenseId));
        }
      },
      {
        successMsg: 'Gasto eliminado correctamente',
        errorMsg: 'Error al eliminar gasto',
      }
    );

  return {
    expenses,
    allExpenses,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    addExpense,
    deleteExpense
  };
};
