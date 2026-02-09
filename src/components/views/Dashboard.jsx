import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';

// Hooks de datos
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useReportGeneration } from '../../hooks/useReportGeneration';

// Componentes del Dashboard
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardStats from './dashboard/DashboardStats';
import PropertiesSection from './dashboard/PropertiesSection';
import AnalyticsSection from './dashboard/AnalyticsSection';
import DashboardSkeleton from './dashboard/DashboardSkeleton';

// Componentes comunes
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import PropertyForm from '../forms/PropertyForm';

// Utils
import { logger } from '../../utils/logger';
import { useTranslation } from 'react-i18next';

/**
 * Dashboard principal de la aplicación.
 * Orquesta las secciones del dashboard usando componentes extraídos.
 */
const Dashboard = ({ user, theme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ==========================================
  // HOOKS DE DATOS
  // ==========================================
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

  // ==========================================
  // HOOKS DE LÓGICA
  // ==========================================
  const { 
    activeTenants, 
    debtors, 
    totalIncome, 
    totalExpenses, 
    incomeByProperty,
    currentMonth,
    currentYear
  } = useDashboardStats({ 
    tenants, 
    payments, 
    allPayments: allPayments || [], 
    expenses, 
    properties 
  });

  const { handleGenerateMonthlyReport, handleExportToExcel } = useReportGeneration({
    payments,
    expenses,
    tenants,
    allPayments: allPayments || [],
    properties,
    currentMonth,
    currentYear
  });

  // ==========================================
  // ESTADOS LOCALES
  // ==========================================
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para el orden de las tarjetas de estadísticas
  const [statsOrder, setStatsOrder] = useState(() => {
    const saved = localStorage.getItem('dashboard_stats_order');
    return saved ? JSON.parse(saved) : ['income', 'expenses', 'tenants', 'debtors'];
  });

  // Detectar si es desktop para el drag axis
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persistir orden de stats
  useEffect(() => {
    localStorage.setItem('dashboard_stats_order', JSON.stringify(statsOrder));
  }, [statsOrder]);

  // Parallax Effect
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 200], [0, 50]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  // ==========================================
  // HANDLERS
  // ==========================================
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

  const handleDeleteProperty = async () => {
    const propTenants = tenants.filter(
      t => t.propertyId === propertyToDelete.id && t.contractStatus === 'activo'
    );
    
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

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Header with Parallax */}
      <DashboardHeader
        headerY={headerY}
        headerOpacity={headerOpacity}
        onAddProperty={() => setIsPropertyFormOpen(true)}
        onGenerateReport={handleGenerateMonthlyReport}
        onExportExcel={handleExportToExcel}
      />

      {/* Draggable Stats Cards */}
      <DashboardStats
        statsOrder={statsOrder}
        setStatsOrder={setStatsOrder}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        activeTenants={activeTenants}
        debtors={debtors}
        isDesktop={isDesktop}
      />

      {/* Properties Section */}
      <PropertiesSection
        properties={properties}
        tenants={tenants}
        onAddProperty={() => setIsPropertyFormOpen(true)}
        onEditProperty={openEditModal}
        onDeleteProperty={openDeleteModal}
        onPropertyClick={(id) => navigate(`/property/${id}`)}
      />

      {/* Analytics Section */}
      <AnalyticsSection
        payments={allPayments || []}
        expenses={expenses}
        properties={properties}
        tenants={tenants}
        incomeByProperty={incomeByProperty}
        theme={theme}
      />

      {/* Modals */}
      <Modal
        isOpen={isPropertyFormOpen}
        onClose={() => {
          setIsPropertyFormOpen(false);
          setPropertyToEdit(null);
        }}
        title={propertyToEdit ? t('dashboard.editProperty') : t('dashboard.addProperty')}
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
        title={t('dashboard.deleteConfirmTitle')}
        message={t('dashboard.deleteConfirmMessage', { address: propertyToDelete?.address })}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
