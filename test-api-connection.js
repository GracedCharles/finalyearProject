// Simple script to test API connection
async function testApiConnection() {
  try {
    console.log('Testing backend connectivity...');
    
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
    
    // Test offense types endpoint (public)
    console.log('\n3. Testing /api/offenses endpoint (public):');
    const offenseResponse = await fetch('http://localhost:5000/api/offenses');
    console.log('Status:', offenseResponse.status);
    if (offenseResponse.ok) {
      const offenseData = await offenseResponse.json();
      console.log('Found', offenseData.length, 'offense types');
    } else {
      const errorData = await offenseResponse.json();
      console.log('Error:', errorData);
    }
    
    console.log('\nAPI test completed!');
    console.log('\nIf all tests show status 200, the backend is running correctly.');
    console.log('If you see network errors, make sure the backend server is running on port 5000.');
  } catch (error) {
    console.error('\nAPI test failed:', error.message);
    console.log('\nPlease make sure the backend server is running:');
    console.log('1. Open a new terminal');
    console.log('2. Navigate to the backend directory: cd m:\\finalyearProject\\backend');
    console.log('3. Start the server: npm start');
  }
}

testApiConnection();