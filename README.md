# Traffic Fine Management System

This is a comprehensive traffic fine management system with a React Native frontend and Node.js/Express backend.

## Project Structure

```
.
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Authentication middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── app.js           # Express application
│   └── ...
└── frontend/
    ├── app/             # React Native screens
    ├── src/
    │   ├── components/  # Reusable components
    │   └── utils/       # Utility functions and API service
    └── ...
```

## Features

### Backend

- RESTful API for traffic fine management
- User authentication with Clerk
- MongoDB database integration
- Fine issuance and payment processing
- Offense type management
- Admin dashboard and reporting
- Driver lookup functionality

### Frontend

- React Native mobile application
- Clerk authentication integration
- Dashboard with statistics
- Fine issuance interface
- Fine viewing and management
- Driver fine lookup
- Profile management

## API Service

The frontend connects to the backend through a comprehensive API service located in `frontend/src/utils/api.tsx`. This service provides typed functions for all backend endpoints.

### Key API Functions

- `userApi` - User management
- `offenseApi` - Offense type management
- `fineApi` - Fine issuance and management
- `driverApi` - Driver-facing endpoints
- `adminApi` - Administrative functions

## Setup

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Start the backend server:

   ```bash
   cd backend
   npm start
   ```

4. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

## Testing API Connectivity

You can test the API connectivity by running:

```bash
cd frontend
node test-api-connection.js
```

Or by navigating to the "API Test" page in the mobile app dashboard.

## Environment Variables

The backend requires the following environment variables:

- `MONGODB_URI` - MongoDB connection string
- `CLERK_SECRET_KEY` - Clerk secret key for authentication

## Development

The API service is fully typed with TypeScript interfaces for all data structures, making it easy to use with type safety.

For detailed API usage instructions, see `frontend/src/utils/API_USAGE.md`.
