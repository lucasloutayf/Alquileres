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

export const getPayments = (userId, callback) => {
  const q = query(
    collection(db, 'payments'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(payments);
  });
};

export const getRecentPayments = (userId, days = 60, callback) => {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  const q = query(
    collection(db, 'payments'),
    where('userId', '==', userId),
    where('date', '>=', dateLimit.toISOString()),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(payments);
  });
};

export const getPaginatedPayments = async (userId, tenantId, pageSize = 10, lastDoc = null) => {
  try {
    const constraints = [
      where('userId', '==', userId),
      where('tenantId', '==', tenantId),
      orderBy('date', 'desc'),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'payments'), ...constraints);
    const snapshot = await getDocs(q);

    const payments = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      _doc: d
    }));

    return {
      payments,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    logger.error('Error fetching paginated payments:', error);
    throw error;
  }
};

export const addPayment = async (paymentData, userId) => {
  try {
    const sanitizedData = sanitizeObject(paymentData);
    const docRef = await addDoc(collection(db, 'payments'), {
      ...sanitizedData,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    logger.error('Error adding payment: ', error);
    throw error;
  }
};

export const deletePayment = async (paymentId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No authenticated user');

    const paymentRef = doc(db, 'payments', paymentId);
    const paymentDoc = await getDoc(paymentRef);

    if (!paymentDoc.exists() || paymentDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para eliminar este pago');
    }

    await deleteDoc(paymentRef);
  } catch (error) {
    logger.error('Error deleting payment: ', error);
    throw error;
  }
};
