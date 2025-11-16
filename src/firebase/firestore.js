import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  onSnapshot,
  query,
  where  // ← AGREGAR este import
} from 'firebase/firestore';
import { db } from './config';

// ===== PROPIEDADES =====
export const getProperties = (userId, callback) => {
  const q = query(
    collection(db, 'properties'),
    where('userId', '==', userId)  // ← Filtrar por usuario
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
    const docRef = await addDoc(collection(db, 'properties'), {
      ...propertyData,
      userId,  // ← Agregar userId
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding property: ", error);
    throw error;
  }
};

export const updateProperty = async (propertyId, propertyData) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, propertyData);
  } catch (error) {
    console.error("Error updating property: ", error);
    throw error;
  }
};

export const deleteProperty = async (propertyId) => {
  try {
    await deleteDoc(doc(db, 'properties', propertyId));
  } catch (error) {
    console.error("Error deleting property: ", error);
    throw error;
  }
};

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
    const docRef = await addDoc(collection(db, 'tenants'), {
      ...tenantData,
      userId,  // ← Agregar userId
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding tenant: ", error);
    throw error;
  }
};

export const updateTenant = async (tenantId, tenantData) => {
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, tenantData);
  } catch (error) {
    console.error("Error updating tenant: ", error);
    throw error;
  }
};

export const deleteTenant = async (tenantId) => {
  try {
    await deleteDoc(doc(db, 'tenants', tenantId));
  } catch (error) {
    console.error("Error deleting tenant: ", error);
    throw error;
  }
};

// ===== PAGOS =====
export const getPayments = (userId, callback) => {
  const q = query(
    collection(db, 'payments'),
    where('userId', '==', userId)  // ← Filtrar por usuario
  );
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(payments);
  });
};

export const addPayment = async (paymentData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      userId,  // ← Agregar userId
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding payment: ", error);
    throw error;
  }
};

export const deletePayment = async (paymentId) => {
  try {
    await deleteDoc(doc(db, 'payments', paymentId));
  } catch (error) {
    console.error("Error deleting payment: ", error);
    throw error;
  }
};

// ===== GASTOS =====
export const getExpenses = (userId, callback) => {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId)  // ← Filtrar por usuario
  );
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(expenses);
  });
};

export const addExpense = async (expenseData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      userId,  // ← Agregar userId
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding expense: ", error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    console.error("Error deleting expense: ", error);
    throw error;
  }
};
