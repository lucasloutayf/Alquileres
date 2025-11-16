import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useFirestore } from './hooks/useFirestore';
import Auth from './components/Auth';
import Header from './components/layout/Header';
import Dashboard from './components/views/Dashboard';
import PropertyDetail from './components/views/PropertyDetail';
import DebtorsView from './components/views/DebtorsView';
import VacantRoomsView from './components/views/VacantRoomsView';
import MonthlyIncomeView from './components/views/MonthlyIncomeView';
import ExpensesView from './components/views/ExpensesView';
import CalendarView from './components/views/CalendarView';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [theme, setTheme] = useState('light');

  // Hook de Firestore - ahora recibe el userId
  const {
    properties,
    tenants,
    payments,
    expenses,
    loading,
    addProperty,      
    editProperty,
    deleteProperty,
    addTenant,
    editTenant,
    deleteTenant,
    addPayment,
    deletePayment,
    addExpense,
    deleteExpense
  } = useFirestore(user?.uid);

  // Listener de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Aplicar tema
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const renderContent = () => {
    switch(view) {
      case 'dashboard':
  return (
    <Dashboard 
      properties={properties} 
      tenants={tenants} 
      payments={payments} 
      expenses={expenses} 
      onSelectProperty={(id) => { 
        setSelectedPropertyId(id); 
        setView('propertyDetail'); 
      }}
      onAddProperty={addProperty}      // ← USAR FUNCIÓN DEL HOOK
      onEditProperty={editProperty}    // ← USAR FUNCIÓN DEL HOOK
      onDeleteProperty={deleteProperty} // ← USAR FUNCIÓN DEL HOOK
    />
  );


      
      case 'propertyDetail':
        const property = properties.find(p => p.id === selectedPropertyId);
        return (
          <PropertyDetail 
            property={property} 
            tenants={tenants} 
            payments={payments} 
            expenses={expenses} 
            onBack={() => setView('dashboard')} 
            onAddTenant={addTenant} 
            onEditTenant={editTenant} 
            onDeleteTenant={deleteTenant} 
            onAddPayment={addPayment}
            onDeletePayment={deletePayment}
            onAddExpense={addExpense} 
            onDeleteExpense={deleteExpense} 
          />
        );
      
      case 'debtors':
        return (
          <DebtorsView 
            tenants={tenants} 
            payments={payments} 
            onBack={() => setView('dashboard')} 
          />
        );
      
      case 'vacant':
        return (
          <VacantRoomsView 
            properties={properties} 
            tenants={tenants} 
            onBack={() => setView('dashboard')} 
          />
        );
      
      case 'calendar':
        return (
          <CalendarView 
            tenants={tenants} 
            payments={payments} 
            properties={properties} 
            onBack={() => setView('dashboard')} 
          />
        );
      
      case 'income':
        return (
          <MonthlyIncomeView 
            payments={payments} 
            tenants={tenants}
            expenses={expenses}
            properties={properties}
            onBack={() => setView('dashboard')} 
          />
        );
      
      case 'expenses':
        return (
          <ExpensesView 
            expenses={expenses} 
            properties={properties} 
            onBack={() => setView('dashboard')} 
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
          />
        );
      
      default:
        return (
          <Dashboard 
            properties={properties} 
            tenants={tenants} 
            payments={payments} 
            expenses={expenses} 
            onSelectProperty={(id) => { 
              setSelectedPropertyId(id); 
              setView('propertyDetail'); 
            }} 
          />
        );
    }
  };

  // Pantalla de carga
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Pantalla de login/registro
  if (!user) {
    return (
      <>
        {/* ← TOASTER PARA LOGIN/REGISTRO */}
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
        <Auth onLogin={() => {}} />
      </>
    );
  }

  // App principal
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
      {/* ← TOASTER PARA APP AUTENTICADA */}
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
      <Header 
        user={user} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        view={view} 
        setView={setView} 
      />
      <main className="p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
