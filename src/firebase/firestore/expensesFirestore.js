import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  limit,
  orderBy,
  startAfter,
} from 'firebase/firestore';
import { db, auth } from '../config';
import { logger } from '../../utils/logger';
import { sanitizeObject } from '../../utils/security';

export const getExpenses = (userId, callback) => {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(expenses);
  });
};

export const getMonthlyExpenses = (userId, month, year, callback) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    where('date', '>=', startDate.toISOString()),
    where('date', '<', endDate.toISOString()),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(expenses);
  });
};

export const getPaginatedExpenses = async (userId, propertyId, pageSize = 10, lastDoc = null) => {
  try {
    const constraints = [
      where('userId', '==', userId),
      where('propertyId', '==', propertyId),
      orderBy('date', 'desc'),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'expenses'), ...constraints);
    const snapshot = await getDocs(q);

    const expenses = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      _doc: d
    }));

    return {
      expenses,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    logger.error('Error fetching paginated expenses:', error);
    throw error;
  }
};

export const addExpense = async (expenseData, userId) => {
  try {
    const sanitizedData = sanitizeObject(expenseData);
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...sanitizedData,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    logger.error('Error adding expense: ', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No authenticated user');

    const expenseRef = doc(db, 'expenses', expenseId);
    const expenseDoc = await getDoc(expenseRef);

    if (!expenseDoc.exists() || expenseDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para eliminar este gasto');
    }

    await deleteDoc(expenseRef);
  } catch (error) {
    logger.error('Error deleting expense: ', error);
    throw error;
  }
};
