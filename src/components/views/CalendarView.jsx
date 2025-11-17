import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';

const CalendarView = ({ tenants, payments, properties, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState('all');

  const getMonthVencimientos = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const vencimientos = tenants
      .filter(t => t.contractStatus === 'activo')
      .filter(t => selectedProperty === 'all' || t.propertyId === selectedProperty)
      .map(tenant => {
        const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
        if (tenantPayments.length === 0) {
          return { tenant, dueDate: new Date(tenant.entryDate), isOverdue: true };
        }
        
        tenantPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastPayment = new Date(tenantPayments[0].date);
        const dueDate = new Date(lastPayment);
        dueDate.setDate(dueDate.getDate() + 30);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return {
          tenant,
          dueDate,
          lastPayment,
          isOverdue: dueDate < today,
          daysUntilDue: Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
        };
      });
    
    return vencimientos;
  };

  const vencimientos = getMonthVencimientos();

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const vencimientosDelDia = vencimientos.filter(v => {
        const vDate = new Date(v.dueDate);
        return vDate.getDate() === day && 
               vDate.getMonth() === month && 
               vDate.getFullYear() === year;
      });
      
      days.push({
        day,
        date,
        vencimientos: vencimientosDelDia,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    
    return days;
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const sortedVencimientos = [...vencimientos].sort((a, b) => a.dueDate - b.dueDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span> Volver
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario de Vencimientos</h1>
        </div>
        <div></div>
      </div>

      {/* Filtro por propiedad */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filtrar por propiedad:
        </label>
        <select
          value={selectedProperty}
          onChange={e => setSelectedProperty(e.target.value)}
          className="w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Todas las propiedades</option>
          {properties.map(prop => (
            <option key={prop.id} value={prop.id}>{prop.address}</option>
          ))}
        </select>
      </div>

      {/* Calendario */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
          >
            ← Anterior
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {monthName}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
          >
            Siguiente →
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((dayData, index) => {
            if (!dayData) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const hasVencimientos = dayData.vencimientos.length > 0;
            const hasOverdue = dayData.vencimientos.some(v => v.isOverdue);
            const hasUrgent = dayData.vencimientos.some(v => v.daysUntilDue <= 5 && v.daysUntilDue >= 0);

            return (
              <div
                key={dayData.day}
                className={`aspect-square border rounded-lg p-2 relative ${
                  dayData.isToday 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900' 
                    : 'border-gray-300 dark:border-gray-600'
                } ${
                  hasOverdue 
                    ? 'bg-red-50 dark:bg-red-900' 
                    : hasUrgent 
                    ? 'bg-yellow-50 dark:bg-yellow-900' 
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {dayData.day}
                </div>
                {hasVencimientos && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className={`text-xs font-bold text-center rounded ${
                      hasOverdue 
                        ? 'bg-red-600 text-white' 
                        : hasUrgent 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-green-600 text-white'
                    }`}>
                      {dayData.vencimientos.length}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Vencido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Próximo a vencer (≤5 días)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Vence en el mes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Hoy</span>
          </div>
        </div>
      </div>

      {/* Lista de vencimientos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Próximos Vencimientos
        </h2>
        {sortedVencimientos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay vencimientos para mostrar
          </p>
        ) : (
          <div className="space-y-3">
            {sortedVencimientos.map((vencimiento, index) => {
              const prop = properties.find(p => p.id === vencimiento.tenant.propertyId);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    vencimiento.isOverdue
                      ? 'bg-red-50 dark:bg-red-900 border-red-600'
                      : vencimiento.daysUntilDue <= 5
                      ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-600'
                      : 'bg-green-50 dark:bg-green-900 border-green-600'
                  }`}
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {vencimiento.tenant.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {prop?.address} - Hab. {vencimiento.tenant.roomNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monto: ${vencimiento.tenant.rentAmount.toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {vencimiento.dueDate.toLocaleDateString('es-AR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                      <div className={`text-sm font-medium ${
                        vencimiento.isOverdue
                          ? 'text-red-600 dark:text-red-400'
                          : vencimiento.daysUntilDue <= 5
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {vencimiento.isOverdue
                          ? `Vencido hace ${Math.abs(vencimiento.daysUntilDue)} días`
                          : vencimiento.daysUntilDue === 0
                          ? 'Vence hoy'
                          : `Faltan ${vencimiento.daysUntilDue} días`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
