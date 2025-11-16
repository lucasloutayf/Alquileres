import React, { useState } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Home, 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

const Header = ({ user, theme, toggleTheme, view, setView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'debtors', label: 'Deudores', icon: AlertTriangle },
    { key: 'vacant', label: 'Habitaciones', icon: Home },
    { key: 'income', label: 'Ingresos', icon: DollarSign },
    { key: 'expenses', label: 'Gastos', icon: TrendingDown },
    { key: 'calendar', label: 'Calendario', icon: Calendar },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <h1 className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
            Gestor de Alquileres
          </h1>
          
          {/* Navegación desktop */}
          <nav className="hidden lg:flex gap-2 flex-1 justify-center">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.key}
                  onClick={() => setView(item.key)} 
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Botones de la derecha */}
          <div className="flex items-center gap-2">
            <span className="hidden xl:block text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </span>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? 
                <Moon className="w-5 h-5" /> :
                <Sun className="w-5 h-5" />
              }
            </button>

            <button 
              onClick={handleLogout} 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>

            {/* Botón hamburguesa */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil/tablet desplegable */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <nav className="flex flex-col p-2">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.key}
                  onClick={() => { setView(item.key); setMobileMenuOpen(false); }} 
                  className="flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
