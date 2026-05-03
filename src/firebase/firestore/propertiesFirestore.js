import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../config';
import { logger } from '../../utils/logger';
import { sanitizeObject } from '../../utils/security';

export const getProperties = (userId, callback) => {
  const q = query(
    collection(db, 'properties'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(properties);
  });
};

export const addProperty = async (propertyData, userId) => {
  try {
    const sanitizedData = sanitizeObject(propertyData);
    const docRef = await addDoc(collection(db, 'properties'), {
      ...sanitizedData,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    logger.error('Error adding property: ', error);
    throw error;
  }
};

export const updateProperty = async (propertyId, propertyData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No authenticated user');

    const propertyRef = doc(db, 'properties', propertyId);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists() || propertyDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para modificar esta propiedad');
    }

    const sanitizedData = sanitizeObject(propertyData);
    await updateDoc(propertyRef, sanitizedData);
  } catch (error) {
    logger.error('Error updating property: ', error);
    throw error;
  }
};

export const deletePropertyAtomic = async (propertyId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No authenticated user');

    const propertyRef = doc(db, 'properties', propertyId);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists() || propertyDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para eliminar esta propiedad');
    }

    const batch = writeBatch(db);
    batch.delete(propertyRef);

    const tenantsQ = query(
      collection(db, 'tenants'),
      where('propertyId', '==', propertyId),
      where('userId', '==', userId)
    );
    const tenantsSnapshot = await getDocs(tenantsQ);

    for (const tDoc of tenantsSnapshot.docs) {
      batch.delete(tDoc.ref);

      const paymentsQ = query(
        collection(db, 'payments'),
        where('tenantId', '==', tDoc.id),
        where('userId', '==', userId)
      );
      const paymentsSnapshot = await getDocs(paymentsQ);
      paymentsSnapshot.docs.forEach(pDoc => {
        batch.delete(pDoc.ref);
      });
    }

    const expensesQ = query(
      collection(db, 'expenses'),
      where('propertyId', '==', propertyId),
      where('userId', '==', userId)
    );
    const expensesSnapshot = await getDocs(expensesQ);

    expensesSnapshot.docs.forEach(eDoc => {
      batch.delete(eDoc.ref);
    });

    await batch.commit();
  } catch (error) {
    logger.error('Error deleting property atomically: ', error);
    throw error;
  }
};

export const deleteProperty = deletePropertyAtomic;
