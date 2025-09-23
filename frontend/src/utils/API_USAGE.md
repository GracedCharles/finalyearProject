# API Service Usage Guide

This document explains how to use the API service to connect the frontend with the backend.

## Overview

The API service (`api.tsx`) provides a set of functions to interact with the backend server. It's organized into several namespaces:

1. `userApi` - User-related endpoints
2. `offenseApi` - Offense type management
3. `fineApi` - Fine issuance and management
4. `driverApi` - Driver-facing endpoints (public)
5. `adminApi` - Administrative functions

## Setup

The API service is ready to use. All you need to do is import the functions you need:

```typescript
import { fineApi, offenseApi, userApi } from "../src/utils/api";
```

## Usage Examples

### Fetching Offense Types

```typescript
import { offenseApi } from "../src/utils/api";

const fetchOffenseTypes = async () => {
  try {
    const types = await offenseApi.getOffenseTypes();
    console.log("Offense types:", types);
  } catch (error) {
    console.error("Error fetching offense types:", error);
  }
};
```

### Issuing a Fine

```typescript
import { fineApi } from "../src/utils/api";

const issueFine = async () => {
  try {
    const fineData = {
      driverLicenseNumber: "DL123456",
      driverName: "John Doe",
      vehicleRegistration: "ABC123",
      offenseTypeId: "offense-type-id",
      dueDate: "2023-12-31",
    };

    const result = await fineApi.issueFine(fineData);
    console.log("Fine issued:", result);
  } catch (error) {
    console.error("Error issuing fine:", error);
  }
};
```

### Getting Dashboard Statistics

```typescript
import { fineApi } from "../src/utils/api";

const fetchDashboardStats = async () => {
  try {
    const stats = await fineApi.getDashboardStats();
    console.log("Dashboard stats:", stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
};
```

## Error Handling

All API functions will throw errors that should be caught and handled appropriately:

```typescript
try {
  const result = await fineApi.getDashboardStats();
  // Handle success
} catch (error) {
  // Handle error
  console.error("API call failed:", error.message);
}
```

## Authentication

The API service automatically handles authentication for endpoints that require it. The authentication is based on Clerk tokens which are included in the request headers.

## Testing

You can test the API connectivity by navigating to the "API Test" page from the dashboard quick actions.

## Troubleshooting

If you encounter network request failures:

1. Make sure the backend server is running on `http://localhost:5000`
2. Check that the backend endpoints are accessible
3. Verify that CORS is properly configured
4. Ensure you have network connectivity

You can test the backend directly with:

```bash
curl http://localhost:5000/health
```
