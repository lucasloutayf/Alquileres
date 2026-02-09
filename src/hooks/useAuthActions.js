import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';

const googleProvider = new GoogleAuthProvider();

/**
 * Hook que encapsula toda la lógica de autenticación.
 * Retorna funciones para login, registro, reset de password, etc.
 */
export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  /**
   * Iniciar sesión con email y password.
   * @returns {{ success: boolean, needsVerification?: boolean }}
   */
  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar si el email está verificado
      if (!result.user.emailVerified) {
        await auth.signOut();
        return { success: false, needsVerification: true };
      }
      
      toast.success('¡Bienvenido!');
      return { success: true };
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
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar un nuevo usuario.
   * @returns {{ success: boolean }}
   */
  const register = async (email, password, confirmPassword) => {
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return { success: false };
    }
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return { success: false };
    }

    setLoading(true);
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Enviar email de verificación con URL personalizada
      await sendEmailVerification(result.user, {
        url: `${window.location.origin}/auth/action`,
        handleCodeInApp: true
      });
      
      // Cerrar sesión hasta que verifique
      await auth.signOut();
      
      toast.success('¡Cuenta creada! Revisa tu email');
      return { success: true };
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
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Iniciar sesión con Google.
   */
  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('¡Bienvenido!');
      return { success: true };
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
      return { success: false };
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Enviar email de recuperación de contraseña.
   */
  const resetPassword = async (email) => {
    if (!email) {
      toast.error('Ingresa tu email');
      return { success: false };
    }
    
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/action`,
        handleCodeInApp: true
      });
      return { success: true };
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
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reenviar email de verificación.
   */
  const resendVerification = async (email, password) => {
    if (!password) {
      toast.error('Ingresa tu contraseña para reenviar');
      return { success: false };
    }
    
    setLoading(true);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user, {
        url: `${window.location.origin}/auth/action`,
        handleCodeInApp: true
      });
      await auth.signOut();
      toast.success('Email de verificación reenviado');
      return { success: true };
    } catch {
      toast.error('Contraseña incorrecta');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    signInWithGoogle,
    resetPassword,
    resendVerification,
    loading,
    googleLoading
  };
};

export default useAuthActions;
