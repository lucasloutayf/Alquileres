import React from 'react';
import { Mail } from 'lucide-react';
import Button from '../common/Button';

/**
 * Vista de confirmación cuando el email de recuperación fue enviado.
 */
const ResetPasswordSent = ({ 
  email, 
  onBackToLogin, 
  onUseAnotherEmail 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Revisa tu email
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Enviamos instrucciones para restablecer tu contraseña a:
        </p>
        
        <p className="font-medium text-gray-900 dark:text-white mb-6">
          {email}
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Si no ves el email, revisa tu carpeta de spam o correo no deseado.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={onBackToLogin}
            variant="primary"
            className="w-full"
          >
            Volver a iniciar sesión
          </Button>
          
          <button
            onClick={onUseAnotherEmail}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Usar otro email
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordSent;
