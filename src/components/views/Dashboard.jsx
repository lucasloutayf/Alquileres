import React, { useMemo, useState } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Edit, 
  Trash2 
} from 'lucide-react';
import StatCard from '../common/StatCard';
import BarChart from '../common/BarChart';
import PropertyForm from '../forms/PropertyForm';
import ConfirmModal from '../common/ConfirmModal';
import { getTenantPaymentStatus } from '../../utils/paymentUtils';
import { generateMonthlyReport } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

const Dashboard = ({ properties, tenants, payments, expenses, onSelectProperty, onAddProperty, onEditProperty, onDeleteProperty }) => {
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const totalIncome = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    return payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
    }).reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const totalExpenses = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    }).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const activeTenants = tenants.filter(t => t.contractStatus === 'activo').length;
  
  const debtors = tenants.filter(t => {
    if (t.contractStatus !== 'activo') return false;
    const status = getTenantPaymentStatus(t, payments);
    return status.status === 'debt';
  }).length;

  const incomeByProperty = properties.map(prop => ({
    label: prop.address,
    value: tenants.filter(t => t.propertyId === prop.id && t.contractStatus === 'activo')
      .reduce((sum, t) => sum + t.rentAmount, 0)
  }));

  const handleGenerateMonthlyReport = () => {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      
      const monthIncome = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === today.getMonth() && 
               paymentDate.getFullYear() === currentYear;
      });
      
      const monthExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === today.getMonth() && 
               expenseDate.getFullYear() === currentYear;
      });
      
      const debtorsList = tenants.filter(t => {
        if (t.contractStatus !== 'activo') return false;
        const status = getTenantPaymentStatus(t, payments);
        return status.status === 'debt';
      }).map(t => ({ ...t, paymentStatus: getTenantPaymentStatus(t, payments) }));
      
      const reportData = {
        month: currentMonth,
        year: currentYear,
        income: monthIncome,
        expenses: monthExpenses,
        properties,
        tenants,
        payments,
        debtors: debtorsList
      };
      
      const pdf = generateMonthlyReport(reportData);
      pdf.save(`reporte-mensual-${currentMonth}-${currentYear}.pdf`);
      
      toast.success('Reporte descargado correctamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar reporte');
    }
  };

  const handleAddProperty = (propertyData) => {
    onAddProperty(propertyData);
    setIsPropertyFormOpen(false);
  };

  const handleEditProperty = (propertyData) => {
    onEditProperty({ ...propertyData, id: propertyToEdit.id });
    setPropertyToEdit(null);
    setIsPropertyFormOpen(false);
  };

  const handleDeleteProperty = () => {
    const propertyTenants = tenants.filter(t => t.propertyId === propertyToDelete.id && t.contractStatus === 'activo');
    
    if (propertyTenants.length > 0) {
      toast.error('No se puede eliminar una propiedad con inquilinos activos');
      setPropertyToDelete(null);
      return;
    }
    
    onDeleteProperty(propertyToDelete.id);
    setPropertyToDelete(null);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos generados este mes" 
          value={`$${totalIncome.toLocaleString('es-AR')}`} 
          icon={<DollarSign className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800" 
        />
        <StatCard 
          title="Gastos Mensuales" 
          value={`$${totalExpenses.toLocaleString('es-AR')}`} 
          icon={<TrendingDown className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" 
        />
        <StatCard 
          title="Inquilinos Activos" 
          value={activeTenants} 
          icon={<Users className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800" 
        />
        <StatCard 
          title="Deudores" 
          value={debtors} 
          icon={<AlertTriangle className="w-6 h-6" />}
          colorClass="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800" 
        />
      </div>

      <BarChart data={incomeByProperty} title="Ingresos Potenciales por Propiedad" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Propiedades</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsPropertyFormOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Propiedad</span>
            </button>
            <button
              onClick={handleGenerateMonthlyReport}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Reporte Mensual</span>
              <span className="sm:hidden">Reporte</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No hay propiedades registradas
              </p>
              <button
                onClick={() => setIsPropertyFormOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Primera Propiedad</span>
              </button>
            </div>
          ) : (
            properties.map(prop => {
              const propTenants = tenants.filter(t => t.propertyId === prop.id && t.contractStatus === 'activo');
              const occupiedRooms = propTenants.length;
              const occupancyRate = ((occupiedRooms / prop.totalRooms) * 100).toFixed(0);
              
              return (
                <div 
                  key={prop.id} 
                  onClick={() => onSelectProperty(prop.id)} 
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 p-6 rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative group"
                >
                  {/* Botones de acción */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(prop, e)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Editar propiedad"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => openDeleteModal(prop, e)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Eliminar propiedad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-20">{prop.address}</h3>
                  <p className="text-gray-700 dark:text-gray-300">Habitaciones: {occupiedRooms}/{prop.totalRooms}</p>
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ocupación</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${occupancyRate}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      <PropertyForm
        isOpen={isPropertyFormOpen}
        onClose={() => {
          setIsPropertyFormOpen(false);
          setPropertyToEdit(null);
        }}
        onSubmit={propertyToEdit ? handleEditProperty : handleAddProperty}
        property={propertyToEdit}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={handleDeleteProperty}
        title="Eliminar Propiedad"
        message={`¿Estás seguro de que deseas eliminar la propiedad "${propertyToDelete?.address}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default Dashboard;
