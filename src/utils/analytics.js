// Google Analytics 4 Integration
// Para usar: agregar tu Measurement ID de Google Analytics

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Inicializar GA4
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.log('Google Analytics no configurado (falta VITE_GA_MEASUREMENT_ID)');
    return;
  }

  // Cargar el script de gtag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Configurar gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // Lo manejamos manualmente con el router
  });
};

// Registrar vista de página
export const logPageView = (path) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title
  });
};

// Registrar evento personalizado
export const logEvent = (eventName, params = {}) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', eventName, params);
};

// Eventos comunes de la app
export const analytics = {
  // Auth
  login: (method = 'email') => logEvent('login', { method }),
  signUp: (method = 'email') => logEvent('sign_up', { method }),
  
  // Propiedades
  createProperty: () => logEvent('create_property'),
  deleteProperty: () => logEvent('delete_property'),
  
  // Inquilinos
  addTenant: () => logEvent('add_tenant'),
  removeTenant: () => logEvent('remove_tenant'),
  
  // Pagos
  recordPayment: (amount) => logEvent('record_payment', { value: amount }),
  
  // Gastos
  recordExpense: (amount, category) => logEvent('record_expense', { value: amount, category }),
  
  // Exportación
  exportData: (format) => logEvent('export_data', { format }),
  generateReceipt: () => logEvent('generate_receipt'),
  generateReport: () => logEvent('generate_report')
};
