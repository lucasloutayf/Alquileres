import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

/**
 * Formulario de Login/Register con toggle entre ambos modos.
 * Incluye botón de Google y links a términos y privacidad.
 */
const LoginForm = ({
  isLogin,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  googleLoading,
  onSubmit,
  onGoogleSignIn,
  onForgotPassword,
  setView,
  GoogleIcon
}) => {
  return (
    <>
      {/* Botón de Google */}
      <button
        onClick={onGoogleSignIn}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {GoogleIcon}
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

      {/* Tabs Login/Register */}
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

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
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
              onClick={onForgotPassword}
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
          Al registrarte, aceptas nuestros{' '}
          <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Términos de Servicio</Link>
          {' '}y{' '}
          <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidad</Link>
        </p>
      )}
    </>
  );
};

export default LoginForm;
