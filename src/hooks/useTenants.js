import { useState, useEffect } from 'react';
import {
  getTenants,
  addTenant as addTenantFirestore,
  updateTenant as updateTenantFirestore,
  deleteTenant as deleteTenantFirestore
} from '../firebase/firestore';
import { runFirestoreAction } from '../utils/firestoreActions';

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

  const addTenant = (tenantData) =>
    runFirestoreAction(() => addTenantFirestore(tenantData, userId), {
      userId,
      successMsg: 'Inquilino agregado correctamente',
      errorMsg: 'Error al agregar inquilino',
    });

  const editTenant = (updatedTenant) => {
    const { id, ...data } = updatedTenant;
    return runFirestoreAction(() => updateTenantFirestore(id, data), {
      successMsg: 'Inquilino actualizado correctamente',
      errorMsg: 'Error al editar inquilino',
    });
  };

  const deleteTenant = (tenantId) =>
    runFirestoreAction(() => deleteTenantFirestore(tenantId), {
      successMsg: 'Inquilino eliminado correctamente',
      errorMsg: 'Error al eliminar inquilino',
    });

  return {
    tenants,
    loading,
    addTenant,
    editTenant,
    deleteTenant
  };
};
