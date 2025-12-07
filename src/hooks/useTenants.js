import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getTenants, 
  addTenant as addTenantFirestore,
  updateTenant as updateTenantFirestore,
  deleteTenant as deleteTenantFirestore
} from '../firebase/firestore';

export const useTenants = (userId) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = getTenants(userId, (data) => {
      setTenants(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

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
      // El borrado en cascada de pagos ahora se maneja en el servidor (atomic)
      await deleteTenantFirestore(tenantId);
      toast.success('Inquilino eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar inquilino: ' + error.message);
    }
  };

  return {
    tenants,
    loading,
    addTenant,
    editTenant,
    deleteTenant
  };
};
