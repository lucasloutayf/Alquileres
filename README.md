# 🏠 Gestor de Alquileres

Sistema de gestión integral de propiedades en alquiler, inquilinos, pagos y gastos. Desarrollado con React, Firebase y Tailwind CSS.

## 🚀 Características

### ✅ Gestión de Propiedades
- Vista general con ocupación y métricas
- Control de habitaciones disponibles
- Registro de gastos por propiedad

### 👥 Gestión de Inquilinos
- Alta, edición y baja de inquilinos
- Datos completos: DNI, teléfono, contactos de emergencia
- Estado de pagos y deudas en tiempo real
- Seguimiento de contratos (activo/finalizado)

### 💰 Gestión de Pagos
- Registro de pagos con fecha y monto
- Sistema de multas y descuentos con motivo
- Historial completo de pagos por inquilino
- **Generador de recibos** con múltiples opciones:
  - Descarga como imagen (PNG)
  - Compartir por WhatsApp
  - Copiar al portapapeles
  - Impresión directa

### 📊 Reportes y Estadísticas
- Dashboard con métricas en tiempo real
- Vista de deudores con estimación de deuda
- Ingresos mensuales (historial 12 meses)
- Gastos por categoría y por propiedad
- Calendario de vencimientos

### 🎨 Interfaz
- Diseño responsive (móvil, tablet, desktop)
- Tema claro/oscuro
- Notificaciones profesionales
- Ordenamiento de tablas

---

## 🛠️ Tecnologías

- **Frontend:** React 19, Vite
- **Estilos:** Tailwind CSS 3.4
- **Base de datos:** Firebase Firestore
- **Autenticación:** Firebase Auth
- **Despliegue:** Vercel
- **Notificaciones:** react-hot-toast
- **Generación de recibos:** html2canvas

---

## 📦 Instalación

### Requisitos previos
- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase

### Pasos

1. **Clonar el repositorio**

git clone https://github.com/lucasloutayf/Alquileres.git
cd Alquileres

2. **Instalar dependencias**
npm install

3. **Configurar Firebase**

Creá un archivo `.env` en la raíz del proyecto con tus credenciales de Firebase:
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-auth-domain
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id

4. **Iniciar en desarrollo**
npm run dev

5. **Abrir en el navegador**
http://localhost:5173

---

## 🗂️ Estructura del Proyecto

src/
├── components/
│ ├── common/ # Componentes reutilizables
│ │ ├── StatCard.jsx
│ │ ├── Modal.jsx
│ │ ├── BarChart.jsx
│ │ └── ConfirmModal.jsx
│ ├── forms/ # Formularios
│ │ ├── TenantForm.jsx
│ │ ├── ExpenseForm.jsx
│ │ └── PaymentsModal.jsx
│ ├── receipts/ # Generación de recibos
│ │ └── ReceiptGenerator.jsx
│ ├── views/ # Vistas principales
│ │ ├── Dashboard.jsx
│ │ ├── PropertyDetail.jsx
│ │ ├── DebtorsView.jsx
│ │ ├── VacantRoomsView.jsx
│ │ ├── MonthlyIncomeView.jsx
│ │ ├── ExpensesView.jsx
│ │ └── CalendarView.jsx
│ ├── layout/
│ │ └── Header.jsx
│ └── Login.jsx
├── hooks/
│ └── useFirestore.js # Hook personalizado para Firebase
├── utils/
│ ├── constants.js # Constantes globales
│ ├── paymentUtils.js # Utilidades de pagos
│ ├── dateUtils.js # Utilidades de fechas
│ └── validations.js # Validaciones de formularios
├── firebase/
│ ├── config.js # Configuración Firebase
│ └── firestore.js # Funciones Firestore
└── App.jsx # Componente principal


---

## 🔒 Seguridad

### Reglas de Firestore

El proyecto incluye reglas de seguridad en `firestore.rules`:
- Solo usuarios autenticados pueden acceder
- Validaciones de tipos de datos
- Prevención de datos corruptos

Para desplegar las reglas:
firebase deploy --only firestore:rules


### Validaciones Frontend

- DNI: solo números, 7-8 dígitos
- Montos: mayores a 0, no vacíos
- Campos requeridos con mensajes claros

---

## 🚢 Despliegue

### Vercel (recomendado)

1. **Conectar repositorio**
   - Ir a [vercel.com](https://vercel.com)
   - Importar proyecto desde GitHub
   
2. **Configurar variables de entorno**
   - Agregar todas las variables `VITE_FIREBASE_*`
   
3. **Desplegar**
   - Vercel despliega automáticamente en cada push a `main`

### Firebase Hosting (alternativa)

firebase init hosting
firebase deploy --only hosting

---

## 📱 Uso

### Login
1. Crear cuenta o iniciar sesión con email/contraseña
2. Acceder al dashboard principal

### Agregar Propiedad
- Desde el dashboard, agregar nueva propiedad
- Indicar dirección y total de habitaciones

### Gestionar Inquilinos
- Seleccionar propiedad
- Agregar inquilino con datos completos
- Registrar pagos y ver historial
- Generar recibos automáticamente

### Ver Reportes
- Deudores: lista con deuda estimada
- Ingresos: historial mensual
- Gastos: por categoría y propiedad
- Calendario: vencimientos marcados

---

## 🔮 Roadmap

### Fase 2 (Próximas features)
- [ ] Multi-tenancy (múltiples propietarios)
- [ ] Exportar reportes en PDF
- [ ] Recordatorios automáticos por email/WhatsApp
- [ ] Dashboard del inquilino
- [ ] Integración con Mercado Pago
- [ ] Backup automático de datos
- [ ] Testing (Vitest)

### Fase 3 (Futuro)
- [ ] App móvil (React Native)
- [ ] Firma digital de contratos
- [ ] Métricas avanzadas (ROI, predicciones)
- [ ] API pública

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:
1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/NuevaFeature`)
3. Commit de cambios (`git commit -m 'Agregar NuevaFeature'`)
4. Push a la rama (`git push origin feature/NuevaFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Lucas Loutayf**
- GitHub: [@lucasloutayf](https://github.com/lucasloutayf)
- Proyecto: [Alquileres](https://github.com/lucasloutayf/Alquileres)

---

## 📞 Contacto

Para consultas o sugerencias, abrir un issue en GitHub.

---

**⭐ Si te gustó el proyecto, dale una estrella en GitHub!**



