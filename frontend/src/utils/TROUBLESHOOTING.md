# API Connection Troubleshooting Guide

This document provides solutions for common issues when connecting the frontend to the backend API.

## Common Issues and Solutions

### 1. Network Request Failed Error

**Error Message**: `TypeError: Network request failed`

**Causes and Solutions**:

1. **Backend Server Not Running**
   - Make sure the backend server is running on `http://localhost:5000`
   - Start the backend server:
     ```bash
     cd m:\finalyearProject\backend
     npm start
     ```
   - Or for development with auto-restart:
     ```bash
     npm run dev
     ```

2. **Incorrect API Base URL**
   - The API service automatically uses the correct URL based on the platform:
     - For web and iOS: `http://localhost:5000/api`
     - For Android emulator: `http://10.0.2.2:5000/api`
     - For physical devices: Computer's IP address (e.g., `http://192.168.1.100:5000/api`)
   - If you need to change this, update the `API_BASE_URL` in `api.tsx`

3. **Firewall or Network Issues**
   - Ensure your firewall isn't blocking the connection
   - Try accessing the backend directly in your browser: `http://localhost:5000/health`

### 2. CORS Errors

**Error Message**: `Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:19006' has been blocked by CORS policy`

**Solution**:

- The backend already has CORS configured, but if you still see this error:
  - Check the CORS configuration in `backend/app.js`
  - Ensure the origin is properly allowed in the CORS settings

### 3. Authentication Errors

**Error Message**: `401 Unauthorized` or `403 Forbidden`

**Causes and Solutions**:

1. **Missing Authentication Token**
   - Ensure you're logged in through Clerk before making authenticated API calls
   - Check that the authentication token is being sent with requests

2. **Invalid Authentication Token**
   - Try logging out and logging back in
   - Clear your app's cache and data

3. **Token Not Refreshed**
   - The app now automatically refreshes tokens every minute
   - Check that the `AuthTokenUpdater` component in `ClerkProviderWrapper.tsx` is working correctly

### 4. Environment-Specific Issues

#### Android Emulator

- The API service automatically uses `http://10.0.2.2:5000/api` instead of `localhost`
- This is handled automatically in `api.tsx`

#### iOS Simulator

- `localhost` should work fine

#### Physical Devices

- Use your computer's IP address instead of `localhost`
- Example: `http://192.168.43.72:5000` (replace with your actual IP)
- Update the `COMPUTER_IP` variable in `api.tsx` accordingly

## Recent Fixes

### Authentication Token Handling

We've implemented a new authentication system that properly handles Clerk tokens:

1. **Global Token Storage**: Tokens are now stored globally and updated periodically
2. **Automatic Header Injection**: Authentication headers are automatically added to API requests
3. **Component Integration**: The `ClerkProviderWrapper` now includes an `AuthTokenUpdater` component that keeps the token fresh

### Platform-Specific URLs

The API service now automatically uses the correct URL based on the platform:

- Web and iOS: `http://localhost:5000/api`
- Android emulator: `http://10.0.2.2:5000/api`
- Physical devices: `http://YOUR_COMPUTER_IP:5000/api`

### Improved Error Handling

The API service now provides more detailed error messages to help diagnose connection issues.

## Testing API Connectivity

### 1. Using the Built-in Test Script

Run the test script from the project root:

```bash
cd m:\finalyearProject
node test-api-connection.js
```

### 2. Using curl (Windows PowerShell)

```powershell
# Test health endpoint
Invoke-WebRequest -Uri http://localhost:5000/health -Method GET

# Test offense types endpoint
Invoke-WebRequest -Uri http://localhost:5000/api/offenses -Method GET
```

### 3. Using the API Test Page

1. Run the frontend application
2. Navigate to the dashboard
3. Tap the "API Test" quick action

### 4. Using the Retry Function

If the initial test fails, use the "Retry Test" button on the API Test page to try again.

## Debugging Steps

### 1. Verify Backend is Running

Check if you can access these URLs in your browser:

- `http://localhost:5000/health` - Should return health status
- `http://localhost:5000/test` - Should return test message
- `http://localhost:5000/api/offenses` - Should return offense types

### 2. Check Network Tab

Use your browser's developer tools to check:

1. Open developer tools (F12)
2. Go to the Network tab
3. Try to make an API call in the app
4. Look for failed requests and check their details

### 3. Enable Detailed Logging

The API service now includes detailed logging. Check the console output for:

- Request URLs
- Response status codes
- Error messages

### 4. Verify Authentication

Check that:

- You're logged in through Clerk
- The auth token is being set correctly
- The token is being sent with API requests

## Backend Configuration

### Environment Variables

Ensure your backend `.env` file has the correct settings:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
CLERK_SECRET_KEY=your_clerk_secret_key
```

### CORS Configuration

The backend should have CORS configured in `app.js`:

```javascript
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    exposedHeaders: ["Authorization"],
  })
);
```

## Authentication Flow

### How Authentication Works

1. **User Login**: When a user logs in through Clerk, a JWT token is generated
2. **Token Storage**: The token is stored globally in the app using `setAuthToken`
3. **Token Refresh**: The `AuthTokenUpdater` component refreshes the token every minute
4. **API Requests**: When making API calls, the token is automatically added to the Authorization header
5. **Backend Verification**: The backend verifies the token using Clerk's middleware

### Debugging Authentication

1. **Check Token Availability**:
   - Look for "Current auth token: Available" in the console logs
   - If it says "Not available", the user is not logged in

2. **Verify Token Format**:
   - A valid JWT token should be a long string with three parts separated by dots

3. **Test Token Manually**:
   - You can test the token by adding it to a request header manually:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:5000/api/users/me
   ```

## Testing on Physical Devices

When testing the app on a physical device:

1. **Ensure Both Devices Are on the Same Network**
   - Your computer and phone must be connected to the same Wi-Fi network

2. **Find Your Computer's IP Address**
   - On Windows, run `ipconfig` in Command Prompt
   - Look for "IPv4 Address" under your active network connection

3. **Update the API Configuration**
   - In `api.tsx`, update the `COMPUTER_IP` variable with your actual IP address
   - Example: `const COMPUTER_IP = '192.168.43.72';`

4. **Verify Backend Server Configuration**
   - The backend must be configured to accept connections from other devices
   - In `backend/app.js`, the server should listen on `0.0.0.0` (which it already does)

5. **Test the Connection**
   - From your phone's browser, try accessing `http://YOUR_COMPUTER_IP:5000/health`
   - You should see a JSON response with status "OK"

6. **Firewall Considerations**
   - Make sure your computer's firewall allows connections on port 5000
   - You may need to add an exception for Node.js or port 5000

## Additional Tips

1. **Restart Both Servers**: Sometimes restarting both the frontend and backend servers helps resolve connection issues.

2. **Check Ports**: Ensure no other applications are using port 5000.

3. **Network Connectivity**: If working in a corporate environment, check if there are any network policies blocking the connection.

4. **SSL Issues**: If you see SSL-related errors, you might need to configure your development environment to allow insecure connections.

5. **Version Compatibility**: Ensure your Node.js version is compatible with the project requirements.

If you continue to experience issues after trying these solutions, please check the console logs for more detailed error messages and contact the development team for further assistance.
