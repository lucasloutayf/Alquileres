import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getProperties, 
  addProperty as addPropertyFirestore,
  updateProperty as updatePropertyFirestore,
  deleteProperty as deletePropertyFirestore
} from '../firebase/firestore';

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
      // Nota: La validación de inquilinos activos debe hacerse en el componente
      // antes de llamar a esta función, ya que este hook no conoce a los inquilinos.
      await deletePropertyFirestore(propertyId);
      toast.success('Propiedad eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar propiedad: ' + error.message);
    }
  };

  return {
    properties,
    loading,
    addProperty,
    editProperty,
    deleteProperty
  };
};
