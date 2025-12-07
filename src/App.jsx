import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Layout from './components/layout/Layout';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import { initGA, logPageView } from './utils/analytics';

// Lazy loading de vistas para code splitting
const Dashboard = lazy(() => import('./components/views/Dashboard'));
const PropertyDetail = lazy(() => import('./components/views/PropertyDetail'));
const DebtorsView = lazy(() => import('./components/views/DebtorsView'));
const VacantRoomsView = lazy(() => import('./components/views/VacantRoomsView'));
const CalendarView = lazy(() => import('./components/views/CalendarView'));
const MonthlyIncomeView = lazy(() => import('./components/views/MonthlyIncomeView'));
const ExpensesView = lazy(() => import('./components/views/ExpensesView'));
const TermsOfService = lazy(() => import('./components/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy'));

// Componente de carga para Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
    </div>
  </div>
);

// Componente que maneja las acciones de Firebase (reset password, verify email)
const AuthActionHandler = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  
  // Si es resetPassword, mostrar la página de cambio de contraseña
  if (mode === 'resetPassword') {
    return <ResetPassword />;
  }
  
  // Si es verifyEmail, mostrar la página de verificación
  if (mode === 'verifyEmail') {
    return <VerifyEmail />;
  }
  
  // Para otros modos, redirigir al login
  return <Navigate to="/" replace />;
};

// Componente interno que maneja las rutas autenticadas
const ProtectedRoutes = ({ user, theme }) => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Dashboard user={user} theme={theme} />} />
        <Route path="/property/:id" element={<PropertyDetail user={user} />} />
        <Route path="/debtors" element={<DebtorsView user={user} />} />
        <Route path="/vacant" element={<VacantRoomsView user={user} />} />
        <Route path="/calendar" element={<CalendarView user={user} />} />
        <Route path="/income" element={<MonthlyIncomeView user={user} theme={theme} />} />
        <Route path="/expenses" element={<ExpensesView user={user} theme={theme} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

// Componente interno que usa el contexto de autenticación
const AppContent = () => {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState('light');
  const location = useLocation();

  // Inicializar Google Analytics
  useEffect(() => {
    initGA();
  }, []);

  // Registrar vistas de página
  useEffect(() => {
    logPageView(location.pathname);
  }, [location]);

  // Aplicar tema
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Pantalla de carga inicial
  if (loading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rutas públicas (accesibles sin login) */}
        <Route path="/auth/action" element={<AuthActionHandler />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        {/* Rutas protegidas o login */}
        <Route path="/*" element={
          user ? (
            <Layout user={user} theme={theme} toggleTheme={toggleTheme}>
              <ProtectedRoutes user={user} theme={theme} />
            </Layout>
          ) : (
            <Auth />
          )
        } />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
