export const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const addTimeToDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${year}-${month}-${day}T12:00:00`;
};

export const formatDateToLocale = (date, locale = 'es-AR', options = {}) => {
  return new Date(date).toLocaleDateString(locale, options);
};

export const getTodayFormatted = () => {
  return new Date().toISOString().split('T')[0];
};
