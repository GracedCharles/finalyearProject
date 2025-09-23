// Test script to simulate frontend API calls
async function testFrontendApi() {
  try {
    console.log('Testing frontend API service simulation...');
    
    // Simulate the apiCall function from api.tsx
    const apiCall = async (endpoint, options = {}) => {
      const API_BASE_URL = 'http://localhost:5000/api';
      const url = `${API_BASE_URL}${endpoint}`;
      
      // Add basic headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };
      
      console.log(`Making request to: ${url}`);
      
      try {
        const response = await fetch(url, config);
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Success: Received ${Array.isArray(data) ? data.length : 'data'} items`);
        return data;
      } catch (error) {
        console.error(`API call failed for ${url}:`, error.message);
        throw error;
      }
    };
    
    // Test offense types endpoint
    console.log('\n1. Testing /api/offenses endpoint:');
    const offenses = await apiCall('/offenses', { method: 'GET' });
    console.log('Offense types:', offenses);
    
    // Test users endpoint (this will likely fail without auth, but we can see the response)
    console.log('\n2. Testing /api/users/me endpoint (requires auth):');
    try {
      const user = await apiCall('/users/me', { method: 'GET' });
      console.log('User data:', user);
    } catch (error) {
      console.log('Expected auth error:', error.message);
    }
    
    console.log('\nFrontend API test completed!');
  } catch (error) {
    console.error('\nFrontend API test failed:', error.message);
  }
}

testFrontendApi();