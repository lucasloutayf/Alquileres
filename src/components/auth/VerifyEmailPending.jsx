import React from 'react';
import { Mail } from 'lucide-react';
import Button from '../common/Button';

/**
 * Vista de verificación de email pendiente con opción de reenvío.
 */
const VerifyEmailPending = ({ 
  email, 
  password,
  setPassword,
  onBackToLogin, 
  onResend,
  loading 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
          <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verifica tu email
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Enviamos un link de verificación a:
        </p>
        
        <p className="font-medium text-gray-900 dark:text-white mb-6">
          {email}
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Haz clic en el link del email para verificar tu cuenta.
          También revisa la carpeta de spam.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={onBackToLogin}
            variant="primary"
            className="w-full"
          >
            Ya verifiqué, iniciar sesión
          </Button>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              ¿No recibiste el email? Ingresa tu contraseña para reenviar:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="flex-1"
              />
              <Button
                onClick={onResend}
                variant="secondary"
                disabled={loading}
              >
                {loading ? '...' : 'Reenviar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPending;
