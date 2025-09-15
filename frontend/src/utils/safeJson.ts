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
        if (seen.has(val)) {
          return "[Circular Reference]";
        }
        seen.add(val);
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
    console.error(prefix, safeStringify(error));
  } catch (logError) {
    console.error(prefix, error?.message || error?.toString?.() || '[Unknown Error]');
  }
}