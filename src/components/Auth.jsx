import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import Button from './common/Button';
import toast from 'react-hot-toast';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('¡Bienvenido!');
      onLogin();
    } catch (error) {
      console.error('Error:', error.code);
      
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          toast.error('Email o contraseña incorrectos');
          break;
        case 'auth/invalid-email':
          toast.error('El formato del email es inválido');
          break;
        case 'auth/user-disabled':
          toast.error('Esta cuenta ha sido deshabilitada');
          break;
        case 'auth/too-many-requests':
          toast.error('Demasiados intentos fallidos. Intenta más tarde');
          break;
        default:
          toast.error('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
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
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('¡Cuenta creada exitosamente!');
      onLogin();
    } catch (error) {
      console.error('Error:', error.code);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('Este email ya está registrado');
          break;
        case 'auth/invalid-email':
          toast.error('El formato del email es inválido');
          break;
        case 'auth/weak-password':
          toast.error('La contraseña es muy débil');
          break;
        default:
          toast.error('Error al crear la cuenta');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Ingresa tu email primero');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperación enviado');
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('No existe una cuenta con este email');
          break;
        default:
          toast.error('Error al enviar email de recuperación');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 dark:bg-white rounded-lg mb-4">
            <Building2 className="w-6 h-6 text-white dark:text-gray-900" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Gestor de Alquileres
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
  <button
    onClick={() => setIsLogin(true)}
    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
      isLogin
        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}
  >
    Iniciar Sesión
  </button>
  <button
    onClick={() => setIsLogin(false)}
    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
      !isLogin
        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}
  >
    Registrarse
  </button>
</div>


        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </Button>
        </form>

        {!isLogin && (
          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            Al registrarte, aceptas nuestros términos de servicio
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
