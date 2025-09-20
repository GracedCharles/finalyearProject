// Simple test script to verify backend API is working
async function testAPI() {
  try {
    console.log('Testing backend API endpoints...');
    
    // Test health endpoint
    console.log('\n1. Testing /health endpoint:');
    const healthResponse = await fetch('http://localhost:5000/health');
    console.log('Status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Data:', healthData);
    
    // Test test endpoint
    console.log('\n2. Testing /test endpoint:');
    const testResponse = await fetch('http://localhost:5000/test');
    console.log('Status:', testResponse.status);
    const testData = await testResponse.json();
    console.log('Data:', testData);
    
    // Test user routes (without auth)
    console.log('\n3. Testing /api/users/setup endpoint (without auth):');
    const setupResponse = await fetch('http://localhost:5000/api/users/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'

      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        address: 'Test Address',
        phoneNumber: '1234567890'
      })
    });
    console.log('Status:', setupResponse.status);
    const setupText = await setupResponse.text();
    console.log('Response:', setupText);
    
    console.log('\nAPI test completed!');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();