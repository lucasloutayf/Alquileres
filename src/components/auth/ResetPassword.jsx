import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { KeyRound, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  // Obtener el código de acción de la URL
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  // Verificar que sea una acción de reset password
  React.useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode || mode !== 'resetPassword') {
        setError('Link inválido o expirado');
        return;
      }
      
      try {
        // Verificar que el código sea válido y obtener el email
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
      } catch (err) {
        console.error('Error verifying code:', err);
        setError('El link ha expirado o ya fue utilizado. Por favor solicita un nuevo email de recuperación.');
      }
    };
    
    verifyCode();
  }, [oobCode, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      toast.success('¡Contraseña actualizada!');
    } catch (err) {
      console.error('Error resetting password:', err);
      
      switch (err.code) {
        case 'auth/expired-action-code':
          setError('El link ha expirado. Por favor solicita un nuevo email de recuperación.');
          break;
        case 'auth/invalid-action-code':
          setError('El link es inválido o ya fue utilizado.');
          break;
        case 'auth/weak-password':
          toast.error('La contraseña es muy débil');
          break;
        default:
          setError('Error al cambiar la contraseña. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Vista de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Link Inválido
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            className="w-full"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  // Vista de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ¡Contraseña Actualizada!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            className="w-full"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  // Vista principal de cambio de contraseña
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
            <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Nueva Contraseña
          </h2>
          {email && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Para la cuenta: <span className="font-medium">{email}</span>
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Mínimo 6 caracteres
            </p>
          </div>
          
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirm-new-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
