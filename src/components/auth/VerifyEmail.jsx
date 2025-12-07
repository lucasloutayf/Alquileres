import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Button from '../common/Button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!oobCode) {
        setStatus('error');
        setErrorMessage('Link inválido o incompleto');
        return;
      }
      
      try {
        // Aplicar el código de verificación
        await applyActionCode(auth, oobCode);
        setStatus('success');
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        
        switch (error.code) {
          case 'auth/expired-action-code':
            setErrorMessage('El link ha expirado. Por favor solicita un nuevo email de verificación.');
            break;
          case 'auth/invalid-action-code':
            setErrorMessage('El link es inválido o ya fue utilizado.');
            break;
          default:
            setErrorMessage('Error al verificar el email. Intenta de nuevo.');
        }
      }
    };
    
    verifyEmail();
  }, [oobCode]);

  // Vista de carga
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
          <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Verificando email...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Por favor espera un momento
          </p>
        </div>
      </div>
    );
  }

  // Vista de error
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error de Verificación
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {errorMessage}
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ¡Email Verificado!
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
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
};

export default VerifyEmail;
