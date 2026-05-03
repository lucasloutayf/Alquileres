import { useState, useEffect } from 'react';
import {
  getProperties,
  addProperty as addPropertyFirestore,
  updateProperty as updatePropertyFirestore,
  deleteProperty as deletePropertyFirestore
} from '../firebase/firestore';
import { runFirestoreAction } from '../utils/firestoreActions';

export const useProperties = (userId) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = getProperties(userId, (data) => {
      setProperties(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addProperty = (propertyData) =>
    runFirestoreAction(() => addPropertyFirestore(propertyData, userId), {
      userId,
      successMsg: 'Propiedad agregada correctamente',
      errorMsg: 'Error al agregar propiedad',
    });

  const editProperty = (propertyData) => {
    const { id, ...data } = propertyData;
    return runFirestoreAction(() => updatePropertyFirestore(id, data), {
      successMsg: 'Propiedad actualizada correctamente',
      errorMsg: 'Error al editar propiedad',
    });
  };

  const deleteProperty = (propertyId) =>
    runFirestoreAction(() => deletePropertyFirestore(propertyId), {
      successMsg: 'Propiedad eliminada correctamente',
      errorMsg: 'Error al eliminar propiedad',
    });

  return {
    properties,
    loading,
    addProperty,
    editProperty,
    deleteProperty
  };
};
