import React from 'react';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Confirmar acción', message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              variant="danger"
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
