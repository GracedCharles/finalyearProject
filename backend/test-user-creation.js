const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function testUserCreation() {
  try {
    console.log('Testing user creation...');
    
    // Test creating a user
    const user = await clerkClient.users.createUser({
      emailAddress: ['test@example.com'],
      firstName: 'Test',
      lastName: 'User',
      password: 'TestPassword123!'
    });
    
    console.log('User created successfully:', user.id);
    
    // Clean up - delete the user
    await clerkClient.users.deleteUser(user.id);
    console.log('User deleted successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

testUserCreation();