/**
 * Utility functions for Clerk authentication
 */

/**
 * Disable Clerk telemetry to prevent the "Value is a number, expected an Object" error
 */
export function disableClerkTelemetry() {
  try {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.Clerk) {
      // @ts-ignore
      window.Clerk.telemetry = null;
    }
    
    // Also try to disable telemetry on the global object
    // @ts-ignore
    if (typeof global !== 'undefined' && global.Clerk) {
      // @ts-ignore
      global.Clerk.telemetry = null;
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
  telemetry: {
    disabled: true,
    debug: false,
  },
};