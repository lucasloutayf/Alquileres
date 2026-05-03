# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rentyo** is a rental property management SPA for Argentine landlords. It manages properties, tenants, payments, and expenses with real-time Firebase synchronization, PDF/Excel exports, receipt generation, and multi-language support (ES/EN/PT).

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build (output: dist/)
npm run preview   # Preview production build
npm run lint      # ESLint validation
npm run test      # Run all tests (Vitest)
```

Run a single test file:
```bash
npx vitest run src/utils/__tests__/paymentUtils.test.js
```

Run tests in watch mode:
```bash
npx vitest
```

Deploy to Firebase Hosting:
```bash
npm run build && firebase deploy --only hosting
```

## Architecture

### Data Flow

All data lives in **Firestore**, isolated per user (`where('userId', '==', userId)` on every query). The stack is:

```
Firebase Auth → AuthContext → useAuth() hook → components
Firestore       → firebase/firestore.js → custom hooks → components
```

**`src/firebase/firestore.js`** — single file containing all CRUD functions and real-time listeners for the four collections: `properties`, `tenants`, `payments`, `expenses`. Every write goes through `sanitizeObject()` (from `utils/security.js`) before hitting Firestore. Batch writes handle cascading deletes (e.g., deleting a property removes its tenants, payments, and expenses atomically).

**`src/hooks/`** — each domain has a custom hook (`useProperties`, `useTenants`, `usePayments`, `useExpenses`) that sets up real-time listeners and exposes CRUD operations with toast notifications. `useDashboardStats` aggregates data for the overview. These hooks are the primary data interface for components — do not call `firebase/firestore.js` directly from components.

### Routing & Code Splitting

**`src/App.jsx`** — root component. All routes are lazy-loaded with `React.lazy`. Wraps everything in `AuthProvider`, `Sentry.ErrorBoundary`, and `Toaster`. Theme (light/dark) state lives here.

Routes: `/` Dashboard, `/property/:id` PropertyDetail, `/debtors`, `/vacant`, `/calendar`, `/income`, `/expenses`, `/settings`, `/auth/action` (Firebase email actions), `/terms`, `/privacy`.

### Form Validation

Forms use **React Hook Form + Zod**. Schemas live in `src/schemas/` (`propertySchema.js`, `tenantSchema.js`, `expenseSchema.js`). Use `@hookform/resolvers/zod` to wire them. Always use the existing schemas rather than adding ad-hoc validation.

### Payment Status Logic

**`src/utils/paymentUtils.js`** — `getTenantPaymentStatus()` is the core debt calculation function. It computes months overdue, monetary debt, and due dates relative to the tenant's entry date and payment history. This is the source of truth for debtor/payment status across DebtorsView, CalendarView, and Dashboard.

### Styling

Tailwind CSS with a custom design system defined in `tailwind.config.js`:
- Dark mode via class strategy (`dark:` prefix)
- Custom color palette using HSL CSS variables
- Use `cn()` from `src/utils/cn.js` (clsx wrapper) for conditional class merging
- `src/utils/themeClasses.js` contains reusable Tailwind class strings for consistent theming

### Internationalization

i18next configured in `src/i18n/config.js`. Translation files in `src/i18n/locales/`. Use the `useTranslation()` hook from `react-i18next` for all user-facing strings. The app defaults to Spanish (es).

### Security

`src/utils/security.js` provides:
- `sanitizeObject()` — called before every Firestore write
- `isSafeString()` — guards against XSS patterns in inputs
- Argentina-specific validators: `isValidDNI()`, `isValidPhone()`

Firestore security rules are in `firestore.rules` — require auth on all reads/writes.

### Observability

- **Sentry** (`src/utils/sentry.js`) — error tracking, only initializes in production. Session replay enabled.
- **Google Analytics 4** (`src/utils/analytics.js`) — tracks key user actions as GA4 events.

### PDF / Export

- `src/utils/pdfGenerator.js` — report PDFs via jsPDF + jspdf-autotable
- `src/components/receipts/ReceiptGenerator.jsx` — tenant receipt generation
- `src/utils/exportUtils.js` — Excel export via XLSX

## Environment Variables

Required in `.env` (not committed):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Optional:
```
VITE_SENTRY_DSN
VITE_GA_MEASUREMENT_ID
```

## Testing

Tests use **Vitest** with jsdom and `@testing-library/jest-dom`. Setup file: `src/setupTests.js`.

Existing test coverage focuses on utilities and schemas:
- `src/utils/__tests__/` — dateUtils, validations, paymentUtils
- `src/hooks/__tests__/` — usePayments
- `src/schemas/__tests__/` — tenantSchema, propertySchema

Firebase is mocked in tests — do not introduce real Firestore calls in test files.
