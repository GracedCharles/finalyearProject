// Simple test script to verify API endpoints
const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Mock data
const mockOffenseTypes = [
  {
    _id: '1',
    code: 'SPD001',
    description: 'Speeding - Exceeding limit by 10-20 km/h',
    amount: 1000,
    category: 'Speeding'
  },
  {
    _id: '2',
    code: 'SPD002',
    description: 'Speeding - Exceeding limit by 21-30 km/h',
    amount: 2000,
    category: 'Speeding'
  }
];

const mockFines = [
  {
    _id: '1',
    fineId: 'FN123456',
    driverLicenseNumber: 'DL123456789',
    driverName: 'John Doe',
    vehicleRegistration: 'ABC123',
    offenseTypeId: '1',
    offenseDetails: 'Speeding - Exceeding limit by 10-20 km/h',
    fineAmount: 1000,
    officerId: 'OFF001',
    issuedAt: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    status: 'PENDING'
  }
];

// Test endpoints
app.get('/api/offenses', (req, res) => {
  res.json(mockOffenseTypes);
});

app.get('/api/fines/dashboard', (req, res) => {
  res.json({
    finesToday: 5,
    pendingFines: 12,
    totalCollected: 15000
  });
});

app.get('/api/fines/my-fines', (req, res) => {
  res.json({
    fines: mockFines,
    totalPages: 1,
    currentPage: 1
  });
});

app.listen(port, () => {
  console.log(`Test API server running at http://localhost:${port}`);
});