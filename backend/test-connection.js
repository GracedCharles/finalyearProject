async function testConnection() {
  try {
    console.log('Testing connection to backend server...');
    
    // Test the health endpoint
    const healthResponse = await fetch('http://localhost:5000/health');
    console.log('Health endpoint status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health endpoint data:', healthData);
    
    // Test the test endpoint
    const testResponse = await fetch('http://localhost:5000/test');
    console.log('Test endpoint status:', testResponse.status);
    const testData = await testResponse.json();
    console.log('Test endpoint data:', testData);
    
    console.log('Connection test completed successfully!');
  } catch (error) {
    console.error('Connection test failed:', error.message);
  }
}

testConnection();