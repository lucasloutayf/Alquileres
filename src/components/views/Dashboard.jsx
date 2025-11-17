import React, { useState, useMemo } from 'react';
import { Plus, FileText, Edit, Trash2, DollarSign, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import StatCard from '../common/StatCard';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import PropertyForm from '../forms/PropertyForm';
import BarChart from '../common/BarChart';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';
import { generateMonthlyReport } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

const Dashboard = ({ 
  properties, 
  tenants, 
  payments, 
  expenses,
  onAddProperty, 
  onEditProperty,
  onDeleteProperty, 
  onSelectProperty 
}) => {
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const activeTenants = tenants.filter(t => t.contractStatus === 'activo').length;
  
  const debtors = tenants.filter(t => {
    if (t.contractStatus !== 'activo') return false;
    const status = getTenantPaymentStatus(t, payments);
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

  const handleAddProperty = (propertyData) => {
    onAddProperty(propertyData);
    setIsPropertyFormOpen(false);
  };

  const handleEditProperty = (propertyData) => {
    onEditProperty({ ...propertyData, id: propertyToEdit.id });
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

  const handleDeleteProperty = () => {
    onDeleteProperty(propertyToDelete.id);
    setPropertyToDelete(null);
  };

  const handleGenerateMonthlyReport = () => {
  try {
    // Filtro MES y AÑO actual
    const income = payments.filter(p => {
      const pDate = new Date(p.date);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });

    const expensesMonth = expenses.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
    });

    const tenantsActive = tenants.filter(t => t.contractStatus === 'activo');

    // Deudores basados en pagos de este mes
    const debtorsList = tenantsActive.filter(t => {
      const status = getTenantPaymentStatus(t, income); // solo pagos del mes!
      return status.status === 'debt';
    }).map(t => ({
      ...t,
      paymentStatus: getTenantPaymentStatus(t, income)
    }));

    const reportData = {
      month: currentMonth,
      year: currentYear,
      income, // pagos del mes actual
      expenses: expensesMonth, // gastos del mes actual
      tenants: tenantsActive,  // todos los inquilinos activos
      properties, // todas las props completas
      debtors: debtorsList
    };

    const pdf = generateMonthlyReport(reportData);
    const monthName = new Date(currentYear, currentMonth).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    pdf.save(`reporte-mensual-${monthName.replace(/\s+/g, '-')}.pdf`);
    toast.success('Reporte descargado correctamente');
  } catch (error) {
    console.error('Error generando reporte:', error);
    toast.error('Error al generar reporte');
  }
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Vista general de tus propiedades
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="secondary" 
            icon={<FileText className="w-4 h-4" />}
            onClick={handleGenerateMonthlyReport}
            className="flex-1 sm:flex-initial"
          >
            <span className="hidden sm:inline">Reporte Mensual</span>
            <span className="sm:hidden">Reporte</span>
          </Button>
          <Button 
            variant="primary" 
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsPropertyFormOpen(true)}
            className="flex-1 sm:flex-initial"
          >
            Agregar Propiedad
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos generados este mes" 
          value={`$${totalIncome.toLocaleString('es-AR')}`} 
          icon={<DollarSign className="w-6 h-6" />}
          colorClass="green"
        />
        <StatCard 
          title="Gastos Mensuales" 
          value={`$${totalExpenses.toLocaleString('es-AR')}`} 
          icon={<TrendingDown className="w-6 h-6" />}
          colorClass="red"
        />
        <StatCard 
          title="Inquilinos Activos" 
          value={activeTenants} 
          icon={<Users className="w-6 h-6" />}
          colorClass="blue"
        />
        <StatCard 
          title="Deudores" 
          value={debtors} 
          icon={<AlertTriangle className="w-6 h-6" />}
          colorClass="yellow"
        />
      </div>

      {/* Chart */}
      {incomeByProperty.length > 0 && (
        <BarChart 
          data={incomeByProperty} 
          title="Ingresos Potenciales por Propiedad" 
        />
      )}

      {/* Properties Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Propiedades</h2>
        
        {properties.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No hay propiedades registradas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Comienza agregando tu primera propiedad para gestionar inquilinos y pagos
              </p>
              <Button 
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsPropertyFormOpen(true)}
              >
                Agregar Primera Propiedad
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {properties.map(prop => {
    const propTenants = tenants.filter(t => t.propertyId === prop.id && t.contractStatus === 'activo');
    const occupancyRate = (propTenants.length / prop.totalRooms) * 100;
    const monthlyIncome = propTenants.reduce((sum, t) => sum + t.rentAmount, 0);

    return (
      <div 
        key={prop.id} 
        onClick={() => onSelectProperty(prop.id)} 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 relative group"
      >
        {/* Action buttons con hover mejorado */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => openEditModal(prop, e)}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-150"
          >
            <Edit className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={(e) => openDeleteModal(prop, e)}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Property info */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pr-20">
          {prop.address}
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Habitaciones:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {propTenants.length} / {prop.totalRooms}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Ingreso mensual:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ${monthlyIncome.toLocaleString('es-AR')}
            </span>
          </div>

          {/* Occupancy bar */}
<div>
  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
    <span>Ocupación</span>
    <span className="font-medium">{Math.round(occupancyRate)}%</span>
  </div>
  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
    <div 
      className="h-2 rounded-full transition-all duration-500 bg-emerald-600 dark:bg-emerald-500" 
      style={{width: `${occupancyRate}%`}}
    />
  </div>
</div>

        </div>
      </div>
    );
  })}
</div>

        )}
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
      />
    </div>
  );
};

export default Dashboard;
