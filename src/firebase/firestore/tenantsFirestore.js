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

export const getTenants = (userId, callback) => {
  const q = query(
    collection(db, 'tenants'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const tenants = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(tenants);
  });
};

export const addTenant = async (tenantData, userId) => {
  try {
    const sanitizedData = sanitizeObject(tenantData);
    const docRef = await addDoc(collection(db, 'tenants'), {
      ...sanitizedData,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    logger.error('Error adding tenant: ', error);
    throw error;
  }
};

export const updateTenant = async (tenantId, tenantData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No authenticated user');

    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantDoc = await getDoc(tenantRef);

    if (!tenantDoc.exists() || tenantDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para modificar este inquilino');
    }

    const sanitizedData = sanitizeObject(tenantData);
    await updateDoc(tenantRef, sanitizedData);
  } catch (error) {
    logger.error('Error updating tenant: ', error);
    throw error;
  }
};

export const deleteTenantAtomic = async (tenantId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('No authenticated user');

    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantDoc = await getDoc(tenantRef);

    if (!tenantDoc.exists() || tenantDoc.data().userId !== userId) {
      throw new Error('No tienes permiso para eliminar este inquilino');
    }

    const batch = writeBatch(db);
    batch.delete(tenantRef);

    const paymentsQ = query(
      collection(db, 'payments'),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId)
    );
    const paymentsSnapshot = await getDocs(paymentsQ);

    paymentsSnapshot.docs.forEach(pDoc => {
      batch.delete(pDoc.ref);
    });

    await batch.commit();
  } catch (error) {
    logger.error('Error deleting tenant atomically: ', error);
    throw error;
  }
};

export const deleteTenant = deleteTenantAtomic;
