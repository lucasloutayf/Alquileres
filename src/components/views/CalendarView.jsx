import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';
import { useProperties } from '../../hooks/useProperties';
import Button from '../common/Button';
import { cn } from '../../utils/cn';

import { useNavigate } from 'react-router-dom';

const CalendarView = ({ user }) => {
  const navigate = useNavigate();
  const { tenants, loading: tenantsLoading } = useTenants(user?.uid);
  const { payments, loading: paymentsLoading } = usePayments(user?.uid, { recent: true, days: 60 });
  const { properties, loading: propertiesLoading } = useProperties(user?.uid);

  const loading = tenantsLoading || paymentsLoading || propertiesLoading;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [hoveredDay, setHoveredDay] = useState(null);

  const getMonthVencimientos = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 perspective-1000">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              Calendario
            </h1>
            <p className="text-muted-foreground">Gestión de vencimientos y cobros</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm p-2 rounded-xl border border-border shadow-sm">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
              className="pl-9 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="all">Todas las propiedades</option>
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.address}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3D Calendar Container */}
      <div className="relative group">
        {/* Calendar Board */}
        <div 
          className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transform transition-transform duration-500 ease-out"
          style={{ 
            transform: 'perspective(2000px) rotateX(5deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
            <Button onClick={() => changeMonth(-1)} variant="ghost" size="sm">
              <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
            </Button>
            <h2 className="text-2xl font-bold text-foreground capitalize flex items-center gap-2">
              {monthName}
            </h2>
            <Button onClick={() => changeMonth(1)} variant="ghost" size="sm">
              Siguiente <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>

          {/* Days Grid */}
          <div className="p-6 bg-gradient-to-b from-card to-muted/20">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-4 perspective-500">
              <AnimatePresence mode="popLayout">
                {days.map((dayData, index) => {
                  if (!dayData) {
                    return <div key={`empty-${index}`} className="aspect-square"></div>;
                  }

                  const hasVencimientos = dayData.vencimientos.length > 0;
                  const hasOverdue = dayData.vencimientos.some(v => v.isOverdue);
                  const hasUrgent = dayData.vencimientos.some(v => v.daysUntilDue <= 5 && v.daysUntilDue >= 0);

                  return (
                    <motion.div
                      key={`${dayData.date.toISOString()}`}
                      layoutId={`${dayData.date.toISOString()}`}
                      initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      whileHover={{ 
                        scale: 1.05, 
                        z: 30,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        transition: { duration: 0.2 }
                      }}
                      onHoverStart={() => setHoveredDay(dayData)}
                      onHoverEnd={() => setHoveredDay(null)}
                      className={cn(
                        "aspect-square rounded-xl p-3 relative cursor-pointer transition-colors duration-300 border",
                        "flex flex-col justify-between",
                        dayData.isToday 
                          ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                          : "bg-card border-border hover:border-primary/50",
                        hasOverdue && "bg-destructive/5 border-destructive/30",
                        hasUrgent && "bg-yellow-500/5 border-yellow-500/30"
                      )}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <span className={cn(
                        "text-lg font-bold",
                        dayData.isToday ? "text-primary" : "text-foreground"
                      )}>
                        {dayData.day}
                      </span>

                      {hasVencimientos && (
                        <div className="flex gap-1 flex-wrap content-end">
                          {dayData.vencimientos.map((v, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                v.isOverdue ? "bg-destructive" : 
                                v.daysUntilDue <= 5 ? "bg-yellow-500" : "bg-emerald-500"
                              )}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* 3D Thickness Effect (Pseudo-element simulation) */}
                      <div 
                        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)',
                          transform: 'translateZ(1px)'
                        }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Reflection/Shadow under the board */}
        <div className="absolute -bottom-8 left-4 right-4 h-8 bg-black/20 blur-xl rounded-[50%] transform scale-x-95" />
      </div>

      {/* Detail Panel (Appears when hovering a day with events or list below) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Upcoming List */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-lg p-6">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Próximos Vencimientos
          </h3>
          
          {sortedVencimientos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
              No hay vencimientos pendientes
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {sortedVencimientos.map((vencimiento, index) => {
                const prop = properties.find(p => p.id === vencimiento.tenant.propertyId);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-md flex justify-between items-center group",
                      vencimiento.isOverdue
                        ? "bg-destructive/5 border-destructive/20 hover:border-destructive/50"
                        : vencimiento.daysUntilDue <= 5
                        ? "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/50"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <div>
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {vencimiento.tenant.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">
                          Hab. {vencimiento.tenant.roomNumber}
                        </span>
                        <span>{prop?.address}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        ${vencimiento.tenant.rentAmount.toLocaleString('es-AR')}
                      </div>
                      <div className={cn(
                        "text-xs font-bold uppercase tracking-wide mt-1",
                        vencimiento.isOverdue ? "text-destructive" : 
                        vencimiento.daysUntilDue <= 5 ? "text-yellow-600" : "text-emerald-600"
                      )}>
                        {vencimiento.isOverdue 
                          ? `Vencido (${Math.abs(vencimiento.daysUntilDue)} días)` 
                          : vencimiento.daysUntilDue === 0 ? "Vence Hoy" 
                          : `${vencimiento.daysUntilDue} días restantes`}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Day Detail (Floating Card) */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {hoveredDay && hoveredDay.vencimientos.length > 0 ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6 shadow-2xl sticky top-24"
              >
                <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">
                  {hoveredDay.date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <div className="space-y-4">
                  {hoveredDay.vencimientos.map((v, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        v.isOverdue ? "bg-destructive" : "bg-emerald-500"
                      )} />
                      <div>
                        <p className="font-medium text-foreground">{v.tenant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${v.tenant.rentAmount.toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-muted/10 border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]"
              >
                <CalendarIcon className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">
                  Pasa el mouse sobre un día para ver los detalles
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
