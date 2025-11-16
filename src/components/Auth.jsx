import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebase/config';
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
      console.error('Error completo:', error);
      console.error('Código de error:', error.code);
      
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          toast.error(' Email o contraseña incorrectos');
          break;
        case 'auth/invalid-email':
          toast.error(' El formato del email es inválido');
          break;
        case 'auth/user-disabled':
          toast.error(' Esta cuenta ha sido deshabilitada');
          break;
        case 'auth/too-many-requests':
          toast.error(' Demasiados intentos fallidos. Intenta más tarde');
          break;
        case 'auth/network-request-failed':
          toast.error(' Error de conexión. Verifica tu internet');
          break;
        default:
          toast.error(` Error al iniciar sesión: ${error.message}`);
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
      console.error('Error completo:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error(' Este email ya está registrado. Intenta iniciar sesión.', { duration: 5000 });
          break;
        case 'auth/invalid-email':
          toast.error(' El formato del email es inválido');
          break;
        case 'auth/weak-password':
          toast.error(' La contraseña es muy débil. Usa al menos 6 caracteres');
          break;
        case 'auth/operation-not-allowed':
          toast.error(' El registro está deshabilitado. Contacta al soporte');
          break;
        case 'auth/network-request-failed':
          toast.error(' Error de conexión. Verifica tu internet');
          break;
        default:
          toast.error(` Error al crear la cuenta: ${error.message}`);
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
      toast.success('✅ Email de recuperación enviado. Revisa tu bandeja de entrada', { duration: 5000 });
    } catch (error) {
      console.error('Error completo:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error(' No existe una cuenta con este email');
          break;
        case 'auth/invalid-email':
          toast.error(' El formato del email es inválido');
          break;
        default:
          toast.error(' Error al enviar email de recuperación');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🏠 Gestor de Alquileres
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              isLogin
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              !isLogin
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-all shadow-lg hover:shadow-xl ${
              loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando...
              </span>
            ) : (
              isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
            )}
          </button>
        </form>

        {!isLogin && (
          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            Al registrarte, aceptas nuestros términos de servicio y política de privacidad
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
