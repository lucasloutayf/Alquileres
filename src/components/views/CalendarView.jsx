import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, ArrowLeft } from 'lucide-react';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';
import { useProperties } from '../../hooks/useProperties';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const CalendarView = ({ user }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { tenants, loading: tenantsLoading } = useTenants(user?.uid);
  const { payments, loading: paymentsLoading } = usePayments(user?.uid);
  const { properties, loading: propertiesLoading } = useProperties(user?.uid);

  const loading = tenantsLoading || paymentsLoading || propertiesLoading;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);

  // Calcular vencimientos basándose en el dueDate de los pagos
  const vencimientos = useMemo(() => {
    if (!tenants || !payments) return [];

    return tenants
      .filter(t => t.contractStatus === 'activo')
      .filter(t => selectedProperty === 'all' || t.propertyId === selectedProperty)
      .map(tenant => {
        const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
        
        let nextDueDate;
        let lastPayment = null;
        
        if (tenantPayments.length === 0) {
          // Sin pagos: el primer vencimiento es 30 días después de la entrada
          nextDueDate = new Date(tenant.entryDate);
          nextDueDate.setDate(nextDueDate.getDate() + 30);
        } else {
          // Con pagos: ordenar por dueDate (el más reciente primero)
          const sortedByDueDate = [...tenantPayments].sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.date);
            const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.date);
            return dateB - dateA;
          });
          
          const lastPaymentData = sortedByDueDate[0];
          lastPayment = new Date(lastPaymentData.date);
          
          // Usar directamente el dueDate del último pago (la fecha de vencimiento registrada)
          if (lastPaymentData.dueDate) {
            nextDueDate = new Date(lastPaymentData.dueDate);
          } else {
            // Fallback si no tiene dueDate: usar fecha del pago
            nextDueDate = new Date(lastPayment);
          }
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDueDate.setHours(0, 0, 0, 0);
        
        const daysUntilDue = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));
        
        return {
          tenant,
          dueDate: nextDueDate,
          lastPayment,
          isOverdue: daysUntilDue < 0,
          daysUntilDue
        };
      });
  }, [tenants, payments, selectedProperty]);

  // Obtener días del mes actual
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días vacíos antes del primer día
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const vencimientosDelDia = vencimientos.filter(v => {
        const vDate = new Date(v.dueDate);
        vDate.setHours(0, 0, 0, 0);
        return vDate.getTime() === date.getTime();
      });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      days.push({
        day,
        date,
        vencimientos: vencimientosDelDia,
        isToday: date.getTime() === today.getTime()
      });
    }
    
    return days;
  }, [currentDate, vencimientos]);

  const monthName = currentDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const sortedVencimientos = useMemo(() => {
    return [...vencimientos].sort((a, b) => a.dueDate - b.dueDate);
  }, [vencimientos]);

  const getStatusColor = (vencimiento) => {
    if (vencimiento.isOverdue) return 'bg-red-500';
    if (vencimiento.daysUntilDue <= 5) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStatusText = (vencimiento) => {
    if (vencimiento.isOverdue) {
      return `${t('calendar.status.overdue')} (${Math.abs(vencimiento.daysUntilDue)} ${t('calendar.status.daysRemaining')})`;
    }
    if (vencimiento.daysUntilDue === 0) return t('calendar.status.dueToday');
    return `${vencimiento.daysUntilDue} ${t('calendar.status.daysRemaining')}`;
  };

  const getStatusTextColor = (vencimiento) => {
    if (vencimiento.isOverdue) return 'text-red-600 dark:text-red-400';
    if (vencimiento.daysUntilDue <= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CalendarIcon className="w-7 h-7 text-emerald-500" />
              {t('calendar.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('calendar.subtitle')}
            </p>
          </div>
        </div>

        {/* Filtro de propiedad */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedProperty}
            onChange={e => setSelectedProperty(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
          >
            <option value="all">{t('calendar.allProperties')}</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>{prop.address}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Navegación del mes */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => changeMonth(-1)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> {t('calendar.previous')}
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
            {monthName}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {t('calendar.next')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid del calendario */}
        <div className="p-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {(t('calendar.weekdays', { returnObjects: true }) || []).map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayData, index) => {
              if (!dayData) {
                return <div key={`empty-${index}`} className="aspect-square"></div>;
              }

              const hasVencimientos = dayData.vencimientos.length > 0;
              const hasOverdue = dayData.vencimientos.some(v => v.isOverdue);
              const hasUrgent = dayData.vencimientos.some(v => v.daysUntilDue <= 5 && !v.isOverdue);

              return (
                <button
                  key={dayData.day}
                  onClick={() => setSelectedDay(dayData)}
                  className={`
                    aspect-square rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all
                    border hover:scale-105 hover:shadow-md
                    ${dayData.isToday 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                    }
                    ${hasOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : ''}
                    ${hasUrgent && !hasOverdue ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' : ''}
                    ${selectedDay?.day === dayData.day ? 'ring-2 ring-emerald-500' : ''}
                  `}
                >
                  <span className={`text-sm font-bold ${dayData.isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {dayData.day}
                  </span>

                  {hasVencimientos && (
                    <div className="flex gap-1 flex-wrap">
                      {dayData.vencimientos.slice(0, 3).map((v, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${getStatusColor(v)}`}
                        />
                      ))}
                      {dayData.vencimientos.length > 3 && (
                        <span className="text-[10px] text-gray-500">+{dayData.vencimientos.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel inferior con lista y detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de próximos vencimientos */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-500" />
            {t('calendar.upcoming')} ({sortedVencimientos.length})
          </h3>
          
          {sortedVencimientos.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('calendar.noUpcoming')}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sortedVencimientos.map((vencimiento, index) => {
                const prop = properties.find(p => p.id === vencimiento.tenant.propertyId);
                return (
                  <div
                    key={index}
                    className={`
                      p-4 rounded-lg border transition-all hover:shadow-md flex justify-between items-center
                      ${vencimiento.isOverdue 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                        : vencimiento.daysUntilDue <= 5 
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }
                    `}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {vencimiento.tenant.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                          Hab. {vencimiento.tenant.roomNumber}
                        </span>
                        <span>{prop?.address || 'Sin propiedad'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${vencimiento.tenant.rentAmount?.toLocaleString('es-AR') || 0}
                      </div>
                      <div className={`text-xs font-bold uppercase ${getStatusTextColor(vencimiento)}`}>
                        {getStatusText(vencimiento)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detalle del día seleccionado */}
        <div className="lg:col-span-1">
          {selectedDay && selectedDay.vencimientos.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                {selectedDay.date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="space-y-4">
                {selectedDay.vencimientos.map((v, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(v)}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{v.tenant.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hab. {v.tenant.roomNumber}
                      </p>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        ${v.tenant.rentAmount?.toLocaleString('es-AR') || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
              <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('calendar.selectDay')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>{t('calendar.status.overdue')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>{t('calendar.status.upcoming')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>{t('calendar.status.upToDate')}</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
