import React from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query
} from 'firebase/firestore';
import { db } from './firebase/config';


// =================================
// CONSTANTES
// =================================
const EXPENSE_CATEGORIES = ["Mantenimiento", "Servicios", "Impuestos", "Administrativo", "Otros"];

// =================================
// UTILIDADES
// =================================
const getTenantPaymentStatus = (tenant, payments) => {
  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
  if (tenantPayments.length === 0) return { status: 'debt', months: 999, lastPayment: null };
  
  tenantPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastPaymentDate = new Date(tenantPayments[0].date);
  const today = new Date();
  const diffTime = today - lastPaymentDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 40) return { status: 'upToDate', months: 0, lastPayment: lastPaymentDate };
  
  const monthsOverdue = Math.floor(diffDays / 30);
  return { status: 'debt', months: monthsOverdue, lastPayment: lastPaymentDate };
};

// =================================
// COMPONENTES
// =================================
const StatCard = ({ title, value, icon, colorClass = 'bg-white dark:bg-gray-800', subtitle }) => (
  <div className={`shadow-lg rounded-lg p-6 ${colorClass} transition-transform duration-300 hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const TenantForm = ({ tenant, propertyId, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState(tenant || {
    name: '', dni: '', phone: '', roomNumber: '', entryDate: '', exitDate: '', contractStatus: 'activo', rentAmount: '', propertyId
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI</label>
          <input type="text" required value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
          <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Habitación</label>
          <input type="number" required value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: parseInt(e.target.value)})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Entrada</label>
          <input type="date" required value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Salida (opcional)</label>
          <input type="date" value={formData.exitDate || ''} onChange={e => setFormData({...formData, exitDate: e.target.value || null})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto de Alquiler</label>
          <input type="number" required value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: parseInt(e.target.value)})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado del Contrato</label>
          <select value={formData.contractStatus} onChange={e => setFormData({...formData, contractStatus: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Guardar</button>
      </div>
    </form>
  );
};

const ExpenseForm = ({ expense, propertyId, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState(expense || {
    description: '', category: 'Mantenimiento', amount: '', date: '', propertyId
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
        <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
          <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
          <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Guardar</button>
      </div>
    </form>
  );
};

const PaymentsModal = ({ tenant, payments, onClose, onAddPayment }) => {
  const [amount, setAmount] = React.useState(tenant.rentAmount);
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddPayment({ tenantId: tenant.id, amount: parseInt(amount), date });
    setAmount(tenant.rentAmount);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const tenantPayments = payments.filter(p => p.tenantId === tenant.id).sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Registrar Nuevo Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
            <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Pago</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Registrar</button>
          </div>
        </div>
      </form>

      <div>
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Historial de Pagos</h3>
        {tenantPayments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay pagos registrados</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tenantPayments.map(payment => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">{new Date(payment.date).toLocaleDateString('es-AR')}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">${payment.amount.toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReceiptModal = ({ payment, tenant, onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">Recibo de Pago</h2>
        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <p><strong>Inquilino:</strong> {tenant.name}</p>
          <p><strong>DNI:</strong> {tenant.dni}</p>
          <p><strong>Habitación:</strong> {tenant.roomNumber}</p>
          <p><strong>Monto:</strong> ${payment.amount.toLocaleString('es-AR')}</p>
          <p><strong>Fecha de Pago:</strong> {new Date(payment.date).toLocaleDateString('es-AR')}</p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={handlePrint} className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Imprimir</button>
        <button onClick={onClose} className="flex-1 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cerrar</button>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <p className="text-lg text-gray-900 dark:text-white mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

const BarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">${item.value.toLocaleString('es-AR')}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full transition-all duration-500" style={{width: `${(item.value/maxValue)*100}%`}}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ properties, tenants, payments, expenses, onSelectProperty }) => {
  const totalIncome = React.useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    return payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
    }).reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const totalExpenses = React.useMemo(() => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ingreso Mensual" value={`$${totalIncome.toLocaleString('es-AR')}`} icon="💰" colorClass="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800" />
        <StatCard title="Gastos Mensuales" value={`$${totalExpenses.toLocaleString('es-AR')}`} icon="📉" colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" />
        <StatCard title="Inquilinos Activos" value={activeTenants} icon="👥" colorClass="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800" />
        <StatCard title="Deudores" value={debtors} icon="⚠️" colorClass="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800" />
      </div>

      <BarChart data={incomeByProperty} title="Ingresos Potenciales por Propiedad" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Propiedades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(prop => {
            const propTenants = tenants.filter(t => t.propertyId === prop.id && t.contractStatus === 'activo');
            const occupiedRooms = propTenants.length;
            const occupancyRate = ((occupiedRooms / prop.totalRooms) * 100).toFixed(0);
            
            return (
              <div key={prop.id} onClick={() => onSelectProperty(prop.id)} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 p-6 rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{prop.address}</h3>
                <p className="text-gray-700 dark:text-gray-300">Habitaciones: {occupiedRooms}/{prop.totalRooms}</p>
                <div className="mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ocupación</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-500" style={{width: `${occupancyRate}%`}}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PropertyDetail = ({ property, tenants, payments, expenses, onBack, onAddTenant, onEditTenant, onDeleteTenant, onAddPayment, onAddExpense, onDeleteExpense }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = React.useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = React.useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = React.useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false);
  const [editingTenant, setEditingTenant] = React.useState(null);
  const [selectedTenant, setSelectedTenant] = React.useState(null);
  const [selectedPayment, setSelectedPayment] = React.useState(null);
  const [itemToDelete, setItemToDelete] = React.useState(null);

  const propTenants = tenants.filter(t => t.propertyId === property.id);
  const activeTenants = propTenants.filter(t => t.contractStatus === 'activo');
  const vacantRooms = property.totalRooms - activeTenants.length;
  const propExpenses = expenses.filter(e => e.propertyId === property.id);

  const totalMonthlyIncome = activeTenants.reduce((sum, t) => sum + t.rentAmount, 0);
  const totalExpensesAmount = propExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSaveTenant = (tenantData) => {
    if (editingTenant) {
      onEditTenant({...tenantData, id: editingTenant.id});
    } else {
      onAddTenant(tenantData);
    }
    setModalOpen(false);
    setEditingTenant(null);
  };

  const handleDeleteTenant = () => {
    onDeleteTenant(itemToDelete.id);
    setConfirmModalOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteExpense = () => {
    onDeleteExpense(itemToDelete.id);
    setConfirmModalOpen(false);
    setItemToDelete(null);
  };

  const handleSaveExpense = (expenseData) => {
    onAddExpense(expenseData);
    setExpenseModalOpen(false);
  };

  const handlePaymentClick = (tenant) => {
    setSelectedTenant(tenant);
    setPaymentsModalOpen(true);
  };

  const handleReceiptClick = (payment, tenant) => {
    setSelectedPayment(payment);
    setSelectedTenant(tenant);
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors">
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.address}</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ingreso Mensual Potencial" value={`$${totalMonthlyIncome.toLocaleString('es-AR')}`} icon="💰" colorClass="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800" />
        <StatCard title="Habitaciones Vacías" value={vacantRooms} icon="🏠" colorClass="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800" />
        <StatCard title="Gastos Totales" value={`$${totalExpensesAmount.toLocaleString('es-AR')}`} icon="📉" colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inquilinos</h2>
          <button onClick={() => { setEditingTenant(null); setModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">+ Agregar Inquilino</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Habitación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alquiler</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {propTenants.map(tenant => {
                const paymentStatus = getTenantPaymentStatus(tenant, payments);
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-white">{tenant.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{tenant.roomNumber}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">${tenant.rentAmount.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tenant.contractStatus === 'activo' 
                          ? paymentStatus.status === 'upToDate' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {tenant.contractStatus === 'activo' 
                          ? paymentStatus.status === 'upToDate' ? 'Al día' : `Debe ${paymentStatus.months} mes(es)`
                          : 'Finalizado'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => handlePaymentClick(tenant)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">💳 Pagos</button>
                        <button onClick={() => { setEditingTenant(tenant); setModalOpen(true); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">✏️ Editar</button>
                        <button onClick={() => { setItemToDelete(tenant); setConfirmModalOpen(true); }} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gastos</h2>
          <button onClick={() => setExpenseModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">+ Agregar Gasto</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {propExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-4 text-gray-900 dark:text-white">{expense.description}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{expense.category}</td>
                  <td className="px-4 py-4 text-gray-900 dark:text-white font-semibold">${expense.amount.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{new Date(expense.date).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-4">
                    <button onClick={() => { setItemToDelete(expense); setConfirmModalOpen(true); }} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingTenant(null); }} title={editingTenant ? "Editar Inquilino" : "Agregar Inquilino"}>
        <TenantForm tenant={editingTenant} propertyId={property.id} onSave={handleSaveTenant} onCancel={() => { setModalOpen(false); setEditingTenant(null); }} />
      </Modal>

      <Modal isOpen={paymentsModalOpen} onClose={() => { setPaymentsModalOpen(false); setSelectedTenant(null); }} title={`Pagos - ${selectedTenant?.name}`}>
        {selectedTenant && <PaymentsModal tenant={selectedTenant} payments={payments} onClose={() => { setPaymentsModalOpen(false); setSelectedTenant(null); }} onAddPayment={onAddPayment} />}
      </Modal>

      <Modal isOpen={receiptModalOpen} onClose={() => { setReceiptModalOpen(false); setSelectedPayment(null); setSelectedTenant(null); }} title="Recibo de Pago">
        {selectedPayment && selectedTenant && <ReceiptModal payment={selectedPayment} tenant={selectedTenant} onClose={() => { setReceiptModalOpen(false); setSelectedPayment(null); setSelectedTenant(null); }} />}
      </Modal>

      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Agregar Gasto">
        <ExpenseForm propertyId={property.id} onSave={handleSaveExpense} onCancel={() => setExpenseModalOpen(false)} />
      </Modal>

      <ConfirmModal 
        isOpen={confirmModalOpen} 
        onClose={() => { setConfirmModalOpen(false); setItemToDelete(null); }} 
        onConfirm={itemToDelete?.name ? handleDeleteTenant : handleDeleteExpense}
        message={itemToDelete?.name ? `¿Estás seguro de eliminar al inquilino ${itemToDelete.name}?` : `¿Estás seguro de eliminar este gasto?`}
      />
    </div>
  );
};

const DebtorsView = ({ tenants, payments, onBack }) => {
  const debtors = tenants.filter(t => {
    if (t.contractStatus !== 'activo') return false;
    const status = getTenantPaymentStatus(t, payments);
    return status.status === 'debt';
  }).map(t => ({ ...t, paymentStatus: getTenantPaymentStatus(t, payments) }))
    .sort((a,b) => b.paymentStatus.months - a.paymentStatus.months);

  const totalDebt = debtors.reduce((sum, t) => sum + (t.rentAmount * t.paymentStatus.months), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors">
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inquilinos con Deuda</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Deudores" value={debtors.length} icon="⚠️" colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" />
        <StatCard title="Deuda Total Estimada" value={`$${totalDebt.toLocaleString('es-AR')}`} icon="💸" colorClass="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Habitación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meses Adeudados</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deuda Estimada</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Último Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {debtors.map(debtor => (
                <tr key={debtor.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">{debtor.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{debtor.phone}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{debtor.roomNumber}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">{debtor.paymentStatus.months} mes(es)</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-white font-semibold">${(debtor.rentAmount * debtor.paymentStatus.months).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{debtor.paymentStatus.lastPayment ? new Date(debtor.paymentStatus.lastPayment).toLocaleDateString('es-AR') : 'Nunca'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const VacantRoomsView = ({ properties, tenants, onBack }) => {
  const vacancyData = properties.map(prop => {
    const activeTenants = tenants.filter(t => t.propertyId === prop.id && t.contractStatus === 'activo');
    const vacant = prop.totalRooms - activeTenants.length;
    return { property: prop, vacant, total: prop.totalRooms, percentage: ((vacant / prop.totalRooms) * 100).toFixed(0) };
  });

  const totalVacant = vacancyData.reduce((sum, v) => sum + v.vacant, 0);
  const totalRooms = vacancyData.reduce((sum, v) => sum + v.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors">
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Habitaciones Vacías</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Habitaciones Vacías" value={totalVacant} icon="🏠" colorClass="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800" />
        <StatCard title="Ocupación General" value={`${(((totalRooms - totalVacant) / totalRooms) * 100).toFixed(0)}%`} icon="📊" colorClass="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          {vacancyData.map(data => (
            <div key={data.property.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{data.property.address}</h3>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{data.vacant} / {data.total} vacías</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div className="bg-blue-600 dark:bg-blue-400 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{width: `${100 - data.percentage}%`}}>
                  <span className="text-xs font-bold text-white">{100 - data.percentage}% ocupado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonthlyIncomeView = ({ payments, tenants, onBack }) => {
  const monthlyData = React.useMemo(() => {
    const grouped = {};
    payments.forEach(p => {
      const date = new Date(p.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + p.amount;
    });
    return Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0])).slice(0, 12).map(([key, value]) => ({
      label: new Date(key + '-01').toLocaleDateString('es-AR', { year: 'numeric', month: 'long' }),
      value
    }));
  }, [payments]);

  const thisMonthIncome = monthlyData.length > 0 ? monthlyData[0].value : 0;
  const lastMonthIncome = monthlyData.length > 1 ? monthlyData[1].value : 0;
  const change = lastMonthIncome > 0 ? (((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors">
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ingresos Mensuales</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Ingreso Este Mes" value={`$${thisMonthIncome.toLocaleString('es-AR')}`} icon="💰" colorClass="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800" />
        <StatCard title="Variación vs Mes Anterior" value={`${change > 0 ? '+' : ''}${change}%`} icon={change >= 0 ? '📈' : '📉'} colorClass={change >= 0 ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800" : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800"} />
      </div>

      <BarChart data={monthlyData} title="Historial de Ingresos (últimos 12 meses)" />
    </div>
  );
};

const ExpensesView = ({ expenses, properties, onBack }) => {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const byCategory = React.useMemo(() => {
    const grouped = {};
    expenses.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return Object.entries(grouped).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
  }, [expenses]);

  const byProperty = React.useMemo(() => {
    return properties.map(prop => ({
      label: prop.address,
      value: expenses.filter(e => e.propertyId === prop.id).reduce((sum, e) => sum + e.amount, 0)
    })).sort((a,b) => b.value - a.value);
  }, [expenses, properties]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors">
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gastos</h1>
        <div></div>
      </div>

      <StatCard title="Gastos Totales" value={`$${totalExpenses.toLocaleString('es-AR')}`} icon="📉" colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={byCategory} title="Gastos por Categoría" />
        <BarChart data={byProperty} title="Gastos por Propiedad" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Detalle de Gastos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Propiedad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.sort((a,b) => new Date(b.date) - new Date(a.date)).map(expense => {
                const property = properties.find(p => p.id === expense.propertyId);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{expense.description}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{property?.address}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{expense.category}</td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white font-semibold">${expense.amount.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{new Date(expense.date).toLocaleDateString('es-AR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =================================
// COMPONENTE PRINCIPAL APP
// =================================
const App = () => {
  const [view, setView] = React.useState('dashboard');
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(null);
  const [theme, setTheme] = React.useState('light');
  
  const [properties, setProperties] = React.useState([]);
  const [tenants, setTenants] = React.useState([]);
  const [payments, setPayments] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Cargar datos desde Firebase en tiempo real
  React.useEffect(() => {
    const unsubscribeProperties = onSnapshot(query(collection(db, 'properties')), (snapshot) => {
      setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeTenants = onSnapshot(query(collection(db, 'tenants')), (snapshot) => {
      setTenants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribePayments = onSnapshot(query(collection(db, 'payments')), (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeExpenses = onSnapshot(query(collection(db, 'expenses')), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    setLoading(false);

    return () => {
      unsubscribeProperties();
      unsubscribeTenants();
      unsubscribePayments();
      unsubscribeExpenses();
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleAddTenant = async (tenantData) => {
    try {
      await addDoc(collection(db, 'tenants'), tenantData);
    } catch (error) {
      alert('Error al agregar inquilino: ' + error.message);
    }
  };

  const handleEditTenant = async (updatedTenant) => {
    try {
      const { id, ...data } = updatedTenant;
      await updateDoc(doc(db, 'tenants', id), data);
    } catch (error) {
      alert('Error al editar inquilino: ' + error.message);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    try {
      await deleteDoc(doc(db, 'tenants', tenantId));
    } catch (error) {
      alert('Error al eliminar inquilino: ' + error.message);
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      await addDoc(collection(db, 'payments'), paymentData);
    } catch (error) {
      alert('Error al agregar pago: ' + error.message);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await addDoc(collection(db, 'expenses'), expenseData);
    } catch (error) {
      alert('Error al agregar gasto: ' + error.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (error) {
      alert('Error al eliminar gasto: ' + error.message);
    }
  };

  const renderContent = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard properties={properties} tenants={tenants} payments={payments} expenses={expenses} onSelectProperty={(id) => { setSelectedPropertyId(id); setView('propertyDetail'); }} />;
      case 'propertyDetail':
        const property = properties.find(p => p.id === selectedPropertyId);
        return <PropertyDetail property={property} tenants={tenants} payments={payments} expenses={expenses} onBack={() => setView('dashboard')} onAddTenant={handleAddTenant} onEditTenant={handleEditTenant} onDeleteTenant={handleDeleteTenant} onAddPayment={handleAddPayment} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />;
      case 'debtors':
        return <DebtorsView tenants={tenants} payments={payments} onBack={() => setView('dashboard')} />;
      case 'vacant':
        return <VacantRoomsView properties={properties} tenants={tenants} onBack={() => setView('dashboard')} />;
      case 'income':
        return <MonthlyIncomeView payments={payments} tenants={tenants} onBack={() => setView('dashboard')} />;
      case 'expenses':
        return <ExpensesView expenses={expenses} properties={properties} onBack={() => setView('dashboard')} />;
      default:
        return <Dashboard properties={properties} tenants={tenants} payments={payments} expenses={expenses} onSelectProperty={(id) => { setSelectedPropertyId(id); setView('propertyDetail'); }} />;
    }
  };




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Gestor de Alquileres Pro</h1>
        
        <nav className="hidden md:flex gap-4">
          <button onClick={() => setView('dashboard')} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</button>
          <button onClick={() => setView('debtors')} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Deudores</button>
          <button onClick={() => setView('vacant')} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Habitaciones</button>
          <button onClick={() => setView('income')} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Ingresos</button>
          <button onClick={() => setView('expenses')} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Gastos</button>
        </nav>

        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          {theme === 'light' ? 
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> :
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          }
        </button>
      </header>

      <main className="p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
