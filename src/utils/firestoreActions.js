import toast from 'react-hot-toast';

const NOT_AUTH_MSG = 'Usuario no autenticado';

/**
 * Wraps a firestore mutation with auth check, success toast, and error toast.
 *
 * Use { userId } when the operation requires authentication up front (writes
 * that need a userId to attach). Omit it for ops where the firestore layer
 * verifies ownership itself (updates/deletes that read the doc first).
 *
 * Returns the resolved value on success, undefined on failure or auth miss.
 */
export const runFirestoreAction = async (fn, { userId, successMsg, errorMsg } = {}) => {
  if (userId !== undefined && !userId) {
    toast.error(NOT_AUTH_MSG);
    return;
  }
  try {
    const result = await fn();
    if (successMsg) toast.success(successMsg);
    return result;
  } catch (error) {
    toast.error(`${errorMsg}: ${error.message}`);
  }
};
