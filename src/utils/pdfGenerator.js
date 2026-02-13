import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// -----------------------------------------------------------------------------
// REPOSICIÓN DEFENSIVA DE ARRAYS PARA TODOS LOS REPORTES (SIMPLIFICA TU VIDA)
// -----------------------------------------------------------------------------

function arr(val) {
  return Array.isArray(val) ? val : [];
}

// -----------------------------------------------------------------------------
// REPORTE MENSUAL
// -----------------------------------------------------------------------------

export const generateMonthlyReport = (data) => {
  // Saneamiento fuerte de todos los arrays usados
  const {
    month,
    year,
    income = [],
    expenses = [],
    properties = [],
    tenants = [],

    debtors = []
  } = data || {};

  // Defensas extra para arrays:
  const safeIncome = arr(income);
  const safeExpenses = arr(expenses);
  const safeProperties = arr(properties);
  const safeTenants = arr(tenants);
  const safeDebtors = arr(debtors);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte Mensual de Alquileres', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${month}/${year}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, 37, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(15, 42, pageWidth - 15, 42);

  let yPosition = 50;

  // Resumen financiero
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Financiero', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const totalIncome = safeIncome.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = safeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  doc.text(`Ingresos del mes: $${totalIncome.toLocaleString('es-AR')}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Gastos del mes: $${totalExpenses.toLocaleString('es-AR')}`, 20, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(balance >= 0 ? 0 : 255, balance >= 0 ? 128 : 0, 0);
  doc.text(`Balance: $${balance.toLocaleString('es-AR')}`, 20, yPosition);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  yPosition += 12;

  // Estadísticas generales
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estadísticas', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total propiedades: ${safeProperties.length}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total inquilinos activos: ${safeTenants.filter(t => t.contractStatus === 'activo').length}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Deudores: ${safeDebtors.length}`, 20, yPosition);
  yPosition += 12;

  // Tabla de ingresos
  if (safeIncome.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Ingresos', 15, yPosition);
    yPosition += 5;

    const incomeRows = safeIncome.map(payment => {
      const tenant = safeTenants.find(t => t.id === payment.tenantId);
      return [
        new Date(payment.date).toLocaleDateString('es-AR'),
        tenant ? tenant.name : 'N/A',
        `$${(payment.amount || 0).toLocaleString('es-AR')}`
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Fecha', 'Inquilino', 'Monto']],
      body: incomeRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Inquilinos al día (sin pago este mes)
  const safeUpToDate = arr(data.upToDateTenants);
  
  if (safeUpToDate.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Inquilinos al Día (Sin pago este mes)', 15, yPosition);
    yPosition += 5;

    const upToDateRows = safeUpToDate.map(tenant => [
      tenant.name,
      tenant.roomNumber || '-',
      tenant.phone || '-',
      'Al día'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Inquilino', 'Habitación', 'Teléfono', 'Estado']],
      body: upToDateRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontStyle: 'bold' }, // Emerald color
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Tabla de gastos
  if (safeExpenses.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Gastos', 15, yPosition);
    yPosition += 5;

    const expenseRows = safeExpenses.map(expense => {
      const property = safeProperties.find(p => p.id === expense.propertyId);
      return [
        new Date(expense.date).toLocaleDateString('es-AR'),
        property ? property.address : 'N/A',
        expense.category || '-',
        expense.description || '-',
        `$${(expense.amount || 0).toLocaleString('es-AR')}`
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Fecha', 'Propiedad', 'Categoría', 'Descripción', 'Monto']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Deudores
  if (safeDebtors.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Inquilinos con Deuda', 15, yPosition);
    yPosition += 5;

    const debtorRows = safeDebtors.map(debtor => {
      const months = debtor.paymentStatus?.months || 0;
      const monetaryDebt = debtor.paymentStatus?.debtAmount || 0;
      const rent = debtor.rentAmount || 0;
      
      const totalEstimatedDebt = (months * rent) + monetaryDebt;
      
      let monthsText = '-';
      if (months > 0) {
        monthsText = `${months} mes(es)${monetaryDebt > 0 ? ` + $${monetaryDebt.toLocaleString('es-AR')}` : ''}`;
      } else if (monetaryDebt > 0) {
        monthsText = 'Saldo impago';
      }

      return [
        debtor.name,
        debtor.phone,
        monthsText,
        totalEstimatedDebt > 0 
          ? `$${totalEstimatedDebt.toLocaleString('es-AR')}`
          : '-'
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Nombre', 'Teléfono', 'Meses Adeudados', 'Deuda Estimada']],
      body: debtorRows,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
};

// -----------------------------------------------------------------------------
// REPORTE DE INQUILINO (defensivo)
// -----------------------------------------------------------------------------

export const generateTenantReport = (tenant, payments, property) => {
  const paymentsArr = arr(payments);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Inquilino', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, 30, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(15, 35, pageWidth - 15, 35);

  let yPosition = 45;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Información Personal', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${tenant.name}`, 20, yPosition);
  yPosition += 7;
  doc.text(`DNI: ${tenant.dni}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Teléfono: ${tenant.phone}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Habitación: ${tenant.roomNumber}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Propiedad: ${property ? property.address : 'N/A'}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Fecha de entrada: ${new Date(tenant.entryDate).toLocaleDateString('es-AR')}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Monto mensual: $${tenant.rentAmount.toLocaleString('es-AR')}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Estado: ${tenant.contractStatus === 'activo' ? 'Activo' : 'Finalizado'}`, 20, yPosition);
  yPosition += 12;

  const totalPaid = paymentsArr.reduce((sum, p) => sum + p.amount, 0);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Pagos', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total pagos: ${paymentsArr.length}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total pagado: $${totalPaid.toLocaleString('es-AR')}`, 20, yPosition);
  yPosition += 12;

  if (paymentsArr.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Pagos', 15, yPosition);
    yPosition += 5;

    const paymentRows = paymentsArr
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(payment => {
        let adjustmentText = '-';

        if (payment.adjustmentType && payment.adjustmentType !== 'none') {
          const base = payment.baseAmount || 0;
          const adj = payment.adjustment || 0;
          const sign = payment.adjustmentType === 'surcharge' ? '+' : '-';
          adjustmentText = `Base: $${base.toLocaleString('es-AR')} ${sign}$${adj.toLocaleString('es-AR')}`;
        }

        return [
          new Date(payment.date).toLocaleDateString('es-AR'),
          adjustmentText,
          `$${(payment.amount || 0).toLocaleString('es-AR')}`,
          payment.adjustmentReason || '-'
        ];
      });

    autoTable(doc, {
      startY: yPosition,
      head: [['Fecha', 'Ajustes', 'Total', 'Motivo']],
      body: paymentRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 }
    });
  }

  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Página 1 de ${pageCount}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  return doc;
};

// -----------------------------------------------------------------------------
// REPORTE ANUAL defensivo
// -----------------------------------------------------------------------------

export const generateAnnualReport = (data) => {
  const {
    year,
    monthlyData = [],
    totalIncome = 0,
    totalExpenses = 0
  } = data || {};

  const safeMonthlyData = arr(monthlyData);


  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Reporte Anual ${year}`, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, 30, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(15, 35, pageWidth - 15, 35);

  let yPosition = 45;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Anual', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const balance = (typeof totalIncome === 'number' ? totalIncome : 0) -
                  (typeof totalExpenses === 'number' ? totalExpenses : 0);

  doc.text(`Ingresos totales: $${(totalIncome || 0).toLocaleString('es-AR')}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Gastos totales: $${(totalExpenses || 0).toLocaleString('es-AR')}`, 20, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(balance >= 0 ? 0 : 255, balance >= 0 ? 128 : 0, 0);
  doc.text(`Balance anual: $${balance.toLocaleString('es-AR')}`, 20, yPosition);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  yPosition += 12;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle Mensual', 15, yPosition);
  yPosition += 5;

  const monthlyRows = safeMonthlyData.map(month => [
    month.name,
    `$${(month.income || 0).toLocaleString('es-AR')}`,
    `$${(month.expenses || 0).toLocaleString('es-AR')}`,
    `$${(month.balance || 0).toLocaleString('es-AR')}`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Mes', 'Ingresos', 'Gastos', 'Balance']],
    body: monthlyRows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
    styles: { fontSize: 10 },
    margin: { left: 15, right: 15 }
  });

  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Página 1 de ${pageCount}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  return doc;
};
