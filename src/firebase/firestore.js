import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  limit,
  orderBy,
  startAfter
} from 'firebase/firestore';
import { db, auth } from './config';
import { logger } from '../utils/logger';
import { sanitizeObject } from '../utils/security';

// ===== PROPIEDADES =====
export const getProperties = (userId, callback) => {
  const q = query(
    collection(db, 'properties'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(properties);
  });
};

export const addProperty = async (propertyData, userId) => {
  try {
    // Sanitizar datos de entrada
    const sanitizedData = sanitizeObject(propertyData);
    
    const docRef = await addDoc(collection(db, 'properties'), {
      ...sanitizedData,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    logger.error("Error adding property: ", error);
    throw error;
  }
};

export const updateProperty = async (propertyId, propertyData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No authenticated user");
    
    // Verificar que la propiedad pertenece al usuario
    const propertyRef = doc(db, 'properties', propertyId);
    const propertyDoc = await getDoc(propertyRef);
    
    if (!propertyDoc.exists() || propertyDoc.data().userId !== userId) {
      throw new Error("No tienes permiso para modificar esta propiedad");
    }
    
    // Sanitizar y actualizar
    const sanitizedData = sanitizeObject(propertyData);
    await updateDoc(propertyRef, sanitizedData);
  } catch (error) {
    logger.error("Error updating property: ", error);
    throw error;
  }
};

export const deletePropertyAtomic = async (propertyId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No authenticated user");
    
    // Verificar que la propiedad pertenece al usuario
    const propertyRef = doc(db, 'properties', propertyId);
    const propertyDoc = await getDoc(propertyRef);
    
    if (!propertyDoc.exists() || propertyDoc.data().userId !== userId) {
      throw new Error("No tienes permiso para eliminar esta propiedad");
    }
    
    const batch = writeBatch(db);
    batch.delete(propertyRef);

    // 2. Buscar y borrar inquilinos asociados (filtrar por userId para cumplir reglas)
    const tenantsQ = query(
      collection(db, 'tenants'), 
      where('propertyId', '==', propertyId),
      where('userId', '==', userId)
    );
    const tenantsSnapshot = await getDocs(tenantsQ);
    
    // Para cada inquilino, también borrar sus pagos
    for (const tDoc of tenantsSnapshot.docs) {
      batch.delete(tDoc.ref);
      
      // Borrar pagos del inquilino
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

    // 3. Buscar y borrar gastos asociados (filtrar por userId para cumplir reglas)
    const expensesQ = query(
      collection(db, 'expenses'), 
      where('propertyId', '==', propertyId),
      where('userId', '==', userId)
    );
    const expensesSnapshot = await getDocs(expensesQ);
    
    expensesSnapshot.docs.forEach(eDoc => {
      batch.delete(eDoc.ref);
    });

    // Ejecutar todo junto
    await batch.commit();
  } catch (error) {
    logger.error("Error deleting property atomically: ", error);
    throw error;
  }
};

export const deleteProperty = deletePropertyAtomic; // Alias para compatibilidad

// ===== INQUILINOS =====
export const getTenants = (userId, callback) => {
  const q = query(
    collection(db, 'tenants'),
    where('userId', '==', userId)  // ← Filtrar por usuario
  );
  return onSnapshot(q, (snapshot) => {
    const tenants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(tenants);
  });
};

export const addTenant = async (tenantData, userId) => {
  try {
    // Sanitizar datos de entrada
    const sanitizedData = sanitizeObject(tenantData);
    
    const docRef = await addDoc(collection(db, 'tenants'), {
      ...sanitizedData,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    logger.error("Error adding tenant: ", error);
    throw error;
  }
};

export const updateTenant = async (tenantId, tenantData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No authenticated user");
    
    // Verificar que el inquilino pertenece al usuario
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantDoc = await getDoc(tenantRef);
    
    if (!tenantDoc.exists() || tenantDoc.data().userId !== userId) {
      throw new Error("No tienes permiso para modificar este inquilino");
    }
    
    // Sanitizar y actualizar
    const sanitizedData = sanitizeObject(tenantData);
    await updateDoc(tenantRef, sanitizedData);
  } catch (error) {
    logger.error("Error updating tenant: ", error);
    throw error;
  }
};

export const deleteTenantAtomic = async (tenantId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No authenticated user");
    
    // 1. Verificar que el inquilino pertenece al usuario
    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantDoc = await getDoc(tenantRef);
    
    if (!tenantDoc.exists() || tenantDoc.data().userId !== userId) {
      throw new Error("No tienes permiso para eliminar este inquilino");
    }
    
    const batch = writeBatch(db);
    batch.delete(tenantRef);

    // 2. Buscar y borrar pagos asociados
    const paymentsQ = query(
      collection(db, 'payments'), 
      where('tenantId', '==', tenantId),
      where('userId', '==', userId)
    );
    const paymentsSnapshot = await getDocs(paymentsQ);
    
    paymentsSnapshot.docs.forEach(pDoc => {
      batch.delete(pDoc.ref);
    });

    // Ejecutar todo junto
    await batch.commit();
  } catch (error) {
    logger.error("Error deleting tenant atomically: ", error);
    throw error;
  }
};

export const deleteTenant = deleteTenantAtomic; // Alias para compatibilidad

// ===== PAGOS =====
export const getPayments = (userId, callback) => {
  const q = query(
    collection(db, 'payments'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
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
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(payments);
  });
};

export const getPaginatedPayments = async (userId, tenantId, pageSize = 10, lastDoc = null) => {
  try {
    let constraints = [
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
    
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      _doc: doc // Keep reference for next pagination
    }));

    return {
      payments,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    logger.error("Error fetching paginated payments:", error);
    throw error;
  }
};

export const addPayment = async (paymentData, userId) => {
  try {
    // Sanitizar datos de entrada
    const sanitizedData = sanitizeObject(paymentData);
    
    const docRef = await addDoc(collection(db, 'payments'), {
      ...sanitizedData,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    logger.error("Error adding payment: ", error);
    throw error;
  }
};

export const deletePayment = async (paymentId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No authenticated user");
    
    // Verificar pertenencia
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists() || paymentDoc.data().userId !== userId) {
      throw new Error("No tienes permiso para eliminar este pago");
    }
    
    await deleteDoc(paymentRef);
  } catch (error) {
    logger.error("Error deleting payment: ", error);
    throw error;
  }
};

// ===== GASTOS =====
export const getExpenses = (userId, callback) => {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(expenses);
  });
};

export const getMonthlyExpenses = (userId, month, year, callback) => {
  // Start of month
  const startDate = new Date(year, month, 1);
  // End of month (start of next month)
  const endDate = new Date(year, month + 1, 1);

  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    where('date', '>=', startDate.toISOString()),
    where('date', '<', endDate.toISOString()),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(expenses);
  });
};

export const getPaginatedExpenses = async (userId, propertyId, pageSize = 10, lastDoc = null) => {
  try {
    let constraints = [
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
    
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      _doc: doc
    }));

    return {
      expenses,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    logger.error("Error fetching paginated expenses:", error);
    throw error;
  }
};

export const addExpense = async (expenseData, userId) => {
  try {
    // Sanitizar datos de entrada
    const sanitizedData = sanitizeObject(expenseData);
    
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...sanitizedData,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    logger.error("Error adding expense: ", error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No authenticated user");
    
    // Verificar pertenencia
    const expenseRef = doc(db, 'expenses', expenseId);
    const expenseDoc = await getDoc(expenseRef);
    
    if (!expenseDoc.exists() || expenseDoc.data().userId !== userId) {
      throw new Error("No tienes permiso para eliminar este gasto");
    }
    
    await deleteDoc(expenseRef);
  } catch (error) {
    logger.error("Error deleting expense: ", error);
    throw error;
  }
};
