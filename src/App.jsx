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
import { db, auth } from './firebase/config';  
import { onAuthStateChanged, signOut } from 'firebase/auth';  
import Login from './components/Login'; 



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
  
  // Calcular la diferencia en días desde el último pago
  const diffTime = today - lastPaymentDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Si pasaron 30 días o menos, está al día
  if (diffDays <= 30) {
    return { status: 'upToDate', months: 0, lastPayment: lastPaymentDate };
  }
  
  // Si pasaron más de 30 días, calcular cuántos meses debe
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
    name: '', 
    dni: '', 
    phone: '', 
    emergencyPhone: '',  // NUEVO CAMPO
    roomNumber: '', 
    entryDate: '', 
    exitDate: '', 
    contractStatus: 'activo', 
    rentAmount: '', 
    propertyId
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
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI</label>
          <input 
            type="text" 
            required 
            value={formData.dni} 
            onChange={e => setFormData({...formData, dni: e.target.value})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
          <input 
            type="tel" 
            required 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono Familiar</label>
          <input 
            type="tel" 
            value={formData.emergencyPhone || ''} 
            onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} 
            placeholder="Contacto de emergencia"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Habitación</label>
          <input 
            type="number" 
            required 
            value={formData.roomNumber} 
            onChange={e => setFormData({...formData, roomNumber: parseInt(e.target.value)})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Entrada</label>
          <input 
            type="date" 
            required 
            value={formData.entryDate} 
            onChange={e => setFormData({...formData, entryDate: e.target.value})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Salida (opcional)</label>
          <input 
            type="date" 
            value={formData.exitDate || ''} 
            onChange={e => setFormData({...formData, exitDate: e.target.value || null})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto de Alquiler</label>
          <input 
            type="number" 
            required 
            value={formData.rentAmount} 
            onChange={e => setFormData({...formData, rentAmount: parseInt(e.target.value)})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado del Contrato</label>
          <select 
            value={formData.contractStatus} 
            onChange={e => setFormData({...formData, contractStatus: e.target.value})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};


const ExpenseForm = ({ expense, propertyId, properties, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState(expense || {
    description: '', 
    category: 'Mantenimiento', 
    amount: '', 
    date: '', 
    propertyId: propertyId || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Agregar hora para evitar problemas de zona horaria
    const [year, month, day] = formData.date.split('-');
    const dateWithTime = `${year}-${month}-${day}T12:00:00`;
    
    onSave({...formData, date: dateWithTime, amount: parseInt(formData.amount)});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
        <input 
          type="text" 
          required 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          placeholder="Ej: Reparación de cañería"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NUEVO: Solo mostrar selector si no hay propertyId predefinido */}
        {!propertyId && properties && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Propiedad</label>
            <select 
              required
              value={formData.propertyId} 
              onChange={e => setFormData({...formData, propertyId: e.target.value})} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccionar propiedad...</option>
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.address}</option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <select 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
          <input 
            type="number" 
            required 
            min="1"
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: e.target.value})} 
            placeholder="Ej: 15000"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
          <input 
            type="date" 
            required 
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
          />
        </div>
      </div>
      
      <div className="flex gap-3 justify-end pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};


const PaymentsModal = ({ tenant, payments, onClose, onAddPayment, onDeletePayment }) => {
  const [amount, setAmount] = React.useState(tenant.rentAmount);
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [adjustment, setAdjustment] = React.useState(0);
  const [adjustmentReason, setAdjustmentReason] = React.useState('');
  const [adjustmentType, setAdjustmentType] = React.useState('none'); // 'none', 'surcharge', 'discount'
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  const finalAmount = React.useMemo(() => {
    const base = parseInt(amount) || 0;
    const adj = parseInt(adjustment) || 0;
    if (adjustmentType === 'surcharge') return base + adj;
    if (adjustmentType === 'discount') return base - adj;
    return base;
  }, [amount, adjustment, adjustmentType]);

  const handleSubmit = (e) => {
  e.preventDefault();
  // Crear fecha con hora del mediodía para evitar problemas de zona horaria
  const [year, month, day] = date.split('-');
  const dateWithTime = `${year}-${month}-${day}T12:00:00`;
  
  const paymentData = {
    tenantId: tenant.id,
    baseAmount: parseInt(amount),
    adjustment: adjustmentType !== 'none' ? parseInt(adjustment) : 0,
    adjustmentType: adjustmentType !== 'none' ? adjustmentType : null,
    adjustmentReason: adjustmentType !== 'none' ? adjustmentReason : null,
    amount: finalAmount,
    date: dateWithTime  // Guardar con hora
  };
    onAddPayment(paymentData);
    // Reset form
    setAmount(tenant.rentAmount);
    setDate(new Date().toISOString().split('T')[0]);
    setAdjustment(0);
    setAdjustmentReason('');
    setAdjustmentType('none');
  };

  const handleGenerateReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const tenantPayments = payments.filter(p => p.tenantId === tenant.id).sort((a,b) => new Date(b.date) - new Date(a.date));

  if (showReceipt && selectedPayment) {
    return (
      <ReceiptGenerator 
        payment={selectedPayment} 
        tenant={tenant} 
        onClose={() => {
          setShowReceipt(false);
          setSelectedPayment(null);
        }} 
      />
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Registrar Nuevo Pago</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto Base</label>
            <input 
              type="number" 
              required 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Pago</label>
            <input 
              type="date" 
              required 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
            />
          </div>
        </div>

        {/* Multas/Descuentos */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ajustes (Opcional)</label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <select 
                value={adjustmentType} 
                onChange={e => {
                  setAdjustmentType(e.target.value);
                  if (e.target.value === 'none') {
                    setAdjustment(0);
                    setAdjustmentReason('');
                  }
                }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="none">Sin ajuste</option>
                <option value="surcharge">➕ Multa/Cargo</option>
                <option value="discount">➖ Descuento</option>
              </select>
            </div>

            {adjustmentType !== 'none' && (
              <>
                <div>
                  <input 
                    type="number" 
                    placeholder="Monto" 
                    value={adjustment} 
                    onChange={e => setAdjustment(e.target.value)} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Motivo" 
                    value={adjustmentReason} 
                    onChange={e => setAdjustmentReason(e.target.value)} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resumen del pago */}
        {adjustmentType !== 'none' && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">Monto base:</span>
              <span className="font-medium text-gray-900 dark:text-white">${parseInt(amount || 0).toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className={adjustmentType === 'surcharge' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {adjustmentType === 'surcharge' ? 'Multa/Cargo:' : 'Descuento:'}
              </span>
              <span className={adjustmentType === 'surcharge' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {adjustmentType === 'surcharge' ? '+' : '-'}${parseInt(adjustment || 0).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between items-center text-base font-bold border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
              <span className="text-gray-900 dark:text-white">Total a pagar:</span>
              <span className="text-blue-600 dark:text-blue-400 text-xl">${finalAmount.toLocaleString('es-AR')}</span>
            </div>
          </div>
        )}

        <div className="mt-3">
          <button type="submit" className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
            Registrar Pago
          </button>
        </div>
      </form>

      <div>
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Historial de Pagos</h3>
        {tenantPayments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay pagos registrados</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tenantPayments.map(payment => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {new Date(payment.date).toLocaleDateString('es-AR')}
                    </span>
                    {payment.adjustmentType && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.adjustmentType === 'surcharge' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {payment.adjustmentType === 'surcharge' ? 'Multa' : 'Descuento'}
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                      ${payment.amount.toLocaleString('es-AR')}
                    </span>
                    {payment.adjustmentType && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                        (Base: ${payment.baseAmount.toLocaleString('es-AR')} {payment.adjustmentType === 'surcharge' ? '+' : '-'}${payment.adjustment.toLocaleString('es-AR')})
                      </span>
                    )}
                  </div>
                  {payment.adjustmentReason && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {payment.adjustmentReason}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleGenerateReceipt(payment)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    📄 Recibo
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(payment.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación para borrar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
            <p className="text-gray-900 dark:text-white mb-4">¿Estás seguro de eliminar este pago?</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onDeletePayment(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
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
          <p><strong>Inquilina:</strong> {tenant.name}</p>
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

const PropertyDetail = ({ property, tenants, payments, expenses, onBack, onAddTenant, onEditTenant, onDeleteTenant, onAddPayment, onDeletePayment, onAddExpense, onDeleteExpense }) => {
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
  {selectedTenant && (
    <PaymentsModal 
      tenant={selectedTenant} 
      payments={payments} 
      onClose={() => { setPaymentsModalOpen(false); setSelectedTenant(null); }} 
      onAddPayment={onAddPayment}
      onDeletePayment={onDeletePayment}  // ← AGREGÁ ESTA LÍNEA
    />
  )}
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

const ExpensesView = ({ expenses, properties, onBack, onAddExpense, onDeleteExpense }) => {
  const [expenseModalOpen, setExpenseModalOpen] = React.useState(false);
  
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

  const handleSaveExpense = (expenseData) => {
    onAddExpense(expenseData);
    setExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gastos</h1>
        
        {/* BOTÓN NUEVO */}
        <button 
          onClick={() => setExpenseModalOpen(true)} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          ➕ Agregar Gasto
        </button>
      </div>

      <StatCard 
        title="Gastos Totales" 
        value={`$${totalExpenses.toLocaleString('es-AR')}`} 
        icon="💸" 
        colorClass="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800" 
      />
      
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
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
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
        <td className="px-4 py-4">
          <button
            onClick={() => onDeleteExpense(expense.id)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            🗑️ Eliminar
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

          </table>
        </div>
      </div>

      {/* MODAL PARA AGREGAR GASTO */}
      <Modal 
        isOpen={expenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
        title="Agregar Gasto Global"
      >
        <ExpenseForm 
          onSave={handleSaveExpense} 
          onCancel={() => setExpenseModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

const ReceiptGenerator = ({ payment, tenant, onClose }) => {
  const receiptRef = React.useRef();
  const [isSharing, setIsSharing] = React.useState(false);

  // Calcular fecha de vencimiento (30 días después del pago)
  const paymentDate = new Date(payment.date);
  const dueDate = new Date(paymentDate);
  dueDate.setDate(dueDate.getDate() + 30);
  
  // Función para generar canvas optimizado
  const generateCanvas = async () => {
  const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
  const element = receiptRef.current;
  
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
    allowTaint: true,
  });
  
  return canvas;
};



  const handleDownloadImage = async () => {
    try {
      const canvas = await generateCanvas();
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `recibo-${tenant.name}-${payment.date}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('❌ Error al generar la imagen');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyImage = async () => {
    try {
      const canvas = await generateCanvas();
      
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('✅ ¡Imagen copiada!\n\nPegá en WhatsApp Web con Ctrl+V');
        } catch (err) {
          alert('❌ No se pudo copiar. Usá "Descargar" en su lugar.');
        }
      }, 'image/png', 1.0);
      
    } catch (error) {
      alert('❌ Error al copiar la imagen');
    }
  };

  const handleShareWhatsApp = async () => {
    if (!navigator.share) {
      alert('⚠️ Tu navegador no soporta compartir. Usá "Descargar" o "Copiar".');
      return;
    }

    setIsSharing(true);

    try {
      const canvas = await generateCanvas();

      canvas.toBlob(async (blob) => {
        try {
          if (!blob) {
            throw new Error('No se pudo generar la imagen');
          }

          const timestamp = Date.now();
          const filename = `recibo_${tenant.name.replace(/\s+/g, '_')}_${timestamp}.png`;
          const file = new File([blob], filename, { 
            type: 'image/png',
            lastModified: timestamp
          });

          await navigator.share({
            files: [file],
            title: 'Recibo de Pago',
            text: `Recibo - ${tenant.name} - $${payment.amount.toLocaleString('es-AR')}`
          });

          console.log('✅ Compartido exitosamente');

        } catch (shareError) {
          if (shareError.name === 'AbortError') {
            console.log('Usuario canceló');
          } else {
            console.error('Error al compartir:', shareError);
            const link = document.createElement('a');
            link.download = filename;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
            alert('❌ No se pudo compartir. La imagen se descargó.');
          }
        } finally {
          setIsSharing(false);
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error general:', error);
      alert('❌ Error al generar el recibo.');
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Recibo visual */}
      <div ref={receiptRef} className="bg-white rounded-lg border-2 border-gray-300 print:border-black mx-auto" style={{ maxWidth: '600px', padding: '2rem' }}>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">RECIBO DE PAGO</h2>
          <p className="text-gray-600 mt-2">Comprobante de alquiler</p>
        </div>
        
        <div className="border-t-2 border-b-2 border-gray-300 py-4 my-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Inquilino</p>
            <p className="font-bold text-2xl text-gray-900">{tenant.name}</p>
          </div>
        </div>

        {/* Desglose si hay ajustes */}
        {payment.adjustmentType && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Monto base:</span>
              <span className="font-semibold text-gray-900">${payment.baseAmount.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className={payment.adjustmentType === 'surcharge' ? 'text-red-600' : 'text-green-600'}>
                {payment.adjustmentType === 'surcharge' ? 'Multa/Cargo:' : 'Descuento:'}
              </span>
              <span className={payment.adjustmentType === 'surcharge' ? 'text-red-600' : 'text-green-600'}>
                {payment.adjustmentType === 'surcharge' ? '+' : '-'}${payment.adjustment.toLocaleString('es-AR')}
              </span>
            </div>
            {payment.adjustmentReason && (
              <p className="text-xs text-gray-600 italic mt-2">Motivo: {payment.adjustmentReason}</p>
            )}
          </div>
        )}

        <div className="my-6 text-center bg-green-50 p-6 rounded-lg">
          <p className="text-gray-600 mb-2">Total Pagado</p>
          <p className="text-4xl md:text-5xl font-bold text-green-600 break-words px-2">
          ${payment.amount.toLocaleString('es-AR')}
          </p>
        </div>


        <div className="mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Fecha de Pago</p>
            <p className="font-bold text-lg text-gray-800">
              {new Date(payment.date).toLocaleDateString('es-AR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">Renta de: 30 días</p>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-yellow-800 font-medium mb-1">PRÓXIMO PAGO VENCE</p>
            <p className="text-2xl font-bold text-yellow-900">
              {dueDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 pt-4 text-center text-sm text-gray-600">
          <p>Este recibo certifica el pago del alquiler</p>
        </div>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        <button 
          onClick={handleDownloadImage}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <span>📥</span>
          <span className="hidden sm:inline">Descargar</span>
        </button>
        
        <button 
          onClick={handleCopyImage}
          className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <span>📋</span>
          <span className="hidden sm:inline">Copiar</span>
        </button>
        
        <button 
          onClick={handleShareWhatsApp}
          disabled={isSharing}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSharing ? '⏳' : '💬'}</span>
          <span className="hidden sm:inline">{isSharing ? 'Generando...' : 'Compartir'}</span>
        </button>
        
        <button 
          onClick={handlePrint}
          className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <span>🖨️</span>
          <span className="hidden sm:inline">Imprimir</span>
        </button>
      </div>

      <button 
        onClick={onClose}
        className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold print:hidden"
      >
        ← Volver
      </button>
    </div>
  );
};




const CalendarView = ({ tenants, payments, properties, onBack }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedProperty, setSelectedProperty] = React.useState('all');

  // Calcular vencimientos del mes actual
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

  // Generar días del mes
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
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

  // Vencimientos ordenados por fecha
  const sortedVencimientos = [...vencimientos].sort((a, b) => a.dueDate - b.dueDate);
  const property = properties.find(p => p.id === selectedProperty);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📅 Calendario de Vencimientos</h1>
        <div></div>
      </div>

      {/* Filtro por propiedad */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por propiedad:</label>
        <select
          value={selectedProperty}
          onChange={e => setSelectedProperty(e.target.value)}
          className="w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
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
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900' 
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
            <div className="w-4 h-4 border-2 border-indigo-500 rounded"></div>
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



// =================================
// COMPONENTE PRINCIPAL APP
// =================================
const App = () => {
  const [user, setUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  const [view, setView] = React.useState('dashboard');
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(null);
  const [theme, setTheme] = React.useState('light');
  
  const [properties, setProperties] = React.useState([]);
  const [tenants, setTenants] = React.useState([]);
  const [payments, setPayments] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);


  // Verificar autenticación
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  

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
    // 1. Primero borrar todos los pagos del inquilino
    const tenantPayments = payments.filter(p => p.tenantId === tenantId);
    for (const payment of tenantPayments) {
      await deleteDoc(doc(db, 'payments', payment.id));
    }
    
    // 2. Luego borrar el inquilino
    await deleteDoc(doc(db, 'tenants', tenantId));
    
  } catch (error) {
    alert('❌ Error al eliminar inquilino: ' + error.message);
  }
};


  const handleAddPayment = async (paymentData) => {
    try {
      await addDoc(collection(db, 'payments'), paymentData);
    } catch (error) {
      alert('Error al agregar pago: ' + error.message);
    }
  };

    const handleDeletePayment = async (paymentId) => {
  try {
    await deleteDoc(doc(db, 'payments', paymentId));
  } catch (error) {
    alert('Error al eliminar pago: ' + error.message);
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

  const handleLogout = async () => {
    await signOut(auth);
  };

  

  const renderContent = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard properties={properties} tenants={tenants} payments={payments} expenses={expenses} onSelectProperty={(id) => { setSelectedPropertyId(id); setView('propertyDetail'); }} />;
      case 'propertyDetail':
  const property = properties.find(p => p.id === selectedPropertyId);
  return (
    <PropertyDetail 
      property={property} 
      tenants={tenants} 
      payments={payments} 
      expenses={expenses} 
      onBack={() => setView('dashboard')} 
      onAddTenant={handleAddTenant} 
      onEditTenant={handleEditTenant} 
      onDeleteTenant={handleDeleteTenant} 
      onAddPayment={handleAddPayment}
      onDeletePayment={handleDeletePayment}  // ← AGREGÁ ESTA LÍNEA
      onAddExpense={handleAddExpense} 
      onDeleteExpense={handleDeleteExpense} 
    />
  );
      case 'debtors':
        return <DebtorsView tenants={tenants} payments={payments} onBack={() => setView('dashboard')} />;
      case 'vacant':
        return <VacantRoomsView properties={properties} tenants={tenants} onBack={() => setView('dashboard')} />;
        case 'calendar':
  return <CalendarView tenants={tenants} payments={payments} properties={properties} onBack={() => setView('dashboard')} />;

      case 'income':
        return <MonthlyIncomeView payments={payments} tenants={tenants} onBack={() => setView('dashboard')} />;
      case 'expenses':
  return <ExpensesView 
    expenses={expenses} 
    properties={properties} 
    onBack={() => setView('dashboard')} 
    onAddExpense={handleAddExpense}
    onDeleteExpense={handleDeleteExpense}  // ← AGREGAR ESTO
  />;


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

  // Si está cargando auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
  <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <h1 className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
            Gestor de Alquileres
          </h1>
          
          {/* Navegación desktop - EN LA MISMA LÍNEA */}
          <nav className="hidden lg:flex gap-2 flex-1 justify-center">
            <button 
              onClick={() => setView('dashboard')} 
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setView('debtors')} 
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              ⚠️ Deudores
            </button>
            <button 
              onClick={() => setView('vacant')} 
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              🏠 Habitaciones
            </button>
            <button 
              onClick={() => setView('income')} 
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              💰 Ingresos
            </button>
            <button 
              onClick={() => setView('expenses')} 
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              📉 Gastos
            </button>
            <button 
              onClick={() => setView('calendar')} 
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              📅 Calendario
            </button>
          </nav>

          {/* Botones de la derecha */}
          <div className="flex items-center gap-2">
            <span className="hidden xl:block text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </span>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg> :
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              }
            </button>

            <button 
              onClick={handleLogout} 
              className="hidden md:block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Salir
            </button>

            {/* BOTÓN HAMBURGUESA - SOLO TABLETS Y MÓVILES */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL/TABLET DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <nav className="flex flex-col p-2">
            <button 
              onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} 
              className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => { setView('debtors'); setMobileMenuOpen(false); }} 
              className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ⚠️ Deudores
            </button>
            <button 
              onClick={() => { setView('vacant'); setMobileMenuOpen(false); }} 
              className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              🏠 Habitaciones
            </button>
            <button 
              onClick={() => { setView('income'); setMobileMenuOpen(false); }} 
              className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              💰 Ingresos
            </button>
            <button 
              onClick={() => { setView('expenses'); setMobileMenuOpen(false); }} 
              className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              📉 Gastos
            </button>
            <button 
              onClick={() => { setView('calendar'); setMobileMenuOpen(false); }} 
              className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              📅 Calendario
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg font-medium"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>

    <main className="p-4 md:p-8">
      {renderContent()}
    </main>
  </div>
);

};

export default App;