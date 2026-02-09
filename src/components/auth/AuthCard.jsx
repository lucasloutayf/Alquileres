import React from 'react';
import { Building2 } from 'lucide-react';

/**
 * Card container compartido para todas las vistas de autenticación.
 * Proporciona el layout y estilos consistentes.
 */
const AuthCard = ({ 
  children, 
  title = 'Gestor de Alquileres',
  subtitle 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 dark:bg-white rounded-lg mb-4">
            <Building2 className="w-6 h-6 text-white dark:text-gray-900" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
