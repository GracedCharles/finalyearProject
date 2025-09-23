// Simple test to verify authentication token handling
const jwt = require('jsonwebtoken');

// This is a mock test - in reality, you would get this from the Clerk SDK
const mockToken = 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zMmh0WlBrU0xCOE5DeFZDVVZ3MEJvNDBRTjciLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3NTg2MDgzMDksImZ2YSI6WzQ5LC0xXSwiaWF0IjoxNzU4NjA4MjQ5LCJpc3MiOiJodHRwczovL3VzYWJsZS1zdW5maXNoLTEuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzU4NjA4MjM5LCJzaWQiOiJzZXNzXzMzNVM4cGJ0WnVER1k3bWlDRjBuV2ZCeUlEQSIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzJtNURrVlRyam1mNEN1SzN0YXBwTGNKbVlsIiwidiI6Mn0.Dhe--Zk_Rgo5eFo3UY5oj0rvLHW4UQGiYFGUbgWk26crSO5CJSA20cYw4DBIbR8iZTrtkAxUBC4xtSvEAZLZ3D9FUqHUFuhqgXzID3BoSjwA5j5hAgM0e7NFz4RVOGg2s5kY0PXCOHvgsonfHrGnVTPh9aJNEwSIOxZnMXKy5oGrOfSyVCNkGc1eaCXh90QgftnD1aoC72tzGBLFaCoaPTtACY5JqAxngScy9_X68CIvGVqNIJRCMOt971OTncGm1F8O8c-xSZUbu6imdJNTTICxD0vfcExc7qCe5j0TL9lf0y5ja4RaGbhsC2hAidXsMRTltcFML4SQX_eePrnS1g';

console.log('Testing JWT token...');
console.log('Token length:', mockToken.length);

// Try to decode the token (without verifying)
try {
  const decoded = jwt.decode(mockToken);
  console.log('Decoded token:', decoded);
} catch (error) {
  console.error('Error decoding token:', error);
}

// Check if token is expired
try {
  const decoded = jwt.decode(mockToken);
  if (decoded && decoded.exp) {
    const expiryDate = new Date(decoded.exp * 1000);
    console.log('Token expiry date:', expiryDate);
    console.log('Token expired:', expiryDate < new Date());
  }
} catch (error) {
  console.error('Error checking token expiry:', error);
}