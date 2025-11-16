import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const PropertyForm = ({ isOpen, onClose, onSubmit, property }) => {
  const [formData, setFormData] = useState({
    address: '',
    totalRooms: ''
  });

  // Si hay una propiedad (modo edición), cargar sus datos
  useEffect(() => {
    if (property) {
      setFormData({
        address: property.address || '',
        totalRooms: property.totalRooms || ''
      });
    } else {
      // Resetear formulario si no hay propiedad (modo crear)
      setFormData({
        address: '',
        totalRooms: ''
      });
    }
  }, [property, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.address.trim()) {
      toast.error('La dirección es obligatoria');
      return;
    }

    if (!formData.totalRooms || formData.totalRooms < 1) {
      toast.error('Debe tener al menos 1 habitación');
      return;
    }

    // Enviar datos
    onSubmit({
      ...formData,
      totalRooms: parseInt(formData.totalRooms)
    });

    // Resetear y cerrar
    setFormData({ address: '', totalRooms: '' });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={property ? 'Editar Propiedad' : 'Agregar Propiedad'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Dirección *
          </label>
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            placeholder="Ej: Calle Falsa 123"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Cantidad de habitaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cantidad de Habitaciones *
          </label>
          <input
            type="number"
            name="totalRooms"
            required
            min="1"
            value={formData.totalRooms}
            onChange={handleChange}
            placeholder="Ej: 5"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {property ? 'Guardar Cambios' : 'Agregar Propiedad'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PropertyForm;
