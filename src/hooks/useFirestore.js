import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getProperties, 
  getTenants, 
  getPayments, 
  getExpenses,
  addProperty as addPropertyFirestore,
  updateProperty as updatePropertyFirestore,
  deleteProperty as deletePropertyFirestore,
  addTenant as addTenantFirestore,
  updateTenant as updateTenantFirestore,
  deleteTenant as deleteTenantFirestore,
  addPayment as addPaymentFirestore,
  deletePayment as deletePaymentFirestore, 
  addExpense as addExpenseFirestore,
  deleteExpense as deleteExpenseFirestore
} from '../firebase/firestore';

export const useFirestore = (userId) => {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo suscribirse si hay un userId
    if (!userId) {
      setLoading(false);
      return;
    }

    // Suscripciones en tiempo real filtrando por userId
    const unsubscribeProperties = getProperties(userId, (data) => {
      setProperties(data);
    });

    const unsubscribeTenants = getTenants(userId, (data) => {
      setTenants(data);
    });

    const unsubscribePayments = getPayments(userId, (data) => {
      setPayments(data);
    });

    const unsubscribeExpenses = getExpenses(userId, (data) => {
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
  }, [userId]);

  // ===== PROPIEDADES =====
  const addProperty = async (propertyData) => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }
    try {
      await addPropertyFirestore(propertyData, userId);
      toast.success('Propiedad agregada correctamente');
    } catch (error) {
      toast.error('Error al agregar propiedad: ' + error.message);
    }
  };

  const editProperty = async (propertyData) => {
    try {
      const { id, ...data } = propertyData;
      await updatePropertyFirestore(id, data);
      toast.success('Propiedad actualizada correctamente');
    } catch (error) {
      toast.error('Error al editar propiedad: ' + error.message);
    }
  };

  const deleteProperty = async (propertyId) => {
    try {
      // Verificar si hay inquilinos activos
      const propertyTenants = tenants.filter(t => t.propertyId === propertyId && t.contractStatus === 'activo');
      
      if (propertyTenants.length > 0) {
        toast.error('No se puede eliminar una propiedad con inquilinos activos');
        return;
      }

      // Eliminar inquilinos inactivos de la propiedad
      const inactiveTenants = tenants.filter(t => t.propertyId === propertyId);
      for (const tenant of inactiveTenants) {
        await deleteTenantFirestore(tenant.id);
      }

      // Eliminar gastos asociados a la propiedad
      const propertyExpenses = expenses.filter(e => e.propertyId === propertyId);
      for (const expense of propertyExpenses) {
        await deleteExpenseFirestore(expense.id);
      }

      // Finalmente eliminar la propiedad
      await deletePropertyFirestore(propertyId);
      toast.success('Propiedad eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar propiedad: ' + error.message);
    }
  };

  // ===== INQUILINOS =====
  const addTenant = async (tenantData) => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }
    try {
      await addTenantFirestore(tenantData, userId);
      toast.success('Inquilino agregado correctamente');
    } catch (error) {
      toast.error('Error al agregar inquilino: ' + error.message);
    }
  };

  const editTenant = async (updatedTenant) => {
    try {
      const { id, ...data } = updatedTenant;
      await updateTenantFirestore(id, data);
      toast.success('Inquilino actualizado correctamente');
    } catch (error) {
      toast.error('Error al editar inquilino: ' + error.message);
    }
  };

  const deleteTenant = async (tenantId) => {
    try {
      // Primero borrar todos los pagos del inquilino
      const tenantPayments = payments.filter(p => p.tenantId === tenantId);
      for (const payment of tenantPayments) {
        await deletePaymentFirestore(payment.id);
      }
      // Luego borrar el inquilino
      await deleteTenantFirestore(tenantId);
      toast.success('Inquilino eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar inquilino: ' + error.message);
    }
  };

  // ===== PAGOS =====
  const addPayment = async (paymentData) => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }
    try {
      await addPaymentFirestore(paymentData, userId);
      toast.success('Pago registrado correctamente');
    } catch (error) {
      toast.error('Error al agregar pago: ' + error.message);
    }
  };

  const deletePayment = async (paymentId) => {
    try {
      await deletePaymentFirestore(paymentId);
      toast.success('Pago eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar pago: ' + error.message);
    }
  };

  // ===== GASTOS =====
  const addExpense = async (expenseData) => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }
    try {
      await addExpenseFirestore(expenseData, userId);
      toast.success('Gasto agregado correctamente');
    } catch (error) {
      toast.error('Error al agregar gasto: ' + error.message);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await deleteExpenseFirestore(expenseId);
      toast.success('Gasto eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar gasto: ' + error.message);
    }
  };

  return {
    properties,
    tenants,
    payments,
    expenses,
    loading,
    addProperty,      // ← NUEVO
    editProperty,     // ← NUEVO
    deleteProperty,   // ← NUEVO
    addTenant,
    editTenant,
    deleteTenant,
    addPayment,
    deletePayment,
    addExpense,
    deleteExpense
  };
};
