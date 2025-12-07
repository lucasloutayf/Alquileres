import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de campana de notificaciones
 * Muestra un badge con el número de alertas y un dropdown con la lista
 */
const NotificationBell = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { overdue, upcoming, total, overdueCount } = notifications || { 
    overdue: [], 
    upcoming: [], 
    total: 0, 
    overdueCount: 0 
  };

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    navigate(`/property/${notification.propertyId}`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={`Notificaciones: ${total} alertas`}
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        
        {/* Badge */}
        {total > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold rounded-full ${
            overdueCount > 0 
              ? 'bg-red-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {total === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  No hay notificaciones
                </p>
              </div>
            ) : (
              <>
                {/* Overdue Section */}
                {overdue.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20">
                      <h4 className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Pagos Vencidos ({overdue.length})
                      </h4>
                    </div>
                    {overdue.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start gap-3 text-left transition-colors"
                      >
                        <span className={`mt-0.5 p-1.5 rounded-full ${getSeverityColor(notification.severity)}`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {notification.tenantName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hab. {notification.roomNumber} · {notification.monthsPending || notification.daysPending} {notification.monthsPending ? 'mes(es)' : 'días'} de atraso
                          </p>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            ${notification.amount?.toLocaleString('es-AR')}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Upcoming Section */}
                {upcoming.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Próximos Vencimientos ({upcoming.length})
                      </h4>
                    </div>
                    {upcoming.slice(0, 5).map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start gap-3 text-left transition-colors"
                      >
                        <span className="mt-0.5 p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20">
                          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {notification.tenantName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hab. {notification.roomNumber} · Vence en {notification.daysRemaining} días
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
