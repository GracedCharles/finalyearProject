/**
 * Utility functions for Clerk authentication
 */

/**
 * Disable Clerk telemetry to prevent the "Value is a number, expected an Object" error
 * and the "record is not a function" error
 */
export function disableClerkTelemetry() {
  try {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.Clerk) {
      // @ts-ignore
      window.Clerk.telemetry = { disabled: true };
    }
    
    // Also try to disable telemetry on the global object
    // @ts-ignore
    if (typeof global !== 'undefined' && global.Clerk) {
      // @ts-ignore
      global.Clerk.telemetry = { disabled: true };
    }
    
    // Also try to disable telemetry on the Expo global object
    // @ts-ignore
    if (typeof global !== 'undefined' && global.expo) {
      // @ts-ignore
      global.expo.Clerk = { telemetry: { disabled: true } };
    }
    
    // Additional fix for the "record is not a function" error
    // @ts-ignore
    if (typeof global !== 'undefined' && global.Clerk) {
      // @ts-ignore
      global.Clerk.__internal_record = undefined;
      // @ts-ignore
      global.Clerk.__telemetry = undefined;
      // @ts-ignore
      global.Clerk.record = undefined;
    }
    
    // Additional fixes for React Native environment
    // @ts-ignore
    if (typeof global !== 'undefined') {
      // @ts-ignore
      global.Clerk = global.Clerk || {};
      // @ts-ignore
      global.Clerk.telemetry = { disabled: true };
      // @ts-ignore
      global.Clerk.__internal_record = undefined;
      // @ts-ignore
      global.Clerk.__telemetry = undefined;
      // @ts-ignore
      global.Clerk.record = undefined;
    }
    
    // Disable telemetry on the window object if available
    // @ts-ignore
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.Clerk = window.Clerk || {};
      // @ts-ignore
      window.Clerk.telemetry = { disabled: true };
      // @ts-ignore
      window.Clerk.__internal_record = undefined;
      // @ts-ignore
      window.Clerk.__telemetry = undefined;
      // @ts-ignore
      window.Clerk.record = undefined;
    }
  } catch (error) {
    console.warn('Failed to disable Clerk telemetry:', error);
  }
}

/**
 * Initialize Clerk with telemetry disabled
 */
export function initializeClerk() {
  disableClerkTelemetry();
}

/**
 * Clerk provider options with telemetry disabled
 */
export const clerkProviderOptions = {
  telemetry: false,
};