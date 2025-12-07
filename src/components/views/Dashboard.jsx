import React, { useState, useMemo, useEffect } from 'react';
import { Plus, FileText, DollarSign, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, Reorder, useScroll, useTransform } from 'framer-motion';
import StatCard3D from '../common/StatCard3D';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import PropertyForm from '../forms/PropertyForm';
import BarChart from '../common/BarChart';
import PropertyCard from '../properties/PropertyCard';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';
import { generateMonthlyReport } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import { logger } from '../../utils/logger';

import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';

const Dashboard = ({ user, theme }) => {
  const { 
    properties, 
    loading: propertiesLoading, 
    addProperty, 
    editProperty, 
    deleteProperty 
  } = useProperties(user?.uid);

  const { 
    tenants, 
    loading: tenantsLoading 
  } = useTenants(user?.uid);

  const { 
    payments, 
    allPayments,
    loading: paymentsLoading 
  } = usePayments(user?.uid, { recent: true, days: 60 });

  const { 
    expenses, 
    loading: expensesLoading 
  } = useExpenses(user?.uid, { monthly: true });

  const loading = propertiesLoading || tenantsLoading || paymentsLoading || expensesLoading;

  const navigate = useNavigate();
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Draggable Widgets State
  const [statsOrder, setStatsOrder] = useState(() => {
    const saved = localStorage.getItem('dashboard_stats_order');
    return saved ? JSON.parse(saved) : ['income', 'expenses', 'tenants', 'debtors'];
  });

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboard_stats_order', JSON.stringify(statsOrder));
  }, [statsOrder]);

  // Parallax Effect
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 200], [0, 50]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  const activeTenants = tenants.filter(t => t.contractStatus === 'activo').length;
  
  const debtors = tenants.filter(t => {
    if (t.contractStatus !== 'activo') return false;
    const status = getTenantPaymentStatus(t, allPayments || []);
    return status.status === 'debt';
  }).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalIncome = useMemo(() => {
    return payments
      .filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, currentMonth, currentYear]);

  const totalExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonth, currentYear]);

  const incomeByProperty = useMemo(() => {
    return properties.map(prop => {
      const propTenants = tenants.filter(t => t.propertyId === prop.id);
      const propIncome = payments
        .filter(p => {
          const tenant = propTenants.find(t => t.id === p.tenantId);
          const pDate = new Date(p.date);
          return tenant && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      return { label: prop.address, value: propIncome };
    }).sort((a, b) => b.value - a.value);
  }, [properties, tenants, payments, currentMonth, currentYear]);

  const handleAddProperty = async (propertyData) => {
    await addProperty(propertyData);
    setIsPropertyFormOpen(false);
  };

  const handleEditProperty = async (propertyData) => {
    await editProperty({ ...propertyData, id: propertyToEdit.id });
    setIsPropertyFormOpen(false);
    setPropertyToEdit(null);
  };

  const openEditModal = (property, e) => {
    e.stopPropagation();
    setPropertyToEdit(property);
    setIsPropertyFormOpen(true);
  };

  const openDeleteModal = (property, e) => {
    e.stopPropagation();
    setPropertyToDelete(property);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProperty = async () => {
    const propTenants = tenants.filter(t => t.propertyId === propertyToDelete.id && t.contractStatus === 'activo');
    
    if (propTenants.length > 0) {
      toast.error('No se puede eliminar una propiedad con inquilinos activos');
      setPropertyToDelete(null);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteProperty(propertyToDelete.id);
      setPropertyToDelete(null);
    } catch (error) {
      logger.error('Error deleting property:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateMonthlyReport = () => {
    try {
      const income = payments.filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      });

      const expensesMonth = expenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
      });

      const tenantsActive = tenants.filter(t => t.contractStatus === 'activo');

      const debtorsList = tenantsActive.filter(t => {
        const status = getTenantPaymentStatus(t, allPayments || []);
        return status.status === 'debt';
      }).map(t => ({
        ...t,
        paymentStatus: getTenantPaymentStatus(t, allPayments || [])
      }));

      const reportData = {
        month: currentMonth,
        year: currentYear,
        income,
        expenses: expensesMonth,
        tenants: tenantsActive,
        properties,
        debtors: debtorsList
      };

      const pdf = generateMonthlyReport(reportData);
      const monthName = new Date(currentYear, currentMonth).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      pdf.save(`reporte-mensual-${monthName.replace(/\s+/g, '-')}.pdf`);
      toast.success('Reporte descargado correctamente');
    } catch (error) {
      logger.error('Error generando reporte:', error);
      toast.error('Error al generar reporte');
    }
  };

  const statsComponents = useMemo(() => ({
    income: (
      <StatCard3D 
        key="income"
        title="Ingresos del Mes" 
        value={`$${totalIncome.toLocaleString('es-AR')}`} 
        icon={<DollarSign />}
        colorClass="green"
        trend={12}
      />
    ),
    expenses: (
      <StatCard3D 
        key="expenses"
        title="Gastos Mensuales" 
        value={`$${totalExpenses.toLocaleString('es-AR')}`} 
        icon={<TrendingDown />}
        colorClass="red"
        trend={-5}
      />
    ),
    tenants: (
      <StatCard3D 
        key="tenants"
        title="Inquilinos Activos" 
        value={activeTenants} 
        icon={<Users />}
        colorClass="blue"
      />
    ),
    debtors: (
      <StatCard3D 
        key="debtors"
        title="Deudores" 
        value={debtors} 
        icon={<AlertTriangle />}
        colorClass="yellow"
      />
    )
  }), [totalIncome, totalExpenses, activeTenants, debtors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-2"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Properties Skeleton */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Header with Parallax */}
      <motion.div 
        style={{ y: headerY, opacity: headerOpacity }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Vista general de tus propiedades y finanzas
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleGenerateMonthlyReport}
            className="flex-1 sm:flex-initial"
          >
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Reporte Mensual</span>
            <span className="sm:hidden">Reporte</span>
          </Button>
          <Button 
            variant="default" 
            onClick={() => setIsPropertyFormOpen(true)}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Propiedad
          </Button>
        </div>
      </motion.div>

      {/* Draggable Stats Cards */}
      <div>
        <Reorder.Group 
          axis={isDesktop ? "x" : "y"} 
          values={statsOrder} 
          onReorder={setStatsOrder} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsOrder.map(key => (
            <Reorder.Item key={key} value={key} as="div" className="cursor-grab active:cursor-grabbing">
              {statsComponents[key]}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Chart & Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Properties) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Propiedades</h2>
            <Button variant="link" className="text-sm h-auto p-0">Ver todas</Button>
          </div>
          
          {properties.length === 0 ? (
            <div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-dashed rounded-xl p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No hay propiedades registradas
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Comienza agregando tu primera propiedad para gestionar inquilinos y pagos
                  </p>
                  <Button 
                    onClick={() => setIsPropertyFormOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Propiedad
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((prop) => (
                <div key={prop.id}>
                  <PropertyCard
                    property={prop}
                    tenants={tenants}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onClick={() => navigate(`/property/${prop.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Content (Charts/Summary) */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumen Financiero</h2>
            {incomeByProperty.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm mt-4">
                <BarChart 
                  data={incomeByProperty} 
                  title="Ingresos por Propiedad" 
                  theme={theme}
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                No hay datos financieros suficientes para mostrar gráficos.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isPropertyFormOpen}
        onClose={() => {
          setIsPropertyFormOpen(false);
          setPropertyToEdit(null);
        }}
        title={propertyToEdit ? 'Editar Propiedad' : 'Agregar Propiedad'}
      >
        <PropertyForm
          isOpen={isPropertyFormOpen}
          onClose={() => {
            setIsPropertyFormOpen(false);
            setPropertyToEdit(null);
          }}
          onSubmit={propertyToEdit ? handleEditProperty : handleAddProperty}
          property={propertyToEdit}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={handleDeleteProperty}
        title="Eliminar Propiedad"
        message={`¿Estás seguro de eliminar la propiedad ${propertyToDelete?.address}? Esta acción no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
