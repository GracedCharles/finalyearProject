/**
 * Safely stringify an object, handling circular references
 * @param obj The object to stringify
 * @param space The number of spaces to indent
 * @returns The stringified object or a fallback string
 */
export function safeStringify(obj: any, space: number = 2): string {
  const seen = new WeakSet();
  
  try {
    return JSON.stringify(obj, (key, val) => {
      // Handle circular references
      if (val != null && typeof val == "object") {
        // Check for special objects that might cause issues
        if (val instanceof Error) {
          // Convert Error objects to plain objects
          const errorObj: any = {
            name: val.name,
            message: val.message,
            stack: val.stack
          };
          
          // Add any additional properties
          Object.getOwnPropertyNames(val).forEach(propName => {
            if (!(propName in errorObj)) {
              errorObj[propName] = (val as any)[propName];
            }
          });
          
          // Check for circular references in the error object
          if (seen.has(errorObj)) {
            return "[Circular Error Reference]";
          }
          seen.add(errorObj);
          return errorObj;
        }
        
        if (seen.has(val)) {
          return "[Circular Reference]";
        }
        seen.add(val);
      }
      
      // Handle functions and other non-serializable values
      if (typeof val === 'function') {
        return `[Function: ${val.name || 'anonymous'}]`;
      }
      
      if (typeof val === 'undefined') {
        return '[undefined]';
      }
      
      if (val === null) {
        return null;
      }
      
      if (val instanceof Date) {
        return val.toISOString();
      }
      
      return val;
    }, space);
  } catch (error) {
    // If JSON.stringify fails for any reason, return a fallback
    try {
      return String(obj);
    } catch (stringError) {
      return "[Unserializable Object]";
    }
  }
}

/**
 * Safely log an object, handling circular references
 * @param prefix The prefix for the log message
 * @param obj The object to log
 */
export function safeLog(prefix: string, obj: any): void {
  try {
    console.log(prefix, safeStringify(obj));
  } catch (error) {
    console.log(prefix, obj?.toString?.() || '[Unknown Object]');
  }
}

/**
 * Safely log an error, handling circular references
 * @param prefix The prefix for the error message
 * @param error The error to log
 */
export function safeErrorLog(prefix: string, error: any): void {
  try {
    // Special handling for Clerk errors which may contain circular references
    if (error && typeof error === 'object' && error.constructor.name.includes('Clerk')) {
      // Create a shallow copy with only serializable properties
      const errorCopy: any = {};
      for (const key in error) {
        if (Object.prototype.hasOwnProperty.call(error, key)) {
          try {
            // Try to stringify each property to check if it's serializable
            JSON.stringify(error[key]);
            errorCopy[key] = error[key];
          } catch (e) {
            errorCopy[key] = `[Non-serializable: ${typeof error[key]}]`;
          }
        }
      }
      console.error(prefix, safeStringify(errorCopy));
    } else {
      console.error(prefix, safeStringify(error));
    }
  } catch (logError) {
    console.error(prefix, error?.message || error?.toString?.() || '[Unknown Error]');
  }
}