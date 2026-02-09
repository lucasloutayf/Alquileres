import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

// Inicializar Sentry solo en producción
export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.log('Sentry no configurado (falta VITE_SENTRY_DSN)');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Solo en producción
    enabled: import.meta.env.PROD,
    
    // Entorno
    environment: import.meta.env.MODE,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Capturar 10% de sesiones normales, 100% de sesiones con errores
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% de transacciones
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% de sesiones normales
    replaysOnErrorSampleRate: 1.0, // 100% de sesiones con errores
    
    // Filtrar errores no relevantes
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Ignorar errores de red comunes
      if (error?.message?.includes('Network request failed')) {
        return null;
      }
      
      // Ignorar errores de Firebase auth comunes
      if (error?.code?.startsWith('auth/')) {
        return null;
      }
      
      return event;
    },
  });
};

// Capturar error manualmente
export const captureError = (error, context = {}) => {
  if (!SENTRY_DSN) return;
  
  Sentry.captureException(error, {
    extra: context,
  });
};

// Capturar mensaje/evento
export const captureMessage = (message, level = 'info') => {
  if (!SENTRY_DSN) return;
  
  Sentry.captureMessage(message, level);
};

// Agregar contexto de usuario
export const setUser = (user) => {
  if (!SENTRY_DSN) return;
  
  if (user) {
    Sentry.setUser({
      id: user.uid,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Error Boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Exportar Sentry para uso directo si es necesario
export { Sentry };
