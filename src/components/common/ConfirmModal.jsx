import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <p className="text-lg text-gray-900 dark:text-white mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
