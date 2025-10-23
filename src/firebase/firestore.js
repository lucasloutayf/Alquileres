import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  onSnapshot,
  query
} from 'firebase/firestore';
import { db } from './config';

// ===== PROPIEDADES =====
export const getProperties = (callback) => {
  const q = query(collection(db, 'properties'));
  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(properties);
  });
};

// ===== INQUILINOS =====
export const getTenants = (callback) => {
  const q = query(collection(db, 'tenants'));
  return onSnapshot(q, (snapshot) => {
    const tenants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(tenants);
  });
};

export const addTenant = async (tenantData) => {
  try {
    const docRef = await addDoc(collection(db, 'tenants'), tenantData);
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
export const getPayments = (callback) => {
  const q = query(collection(db, 'payments'));
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(payments);
  });
};

export const addPayment = async (paymentData) => {
  try {
    const docRef = await addDoc(collection(db, 'payments'), paymentData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding payment: ", error);
    throw error;
  }
};

// ===== GASTOS =====
export const getExpenses = (callback) => {
  const q = query(collection(db, 'expenses'));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(expenses);
  });
};

export const addExpense = async (expenseData) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), expenseData);
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
