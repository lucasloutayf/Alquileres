import React from 'react';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

/**
 * Formulario para solicitar recuperación de contraseña.
 * Muestra un campo de email y envía el link de reset.
 */
const ResetPasswordForm = ({ 
  email, 
  setEmail, 
  onSubmit, 
  onBack, 
  loading 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
            <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Recuperar contraseña
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Te enviaremos un email con instrucciones para restablecer tu contraseña
          </p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              autoFocus
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Enviando...' : 'Enviar email de recuperación'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
