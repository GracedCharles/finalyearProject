# Adding New API Endpoints

This guide explains how to add new API endpoints to the frontend API service.

## Steps to Add a New Endpoint

### 1. Define the Data Types

First, define the TypeScript interfaces for the data structures used by your endpoint:

```typescript
// Add to the existing interfaces in api.tsx
export interface NewDataType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}
```

### 2. Add the API Function

Add your new function to the appropriate API namespace:

```typescript
// Add to the existing API functions
export const newApiNamespace = {
  getNewData: (): Promise<NewDataType[]> =>
    apiCall("/new-endpoint", { method: "GET" }),

  getNewDataById: (id: string): Promise<NewDataType> =>
    apiCall(`/new-endpoint/${id}`, { method: "GET" }),

  createNewData: (
    data: Omit<NewDataType, "id" | "createdAt">
  ): Promise<NewDataType> =>
    apiCall("/new-endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateNewData: (
    id: string,
    data: Partial<NewDataType>
  ): Promise<NewDataType> =>
    apiCall(`/new-endpoint/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteNewData: (id: string): Promise<{ message: string }> =>
    apiCall(`/new-endpoint/${id}`, { method: "DELETE" }),
};
```

### 3. Export the New Namespace

Make sure to export the new namespace:

```typescript
// Add to the existing exports
export default {
  userApi,
  offenseApi,
  fineApi,
  driverApi,
  adminApi,
  newApiNamespace, // Add your new namespace here
};
```

### 4. Use the New Endpoint

Import and use your new API functions in your components:

```typescript
import { newApiNamespace } from '../src/utils/api';

const MyComponent = () => {
  const [data, setData] = useState<NewDataType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await newApiNamespace.getNewData();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View>
      {data.map(item => (
        <Text key={item.id}>{item.name}</Text>
      ))}
    </View>
  );
};
```

## Best Practices

### Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const result = await apiFunction();
  // Handle success
} catch (error) {
  // Handle error appropriately
  console.error("API call failed:", error);
}
```

### Loading States

Implement loading states in your components:

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const result = await apiFunction();
    // Handle result
  } catch (err: any) {
    setError(err.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};
```

### Authentication

The `apiCall` function automatically handles authentication for endpoints that require it. No additional steps are needed for authenticated endpoints.

### Request Configuration

For more complex requests, you can pass additional options:

```typescript
const result = await apiCall("/endpoint", {
  method: "POST",
  headers: {
    "Custom-Header": "value",
  },
  body: JSON.stringify(data),
});
```

## Testing New Endpoints

### Unit Tests

Create unit tests for your new API functions:

```typescript
// In a test file
import { newApiNamespace } from "../src/utils/api";

describe("New API Functions", () => {
  test("should fetch new data", async () => {
    const mockData = [{ id: "1", name: "Test" }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await newApiNamespace.getNewData();
    expect(result).toEqual(mockData);
  });
});
```

### Manual Testing

Test your new endpoints manually by:

1. Ensuring the backend endpoint is implemented
2. Verifying the endpoint works with tools like Postman or curl
3. Testing the frontend integration

## Common Issues

### Network Errors

If you encounter network errors:

1. Verify the backend server is running
2. Check that the endpoint URL is correct
3. Ensure CORS is properly configured
4. Verify network connectivity

### Authentication Issues

If you get authentication errors:

1. Make sure the endpoint requires authentication (if so, ensure you're logged in)
2. Check that the Clerk token is being sent correctly
3. Verify the backend authentication middleware is configured correctly

### Data Validation Errors

If you get validation errors:

1. Check that you're sending the correct data structure
2. Verify all required fields are included
3. Ensure data types match the expected schema

## Example: Adding a Reports Endpoint

Here's a complete example of adding a new reports endpoint:

```typescript
// 1. Define the data type
export interface Report {
  id: string;
  title: string;
  data: any;
  generatedAt: string;
}

// 2. Add the API functions
export const reportApi = {
  generateReport: (params: {
    type: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Report> => {
    const queryString = `?${new URLSearchParams(params as any).toString()}`;
    return apiCall(`/reports/generate${queryString}`, { method: "POST" });
  },

  getReportById: (id: string): Promise<Report> =>
    apiCall(`/reports/${id}`, { method: "GET" }),

  getReportsList: (): Promise<Report[]> =>
    apiCall("/reports", { method: "GET" }),
};

// 3. Export the new namespace
export default {
  userApi,
  offenseApi,
  fineApi,
  driverApi,
  adminApi,
  reportApi, // Add the new namespace
};
```

This approach ensures consistency with the existing API service and makes it easy to maintain and extend.
