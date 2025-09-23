# API Service Documentation

This directory contains the API service that connects the frontend with the backend.

## Files

- [api.tsx](file:///m:/finalyearProject/frontend/src/utils/api.tsx) - Main API service with all backend endpoints
- [api.test.tsx](file:///m:/finalyearProject/frontend/src/utils/api.test.tsx) - Test file for the API service
- [clerkUtils.ts](file:///m:/finalyearProject/frontend/src/utils/clerkUtils.ts) - Clerk authentication utilities
- [safeJson.ts](file:///m:/finalyearProject/frontend/src/utils/safeJson.ts) - JSON utility functions

## API Service ([api.tsx](file:///m:/finalyearProject/frontend/src/utils/api.tsx))

The API service provides functions to interact with all backend endpoints. It's organized into several namespaces:

### User API (`userApi`)

- `getCurrentUser()` - Get the current authenticated user
- `createUser(userData)` - Create a new user
- `setupUserProfile(profileData)` - Set up user profile

### Offense API (`offenseApi`)

- `getOffenseTypes()` - Get all offense types
- `getOffenseTypeById(id)` - Get an offense type by ID
- `createOffenseType(offenseData)` - Create a new offense type
- `updateOffenseType(id, offenseData)` - Update an offense type
- `deleteOffenseType(id)` - Delete an offense type

### Fine API (`fineApi`)

- `issueFine(fineData)` - Issue a new fine
- `getDashboardStats()` - Get dashboard statistics for officer
- `getAnalytics(params)` - Get analytics data for officer
- `getOfficerFines(params)` - Get all fines issued by the officer
- `getFineById(id)` - Get a specific fine by ID
- `processPayment(paymentData)` - Process payment for a fine

### Driver API (`driverApi`)

- `getFineByFineId(fineId)` - Get a fine by fine ID
- `searchFines(params)` - Search fines by driver license number
- `getPaymentHistory(driverLicenseNumber, params)` - Get payment history for a driver
- `processPayment(paymentData)` - Process payment for a fine

### Admin API (`adminApi`)

- `getAllFines(params)` - Get all fines (admin)
- `getAllPayments(params)` - Get all payments (admin)
- `getOfficerActivities(params)` - Get officer activities (audit logs)
- `generateReport(params)` - Generate reports
- `getSystemStats()` - Get system statistics
- `getUserList()` - Get user list
- `addUser(userData)` - Add user
- `removeUser(id)` - Remove user
- `resetPassword(id)` - Reset password

## Usage

Import the API functions in your components:

```typescript
import { fineApi, offenseApi } from "../src/utils/api";

// Example usage
const fetchOffenseTypes = async () => {
  try {
    const types = await offenseApi.getOffenseTypes();
    console.log("Offense types:", types);
  } catch (error) {
    console.error("Error fetching offense types:", error);
  }
};
```

## Error Handling

All API functions will throw errors that should be caught and handled appropriately in your components.
