/**
 * Sanitizes HR update payload before sending to backend
 * - Strips empty/undefined/null values
 * - Converts populated objects to IDs
 * - Removes server-managed fields
 */
export function sanitizeHrUpdatePayload(payload: any): any {
  const clean: any = {};

  // Fields that should NEVER be sent from frontend (server-managed)
  const serverManagedFields = new Set([
    'employeeId',
    'employeeNumber',
    'fullName',
    'password',
    'accessProfileId',
    'createdAt',
    'updatedAt',
    '_id',
    '__v',
  ]);

  Object.entries(payload).forEach(([key, value]) => {
    // Skip server-managed fields
    if (serverManagedFields.has(key)) {
      return;
    }

    // Skip empty values
    if (value === undefined || value === "" || value === null) {
      return;
    }

    // Special handling for date fields - remove invalid dates
    if (key.toLowerCase().includes('date')) {
      // If it's a string, validate it's a valid date
      if (typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return; // Skip invalid date strings
        }
        // Keep valid date strings (backend will convert to Date)
        clean[key] = value;
        return;
      }
      // If it's a Date object, validate it
      if (value instanceof Date) {
        if (isNaN(value.getTime())) {
          return; // Skip invalid Date objects
        }
        // Convert valid Date to ISO string
        clean[key] = value.toISOString();
        return;
      }
    }

    // Convert populated objects to IDs
    if (typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      if (value._id) {
        clean[key] = value._id;
        return;
      }
      // If it's an address object, keep it as is (but remove empty address)
      if (key === 'address') {
        // Only include address if it has at least one property
        const addressKeys = Object.keys(value);
        if (addressKeys.length > 0) {
          clean[key] = value;
        }
        return;
      }
      // Skip other complex objects
      return;
    }

    clean[key] = value;
  });

  return clean;
}

