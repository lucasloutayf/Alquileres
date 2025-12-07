import React, { useState } from 'react';
import { Building2, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/config';
import Button from './common/Button';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';

const googleProvider = new GoogleAuthProvider();

const Auth = () => {
  // Estados de vista: 'login' | 'register' | 'reset' | 'reset-sent' | 'verify-email'
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar si el email está verificado
      if (!result.user.emailVerified) {
        toast.error('Por favor verifica tu email antes de iniciar sesión');
        await auth.signOut();
        setRegisteredEmail(email);
        setView('verify-email');
        return;
      }
      
      toast.success('¡Bienvenido!');
    } catch (error) {
      logger.error('Auth error:', error.code);
      
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
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
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Enviar email de verificación
      await sendEmailVerification(result.user);
      
      // Cerrar sesión hasta que verifique
      await auth.signOut();
      
      setRegisteredEmail(email);
      setView('verify-email');
      toast.success('¡Cuenta creada! Revisa tu email');
    } catch (error) {
      logger.error('Auth error:', error.code);
      
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('¡Bienvenido!');
    } catch (error) {
      logger.error('Google auth error:', error.code);
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
          // Usuario cerró el popup, no mostrar error
          break;
        case 'auth/popup-blocked':
          toast.error('El popup fue bloqueado. Permite popups para continuar');
          break;
        default:
          toast.error('Error al iniciar sesión con Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Ingresa tu email');
      return;
    }
    
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/action`, // URL de nuestra página de reset
        handleCodeInApp: true
      });
      setRegisteredEmail(email);
      setView('reset-sent');
    } catch (error) {
      logger.error('Reset password error:', error.code);
      
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('No existe una cuenta con este email');
          break;
        case 'auth/invalid-email':
          toast.error('El formato del email es inválido');
          break;
        case 'auth/too-many-requests':
          toast.error('Demasiados intentos. Intenta más tarde');
          break;
        default:
          toast.error('Error al enviar email: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!password) {
      toast.error('Ingresa tu contraseña para reenviar');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await signInWithEmailAndPassword(auth, registeredEmail, password);
      await sendEmailVerification(result.user);
      await auth.signOut();
      toast.success('Email de verificación reenviado');
    } catch (error) {
      toast.error('Contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // VISTA: Email de recuperación enviado
  // ===========================================
  if (view === 'reset-sent') {
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
            {registeredEmail}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Si no ves el email, revisa tu carpeta de spam o correo no deseado.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                setView('login');
                setEmail('');
                setPassword('');
              }}
              variant="primary"
              className="w-full"
            >
              Volver a iniciar sesión
            </Button>
            
            <button
              onClick={() => setView('reset')}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Usar otro email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // VISTA: Verificación de email pendiente
  // ===========================================
  if (view === 'verify-email') {
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
            {registeredEmail}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Haz clic en el link del email para verificar tu cuenta.
            También revisa la carpeta de spam.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={() => {
                setView('login');
                setEmail(registeredEmail);
                setPassword('');
              }}
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
                  onClick={handleResendVerification}
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
  }

  // ===========================================
  // VISTA: Recuperar contraseña
  // ===========================================
  if (view === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full">
          <button
            onClick={() => setView('login')}
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
          
          <form onSubmit={handleResetPassword} className="space-y-4">
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
  }

  // ===========================================
  // VISTA: Login / Register (principal)
  // ===========================================
  const isLogin = view === 'login';

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

        {/* Botón de Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-gray-700 dark:text-gray-200 font-medium">
            {googleLoading ? 'Conectando...' : 'Continuar con Google'}
          </span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              o continúa con email
            </span>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
          <button
            onClick={() => setView('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              isLogin
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setView('register')}
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
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setView('reset')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
