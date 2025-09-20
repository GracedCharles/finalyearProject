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

## Troubleshooting

If you encounter connection issues:

1. Ensure MongoDB is accessible
2. Verify the Clerk secret key is correct
3. Check that the server is running on port 5000
4. For Android emulator, use `http://10.0.2.2:5000` instead of localhost
