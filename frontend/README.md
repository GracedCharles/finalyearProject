# Traffic Fine Management System - Frontend

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the frontend directory with the following variables:

   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
   ```

   For physical devices, replace `10.0.2.2` with your machine's IP address.

3. **Start the Development Server**

   ```bash
   # Start Expo development server
   npx expo start

   # Start on Android emulator
   npx expo start --android

   # Start on iOS simulator
   npx expo start --ios
   ```

## Project Structure

- `app/` - Main application screens and routing
- `src/components/` - Reusable components
- `src/utils/` - Utility functions

## Troubleshooting

If you encounter connection issues:

1. Ensure the backend server is running
2. Verify the API URL in your `.env` file
3. For Android emulator, use `http://10.0.2.2:5000` (not localhost)
4. For physical devices, use your machine's IP address

## Common Issues

1. **AbortError: Aborted** - Usually means the backend server is not accessible or the request timed out
2. **Network Error** - Check that the backend server is running and accessible
3. **Clerk Authentication Issues** - Verify your Clerk keys are correct
