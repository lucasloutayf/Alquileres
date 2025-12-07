import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Layout from './components/layout/Layout';

// Lazy loading de vistas para code splitting
const Dashboard = lazy(() => import('./components/views/Dashboard'));
const PropertyDetail = lazy(() => import('./components/views/PropertyDetail'));
const DebtorsView = lazy(() => import('./components/views/DebtorsView'));
const VacantRoomsView = lazy(() => import('./components/views/VacantRoomsView'));
const CalendarView = lazy(() => import('./components/views/CalendarView'));
const MonthlyIncomeView = lazy(() => import('./components/views/MonthlyIncomeView'));
const ExpensesView = lazy(() => import('./components/views/ExpensesView'));

// Componente de carga para Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
    </div>
  </div>
);

// Componente interno que usa el contexto de autenticación
const AppContent = () => {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState('light');

  // Aplicar tema
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Pantalla de carga inicial
  if (loading) {
    return <PageLoader />;
  }

  // Pantalla de login/registro
  if (!user) {
    return <Auth />;
  }

  // App principal
  return (
    <BrowserRouter>
      <Layout user={user} theme={theme} toggleTheme={toggleTheme}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <Dashboard user={user} theme={theme} />
            } />
            
            <Route path="/property/:id" element={
              <PropertyDetail user={user} />
            } />
            
            <Route path="/debtors" element={
              <DebtorsView user={user} />
            } />
            
            <Route path="/vacant" element={
              <VacantRoomsView user={user} />
            } />
            
            <Route path="/calendar" element={
              <CalendarView user={user} />
            } />
            
            <Route path="/income" element={
              <MonthlyIncomeView user={user} theme={theme} />
            } />
            
            <Route path="/expenses" element={
              <ExpensesView user={user} theme={theme} />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
};

const App = () => {
  return (
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
  );
};

export default App;

