# Authentication Setup Guide

This guide will help you set up Google OAuth and Phone Number authentication with Clerk.

## Prerequisites

1. A Clerk account at [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. A Google Cloud Console project (for Google OAuth)
3. A Twilio account (for phone authentication - optional, Clerk provides this)

## Step 1: Clerk Configuration

### 1.1 Create a Clerk Application

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Click "Add application"
3. Choose "React Native" as your framework
4. Name your application (e.g., "Traffic Fine System")

### 1.2 Configure OAuth Providers

1. In your Clerk dashboard, go to "User & Authentication" → "Social Connections"
2. Enable Google OAuth:
   - Click on "Google"
   - Toggle "Enable Google"
   - You'll need to configure this with Google Cloud Console (see Step 2)

### 1.3 Configure Phone Authentication

1. In your Clerk dashboard, go to "User & Authentication" → "Phone, SMS, and Email"
2. Enable Phone Number:
   - Toggle "Phone number"
   - Choose your SMS provider (Clerk provides Twilio integration)
   - Configure your phone number format

### 1.4 Get Your Publishable Key

1. In your Clerk dashboard, go to "API Keys"
2. Copy your "Publishable key"
3. Add it to your `.env` file:
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

## Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2.2 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `https://clerk.your-domain.com/v1/oauth_callback`
   - For production: Your Clerk OAuth callback URL

### 2.3 Configure Clerk with Google

1. In your Clerk dashboard, go to "User & Authentication" → "Social Connections"
2. Click on "Google"
3. Enter your Google Client ID and Client Secret
4. Save the configuration

## Step 3: Environment Configuration

Create a `.env` file in your frontend directory:

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Backend API URL (if needed)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Step 4: Testing

### 4.1 Google Authentication

1. Run your app: `npx expo start`
2. Go to the sign-in or sign-up screen
3. Click "Continue with Google"
4. Complete the OAuth flow

### 4.2 Phone Authentication

1. Go to the sign-in or sign-up screen
2. Click "Continue with Phone"
3. Enter a valid phone number
4. Enter the verification code sent via SMS

## Step 5: Production Deployment

### 5.1 Create Production Instance

1. In your Clerk dashboard, go to "Instances"
2. Click "Create Instance"
3. Choose "Production"
4. Configure your production instance settings

### 5.2 Update OAuth Redirect URIs

1. In Google Cloud Console, add your production domain
2. Update Clerk configuration with production URLs

### 5.3 Environment Variables

1. Set production environment variables
2. Use production Clerk publishable key (starts with `pk_live_`)
3. Configure production SMS provider

### 5.4 Development vs Production Keys

**Important**: You are currently using development keys which have strict usage limits and should not be used in production.

- Development keys start with `pk_test_`
- Production keys start with `pk_live_`
- Always use production keys when deploying to production

## Troubleshooting

### Common Issues

1. **Google OAuth not working**
   - Check redirect URIs in Google Cloud Console
   - Verify Client ID and Secret in Clerk
   - Ensure Google+ API is enabled

2. **Phone authentication not working**
   - Check SMS provider configuration in Clerk
   - Verify phone number format
   - Check Twilio account status (if using Twilio)

3. **Clerk key issues**
   - Ensure you're using the correct publishable key
   - Check that the key is properly set in environment variables
   - Verify the key is for the correct environment (test vs production)

4. **Telemetry Errors**
   - The app includes fixes for Clerk telemetry errors
   - If you still see "record is not a function" errors, they are being safely ignored
   - These errors do not affect functionality

### Demo Mode

If you want to test the app without setting up authentication:

1. Keep the placeholder key: `pk_test_placeholder`
2. Use the "Demo Mode" button on the sign-in screen
3. This will bypass all authentication

## Security Notes

1. Never commit your `.env` file to version control
2. Use different keys for development and production
3. Regularly rotate your API keys
4. Monitor authentication logs in Clerk dashboard

## Support

- Clerk Documentation: [https://clerk.com/docs](https://clerk.com/docs)
- Google OAuth Documentation: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- Expo Documentation: [https://docs.expo.dev](https://docs.expo.dev)
