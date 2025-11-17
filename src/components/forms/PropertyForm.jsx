import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const PropertyForm = ({ isOpen, onClose, onSubmit, property }) => {
  const [formData, setFormData] = useState({
    address: '',
    totalRooms: ''
  });

  useEffect(() => {
    if (property) {
      setFormData({
        address: property.address || '',
        totalRooms: property.totalRooms || ''
      });
    } else {
      setFormData({
        address: '',
        totalRooms: ''
      });
    }
  }, [property, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.address.trim()) {
      toast.error('La dirección es obligatoria');
      return;
    }

    if (!formData.totalRooms || formData.totalRooms < 1) {
      toast.error('Debe tener al menos 1 habitación');
      return;
    }

    onSubmit({
      ...formData,
      totalRooms: parseInt(formData.totalRooms)
    });

    setFormData({ address: '', totalRooms: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dirección <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          placeholder="Ej: Calle Falsa 123, Piso 2, Depto A"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cantidad de Habitaciones <span className="text-rose-500">*</span>
        </label>
        <input
          type="number"
          name="totalRooms"
          required
          min="1"
          value={formData.totalRooms}
          onChange={handleChange}
          placeholder="Ej: 5"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          Total de habitaciones disponibles para alquilar en esta propiedad
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
        >
          {property ? 'Guardar Cambios' : 'Agregar Propiedad'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
