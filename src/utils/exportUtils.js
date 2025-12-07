import * as XLSX from 'xlsx';

/**
 * Utilidades para exportar datos a Excel/CSV
 */

/**
 * Exporta datos genéricos a un archivo Excel
 * @param {Array} data - Array de objetos a exportar
 * @param {string} filename - Nombre del archivo (sin extensión)
 * @param {string} sheetName - Nombre de la hoja
 */
export const exportToExcel = (data, filename, sheetName = 'Datos') => {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Ajustar ancho de columnas automáticamente
  const maxWidth = 50;
  const colWidths = Object.keys(data[0]).map(key => {
    const maxLen = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLen + 2, maxWidth) };
  });
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Exporta múltiples hojas a un archivo Excel
 * @param {Object} sheets - Objeto con { nombreHoja: datos[] }
 * @param {string} filename - Nombre del archivo
 */
export const exportMultipleSheets = (sheets, filename) => {
  const workbook = XLSX.utils.book_new();
  
  Object.entries(sheets).forEach(([sheetName, data]) => {
    if (data && data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Formatea pagos para exportación
 */
export const formatPaymentsForExport = (payments, tenants) => {
  const tenantMap = new Map(tenants.map(t => [t.id, t]));
  
  return payments.map(payment => {
    const tenant = tenantMap.get(payment.tenantId);
    return {
      'Inquilino': tenant?.name || 'Desconocido',
      'Monto': payment.amount,
      'Fecha de Pago': formatDate(payment.date),
      'Fecha de Vencimiento': formatDate(payment.dueDate),
      'Tipo': payment.adjustmentType === 'surcharge' ? 'Con Recargo' : 
              payment.adjustmentType === 'discount' ? 'Con Descuento' : 'Normal',
      'Monto Base': payment.baseAmount || payment.amount,
      'Ajuste': payment.adjustment || 0,
      'Motivo Ajuste': payment.adjustmentReason || '-'
    };
  });
};

/**
 * Formatea gastos para exportación
 */
export const formatExpensesForExport = (expenses, properties) => {
  const propertyMap = new Map(properties.map(p => [p.id, p]));
  
  return expenses.map(expense => {
    const property = propertyMap.get(expense.propertyId);
    return {
      'Propiedad': property?.address || 'Desconocida',
      'Descripción': expense.description,
      'Categoría': expense.category,
      'Monto': expense.amount,
      'Fecha': formatDate(expense.date)
    };
  });
};

/**
 * Formatea inquilinos para exportación
 */
export const formatTenantsForExport = (tenants, properties) => {
  const propertyMap = new Map(properties.map(p => [p.id, p]));
  
  return tenants.map(tenant => {
    const property = propertyMap.get(tenant.propertyId);
    return {
      'Nombre': tenant.name,
      'DNI': tenant.dni,
      'Teléfono': tenant.phone,
      'Propiedad': property?.address || 'Desconocida',
      'Habitación': tenant.roomNumber,
      'Alquiler Mensual': tenant.rentAmount,
      'Fecha de Ingreso': formatDate(tenant.entryDate),
      'Fecha de Salida': tenant.exitDate ? formatDate(tenant.exitDate) : '-',
      'Estado': tenant.contractStatus === 'activo' ? 'Activo' : 'Finalizado'
    };
  });
};

/**
 * Formatea propiedades para exportación
 */
export const formatPropertiesForExport = (properties, tenants) => {
  return properties.map(property => {
    const propertyTenants = tenants.filter(t => t.propertyId === property.id);
    const activeTenants = propertyTenants.filter(t => t.contractStatus === 'activo');
    const totalRent = activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    
    return {
      'Dirección': property.address,
      'Total Habitaciones': property.totalRooms || 0,
      'Habitaciones Ocupadas': activeTenants.length,
      'Habitaciones Vacantes': (property.totalRooms || 0) - activeTenants.length,
      'Ingreso Mensual': totalRent,
      'Fecha de Creación': formatDate(property.createdAt)
    };
  });
};

/**
 * Exporta un reporte completo del mes
 */
export const exportMonthlyReport = (data) => {
  const { payments, expenses, tenants, properties, month, year } = data;
  
  const monthName = new Date(year, month, 1).toLocaleDateString('es-AR', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  const sheets = {
    'Pagos': formatPaymentsForExport(payments, tenants),
    'Gastos': formatExpensesForExport(expenses, properties),
    'Inquilinos': formatTenantsForExport(tenants, properties),
    'Propiedades': formatPropertiesForExport(properties, tenants)
  };
  
  exportMultipleSheets(sheets, `reporte-${monthName.replace(/\s+/g, '-')}`);
};

// Helper para formatear fechas
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};
