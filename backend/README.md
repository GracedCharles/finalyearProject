# Traffic Fine Management System - Backend

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory with the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

3. **Start the Server**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /test` - Test endpoint to verify server is running
- `POST /api/users/setup` - Setup user profile (requires authentication)
- Other endpoints for fines, drivers, etc.

## Database Scripts

### Adding Test Driver Licenses

To add test driver license numbers to all existing users for testing purposes:

```bash
npm run add-test-licenses
```

This script:

1. Finds all users without driver license numbers
2. Generates unique test driver license numbers for each user
3. Updates the users in the database

Test licenses are generated in the format: `TEST-DL0001`, `TEST-DL0002`, etc.

## Admin Dashboard Features

The admin dashboard now includes functionality to manage user driver licenses:

- View driver license numbers in the user management table
- Edit driver license numbers for individual users
- Add driver license numbers to users who don't have them

## Frontend Integration

The frontend connects to the backend through a comprehensive API service located in `frontend/src/utils/api.tsx`. This service provides typed functions for all backend endpoints.

### Key Frontend API Functions

- `userApi` - User management
- `offenseApi` - Offense type management
- `fineApi` - Fine issuance and management
- `driverApi` - Driver-facing endpoints
- `adminApi` - Administrative functions

## Troubleshooting

If you encounter connection issues:

1. Ensure MongoDB is accessible
2. Verify the Clerk secret key is correct
3. Check that the server is running on port 5000
4. For Android emulator, use `http://10.0.2.2:5000` instead of localhost
5. Make sure CORS is properly configured (already handled in app.js)

## Testing API Connectivity

You can test the API connectivity from the frontend by:

1. Running the frontend application
2. Navigating to the "API Test" page in the dashboard
3. Or running the test script: `cd frontend && node test-api-connection.js`
