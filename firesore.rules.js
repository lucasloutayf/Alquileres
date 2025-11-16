rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: verificar que el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // PROPIEDADES
    match /properties/{propertyId} {
      allow read, write: if isAuthenticated();
    }

    // INQUILINOS
    match /tenants/{tenantId} {
      allow read, write: if isAuthenticated();
      
      // Validaciones básicas al crear/actualizar
      allow create: if isAuthenticated()
        && request.resource.data.name is string
        && request.resource.data.dni is string
        && request.resource.data.phone is string
        && request.resource.data.rentAmount is int
        && request.resource.data.rentAmount > 0;
      
      allow update: if isAuthenticated()
        && request.resource.data.name is string
        && request.resource.data.dni is string
        && request.resource.data.phone is string
        && request.resource.data.rentAmount is int
        && request.resource.data.rentAmount > 0;
    }

    // PAGOS
    match /payments/{paymentId} {
      allow read, write: if isAuthenticated();
      
      // Validaciones
      allow create: if isAuthenticated()
        && request.resource.data.amount is int
        && request.resource.data.amount > 0
        && request.resource.data.tenantId is string
        && request.resource.data.date is string;
    }

    // GASTOS
    match /expenses/{expenseId} {
      allow read, write: if isAuthenticated();
      
      // Validaciones
      allow create: if isAuthenticated()
        && request.resource.data.amount is int
        && request.resource.data.amount > 0
        && request.resource.data.propertyId is string
        && request.resource.data.category is string;
    }
  }
}
