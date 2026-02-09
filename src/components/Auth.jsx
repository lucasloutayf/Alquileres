import React, { useState } from 'react';
import { useAuthActions } from '../hooks/useAuthActions';
import AuthCard from './auth/AuthCard';
import LoginForm from './auth/LoginForm';
import ResetPasswordForm from './auth/ResetPasswordForm';
import ResetPasswordSent from './auth/ResetPasswordSent';
import VerifyEmailPending from './auth/VerifyEmailPending';

// Icono de Google (SVG inline para evitar dependencias externas)
const GoogleIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/**
 * Componente principal de autenticación.
 * Orquesta las diferentes vistas: login, register, reset, reset-sent, verify-email.
 * La lógica de autenticación está en el hook useAuthActions.
 */
const Auth = () => {
  // Estados de vista: 'login' | 'register' | 'reset' | 'reset-sent' | 'verify-email'
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { 
    login, 
    register, 
    signInWithGoogle, 
    resetPassword, 
    resendVerification,
    loading, 
    googleLoading 
  } = useAuthActions();

  // Handlers que conectan los componentes con el hook
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.needsVerification) {
      setRegisteredEmail(email);
      setView('verify-email');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register(email, password, confirmPassword);
    
    if (result.success) {
      setRegisteredEmail(email);
      setView('verify-email');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const result = await resetPassword(email);
    
    if (result.success) {
      setRegisteredEmail(email);
      setView('reset-sent');
    }
  };

  const handleResendVerification = async () => {
    await resendVerification(registeredEmail, password);
  };

  // ===========================================
  // VISTA: Email de recuperación enviado
  // ===========================================
  if (view === 'reset-sent') {
    return (
      <ResetPasswordSent
        email={registeredEmail}
        onBackToLogin={() => {
          setView('login');
          setEmail('');
          setPassword('');
        }}
        onUseAnotherEmail={() => setView('reset')}
      />
    );
  }

  // ===========================================
  // VISTA: Verificación de email pendiente
  // ===========================================
  if (view === 'verify-email') {
    return (
      <VerifyEmailPending
        email={registeredEmail}
        password={password}
        setPassword={setPassword}
        onBackToLogin={() => {
          setView('login');
          setEmail(registeredEmail);
          setPassword('');
        }}
        onResend={handleResendVerification}
        loading={loading}
      />
    );
  }

  // ===========================================
  // VISTA: Recuperar contraseña
  // ===========================================
  if (view === 'reset') {
    return (
      <ResetPasswordForm
        email={email}
        setEmail={setEmail}
        onSubmit={handleResetPassword}
        onBack={() => setView('login')}
        loading={loading}
      />
    );
  }

  // ===========================================
  // VISTA: Login / Register (principal)
  // ===========================================
  const isLogin = view === 'login';

  return (
    <AuthCard 
      subtitle={isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratis'}
    >
      <LoginForm
        isLogin={isLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        loading={loading}
        googleLoading={googleLoading}
        onSubmit={isLogin ? handleLogin : handleRegister}
        onGoogleSignIn={signInWithGoogle}
        onForgotPassword={() => setView('reset')}
        setView={setView}
        GoogleIcon={GoogleIcon}
      />
    </AuthCard>
  );
};

export default Auth;
