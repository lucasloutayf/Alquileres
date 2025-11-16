import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getProperties, 
  getTenants, 
  getPayments, 
  getExpenses,
  addTenant as addTenantFirestore,
  updateTenant as updateTenantFirestore,
  deleteTenant as deleteTenantFirestore,
  addPayment as addPaymentFirestore,
  deletePayment as deletePaymentFirestore, 
  addExpense as addExpenseFirestore,
  deleteExpense as deleteExpenseFirestore
} from '../firebase/firestore';

export const useFirestore = () => {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscripciones en tiempo real usando tus funciones
    const unsubscribeProperties = getProperties((data) => {
      setProperties(data);
    });

    const unsubscribeTenants = getTenants((data) => {
      setTenants(data);
    });

    const unsubscribePayments = getPayments((data) => {
      setPayments(data);
    });

    const unsubscribeExpenses = getExpenses((data) => {
      setExpenses(data);
    });
    
    setLoading(false);

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      unsubscribeProperties();
      unsubscribeTenants();
      unsubscribePayments();
      unsubscribeExpenses();
    };
  }, []);

  // Wrapper para addTenant
  const addTenant = async (tenantData) => {
    try {
      await addTenantFirestore(tenantData);
    } catch (error) {
      toast('Error al agregar inquilino: ' + error.message);
    }
  };

  // Wrapper para editTenant
  const editTenant = async (updatedTenant) => {
    try {
      const { id, ...data } = updatedTenant;
      await updateTenantFirestore(id, data);
    } catch (error) {
      toast('Error al editar inquilino: ' + error.message);
    }
  };

  // Wrapper para deleteTenant (incluyendo lógica de borrar pagos)
  const deleteTenant = async (tenantId) => {
    try {
      // Primero borrar todos los pagos del inquilino
      const tenantPayments = payments.filter(p => p.tenantId === tenantId);
      for (const payment of tenantPayments) {
        await deletePaymentFirestore(payment.id);
      }
      // Luego borrar el inquilino
      await deleteTenantFirestore(tenantId);
    } catch (error) {
      toast('Error al eliminar inquilino: ' + error.message);
    }
  };

  // Wrapper para addPayment
  const addPayment = async (paymentData) => {
    try {
      await addPaymentFirestore(paymentData);
    } catch (error) {
      toast('Error al agregar pago: ' + error.message);
    }
  };

  // Wrapper para deletePayment (necesitas agregarlo a firestore.js)
  const deletePayment = async (paymentId) => {
    try {
      await deletePaymentFirestore(paymentId);
    } catch (error) {
      toast('Error al eliminar pago: ' + error.message);
    }
  };

  // Wrapper para addExpense
  const addExpense = async (expenseData) => {
    try {
      await addExpenseFirestore(expenseData);
    } catch (error) {
      toast('Error al agregar gasto: ' + error.message);
    }
  };

  // Wrapper para deleteExpense
  const deleteExpense = async (expenseId) => {
    try {
      await deleteExpenseFirestore(expenseId);
    } catch (error) {
      toast('Error al eliminar gasto: ' + error.message);
    }
  };

  return {
    properties,
    tenants,
    payments,
    expenses,
    loading,
    addTenant,
    editTenant,
    deleteTenant,
    addPayment,
    deletePayment,
    addExpense,
    deleteExpense
  };
};
