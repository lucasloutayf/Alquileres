import React, { useState, useMemo } from 'react';
import { Plus, Minus, FileText, Trash2 } from 'lucide-react';
import { getTodayFormatted, addTimeToDate } from '../../utils/dateUtils';
import ReceiptGenerator from '../receipts/ReceiptGenerator';
import toast from 'react-hot-toast';

const PaymentsModal = ({ tenant, payments, onClose, onAddPayment, onDeletePayment }) => {
  const [amount, setAmount] = useState(tenant.rentAmount);
  const [date, setDate] = useState(getTodayFormatted());
  const [adjustment, setAdjustment] = useState(0);
  const [dueDate, setDueDate] = useState(getTodayFormatted());
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('none');
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const finalAmount = useMemo(() => {
    const base = parseInt(amount) || 0;
    const adj = parseInt(adjustment) || 0;
    if (adjustmentType === 'surcharge') return base + adj;
    if (adjustmentType === 'discount') return base - adj;
    return base;
  }, [amount, adjustment, adjustmentType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseInt(amount) <= 0) {
      toast.error('El monto base debe ser mayor a 0');
      return;
    }
    
    if (adjustmentType !== 'none') {
      if (!adjustment || parseInt(adjustment) <= 0) {
        toast.error('El monto de ajuste debe ser mayor a 0');
        return;
      }
      if (!adjustmentReason || adjustmentReason.trim() === '') {
        toast.error('Debe indicar el motivo del ajuste');
        return;
      }
    }
    
    const dateWithTime = addTimeToDate(date);
    const dueDateWithTime = addTimeToDate(dueDate);
    
    const paymentData = {
      tenantId: tenant.id,
      baseAmount: parseInt(amount),
      adjustment: adjustmentType !== 'none' ? parseInt(adjustment) : 0,
      adjustmentType: adjustmentType !== 'none' ? adjustmentType : null,
      adjustmentReason: adjustmentType !== 'none' ? adjustmentReason : null,
      amount: finalAmount,
      date: dateWithTime,
      dueDate: dueDateWithTime,
    };

    onAddPayment(paymentData);
    
    setAmount(tenant.rentAmount);
    setDate(getTodayFormatted());
    setAdjustment(0);
    setAdjustmentReason('');
    setAdjustmentType('none');
    setDueDate(getTodayFormatted());
  };

  const handleGenerateReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  const tenantPayments = payments
    .filter(p => p.tenantId === tenant.id)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto Base
            </label>
            <input 
              type="number" 
              required 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Pago
            </label>
            <input 
              type="date" 
              required 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Multas/Descuentos */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ajustes (Opcional)
          </label>
          
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
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="none">Sin ajuste</option>
                <option value="surcharge">Multa/Cargo</option>
                <option value="discount">Descuento</option>
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
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" 
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Motivo" 
                    value={adjustmentReason} 
                    onChange={e => setAdjustmentReason(e.target.value)} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" 
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
              <span className="font-medium text-gray-900 dark:text-white">
                ${parseInt(amount || 0).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className={adjustmentType === 'surcharge' ? 'text-red-600 dark:text-red-400 flex items-center gap-1' : 'text-green-600 dark:text-green-400 flex items-center gap-1'}>
                {adjustmentType === 'surcharge' ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Multa/Cargo:</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4" />
                    <span>Descuento:</span>
                  </>
                )}
              </span>
              <span className={adjustmentType === 'surcharge' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {adjustmentType === 'surcharge' ? '+' : '-'}${parseInt(adjustment || 0).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between items-center text-base font-bold border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
              <span className="text-gray-900 dark:text-white">Total a pagar:</span>
              <span className="text-blue-600 dark:text-blue-400 text-xl">
                ${finalAmount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        )}

        <div className="mt-3">
          <button 
            type="submit" 
            className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Registrar Pago
          </button>
        </div>
      </form>

      <div>
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Historial de Pagos</h3>
        {tenantPayments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay pagos registrados
          </p>
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
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        payment.adjustmentType === 'surcharge' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {payment.adjustmentType === 'surcharge' ? (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Multa</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-3 h-3" />
                            <span>Descuento</span>
                          </>
                        )}
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
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Recibo</span>
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(payment.id)}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
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
            <p className="text-gray-900 dark:text-white mb-4">
              ¿Estás seguro de eliminar este pago?
            </p>
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

export default PaymentsModal;
