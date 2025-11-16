// Validación de DNI (solo números, 7-8 dígitos)
export const validateDNI = (dni) => {
  const errors = [];
  
  if (!dni || dni.trim() === '') {
    errors.push('El DNI es obligatorio');
    return errors;
  }
  
  const dniNumber = dni.trim();
  
  if (!/^\d+$/.test(dniNumber)) {
    errors.push('El DNI debe contener solo números');
  }
  
  if (dniNumber.length < 7 || dniNumber.length > 8) {
    errors.push('El DNI debe tener entre 7 y 8 dígitos');
  }
  
  return errors;
};

// Validación de montos (no negativos, no vacíos, número válido)
export const validateAmount = (amount, fieldName = 'Monto') => {
  const errors = [];
  
  if (!amount || amount === '' || amount === null || amount === undefined) {
    errors.push(`${fieldName} es obligatorio`);
    return errors;
  }
  
  const numAmount = Number(amount);
  
  if (isNaN(numAmount)) {
    errors.push(`${fieldName} debe ser un número válido`);
  }
  
  if (numAmount <= 0) {
    errors.push(`${fieldName} debe ser mayor a 0`);
  }
  
  if (numAmount > 999999999) {
    errors.push(`${fieldName} es demasiado grande`);
  }
  
  return errors;
};

// Validación de campo requerido
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return [`${fieldName} es obligatorio`];
  }
  return [];
};

// Validación de número de habitación
export const validateRoomNumber = (roomNumber) => {
  const errors = [];
  
  if (!roomNumber || roomNumber === '' || roomNumber === null) {
    errors.push('Número de habitación es obligatorio');
    return errors;
  }
  
  const numRoom = Number(roomNumber);
  
  if (isNaN(numRoom)) {
    errors.push('Número de habitación debe ser un número');
  }
  
  if (numRoom <= 0) {
    errors.push('Número de habitación debe ser mayor a 0');
  }
  
  if (numRoom > 1000) {
    errors.push('Número de habitación demasiado grande');
  }
  
  return errors;
};
