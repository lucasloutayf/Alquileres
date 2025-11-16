import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useFirestore } from './hooks/useFirestore';
import Login from './components/Login';
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

  const {
    properties,
    tenants,
    payments,
    expenses,
    loading,
    addTenant,
    editTenant,
    deleteTenant,
    addPayment,
    deletePayment,
    addExpense,
    deleteExpense
  } = useFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
      <Toaster position="top-right" />  {/* ← AGREGÁ ESTA LÍNEA */}
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
