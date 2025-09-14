# Traffic Fine Management System - Backend

This is the backend API for the Traffic Fine Management System, built with Node.js, Express, and MongoDB.

## Features Implemented

### Traffic Officer Functionalities

1. **Login / Authentication**

   - Officers securely log in with credentials (using Clerk authentication)

2. **Dashboard**

   - Quick overview: fines issued today, pending payments, total collected

3. **Issue Fine**

   - Input driver/license number (name auto retrieved), vehicle reg, offense type
   - App fetches fine amount (from OffenseTypes)
   - Generates Fine ID

4. **View Issued Fines**

   - List of fines they have issued
   - Filter/search by date, vehicle, or status (Paid, Unpaid)

5. **Fine Details**

   - Full info on each fine: driver, offense, amount, status

6. **Reports & Analytics**

   - Daily/weekly/monthly fines issued
   - Revenue collected vs pending
   - Export reports (JSON format)

7. **Audit Trail (Transparency)**
   - Every action logged (e.g., "Issued fine FN1234")

### Driver (Offender) Functionalities

1. **Fine Lookup**

   - Enter Fine ID
   - View fine details (offense, amount, officer, status)

2. **Payment Processing**

   - Pay via Mobile Money (Airtel Money, TNM Mpamba) or Bank Transfer
   - Secure integration with payment gateway

3. **Payment Confirmation**

   - Status of fine updated to "Paid"

4. **Payment History**
   - See list of past and pending fines

### Admin / Backend Functionalities

1. **Monitor System**

   - View all fines, payments, and officer activities

2. **Generate Reports**

   - Total fines issued (per officer, per region, per period)
   - Revenue breakdown and payment trends

3. **User Management**

   - Add/remove officers
   - Reset passwords

4. **Audit Logs**
   - Transparency into officer actions (to prevent fraud)

## API Endpoints

### Authentication

- `GET /api/users/me` - Get current user info
- `POST /api/users/` - Create user

### Officer Dashboard

- `GET /api/fines/dashboard` - Get dashboard statistics
- `GET /api/fines/analytics` - Get analytics data
- `GET /api/fines/my-fines` - Get all fines issued by officer
- `GET /api/fines/:id` - Get specific fine details
- `POST /api/fines/` - Issue a new fine
- `POST /api/fines/payment` - Process payment for a fine

### Driver Functions

- `GET /api/drivers/fines/:fineId` - Get fine by ID
- `GET /api/drivers/fines` - Search fines by driver license number
- `GET /api/drivers/payments/:driverLicenseNumber` - Get payment history
- `POST /api/drivers/payments` - Process payment for a fine

### Admin Functions

- `GET /api/admin/fines` - Get all fines
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/activities` - Get officer activities
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/reports` - Generate reports
- `GET /api/admin/users` - Get user list
- `POST /api/admin/users` - Add user
- `DELETE /api/admin/users/:id` - Remove user
- `POST /api/admin/users/:id/reset-password` - Reset user password

### Offense Types

- `GET /api/offenses/` - Get all offense types
- `GET /api/offenses/:id` - Get offense type by ID
- `POST /api/offenses/` - Create offense type (admin)
- `PUT /api/offenses/:id` - Update offense type (admin)
- `DELETE /api/offenses/:id` - Delete offense type (admin)

## Setup Instructions

1. Install dependencies:

   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:

   ```
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration values

4. Seed the database with initial offense types:

   ```
   npm run seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `CLERK_SECRET_KEY` - Clerk secret key for authentication

## Database Models

### User

- Represents traffic officers and admins
- Fields: clerkId, email, firstName, lastName, role, isActive

### Fine

- Represents issued traffic fines
- Fields: fineId, driverLicenseNumber, driverName, vehicleRegistration, offenseTypeId, offenseDetails, fineAmount, officerId, issuedAt, dueDate, status, paymentId

### OffenseType

- Represents types of traffic offenses
- Fields: code, description, amount, category

### Payment

- Represents payment transactions for fines
- Fields: paymentId, fineId, amount, paymentMethod, transactionId, payerId, status, paidAt

### AuditLog

- Represents system audit trail
- Fields: userId, action, description, ipAddress, userAgent, metadata

## Testing

To test the API endpoints without setting up the full database, you can run the test server:

```
node test-api.js
```

This will start a simple server with mock data to verify the API structure.
