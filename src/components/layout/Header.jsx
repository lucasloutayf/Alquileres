import React, { useState, useEffect } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Sun, 
  Moon, 
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import NotificationBell from '../common/NotificationBell';
import { useNotifications } from '../../hooks/useNotifications';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';

import { useTranslation } from 'react-i18next'; // Importar hook

const Header = ({ user, theme, toggleTheme }) => {
  const { t } = useTranslation(); // Hook de traducción
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hooks para notificaciones
  const { tenants } = useTenants(user?.uid);
  const { allPayments } = usePayments(user?.uid);
  const notifications = useNotifications(tenants, allPayments);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Navigation Items Configuration
  const navItems = [
    { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/' },
    { name: t('nav.debtors'), icon: AlertCircle, path: '/debtors' },
    { name: t('nav.rooms'), icon: Home, path: '/vacant' },
    { name: t('nav.income'), icon: TrendingUp, path: '/income' },
    { name: t('nav.expenses'), icon: TrendingDown, path: '/expenses' },
    { name: t('nav.calendar'), icon: Calendar, path: '/calendar' },
    { name: t('nav.settings'), icon: Settings, path: '/settings' }
  ];

  // Helper to check active state
  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path;
  };

  return (
    <>
      <header 
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-all duration-300 h-16",
          "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
          scrolled && "shadow-sm"
        )}
      >
        {/* Wrapper interno con padding responsivo */}
        <div className="w-full h-full px-3 xl:px-4 flex items-center justify-between">
            
            {/* SECCIÓN IZQUIERDA: Hamburguesa (Mobile/Tablet) + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button - Visible hasta 1280px (xl) */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                aria-label={t('nav.menu')}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-6 h-6 text-emerald-600 dark:text-emerald-500 transition-all" />
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  Rentyo
                </span>
              </Link>
            </div>
            
            {/* SECCIÓN CENTRO - Navegación Desktop (Visible solo desde xl: 1280px) */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                      active 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            {/* SECCIÓN DERECHA - Acciones */}
            <div className="flex items-center gap-2 xl:gap-3">
              
              {/* Notificaciones */}
              <NotificationBell notifications={notifications} />
              
              {/* Perfil */}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                {/* Texto: Visible solo en desktop grande (xl) */}
                <div className="hidden xl:block text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100 leading-none">
                    {user?.email ? user.email.split('@')[0] : t('common.admin')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('common.admin')}</p>
                </div>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:rotate-12"
                aria-label={t('nav.theme')}
              >
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-2 xl:px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium text-sm"
                aria-label={t('nav.logout')}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">{t('nav.logout')}</span>
              </button>
              
            </div>
        </div>
      </header>

      {/* Mobile/Tablet Menu Overlay & Backdrop (Visible < 1280px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="xl:hidden fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden fixed inset-x-0 top-16 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl"
            >
              <nav className="flex flex-col p-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
