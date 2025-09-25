import { useEffect, useState } from 'react';
import Header from '../components/Header';

interface SystemStats {
  totalFines: number;
  totalPayments: number;
  totalOfficers: number;
  totalDrivers: number;
  collectionRate: number;
}

export default function ApiTest() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would call the actual API
    // For now, we'll use mock data
    const fetchSystemStats = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setStats({
          totalFines: 1248,
          totalPayments: 906,
          totalOfficers: 24,
          totalDrivers: 842,
          collectionRate: 72.6,
        });
      } catch (err) {
        setError('Failed to fetch system statistics');
        console.error('Error fetching system stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="API Test" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="section-header">
            <h1 className="section-title">API Test</h1>
            <button className="btn btn-primary">
              Refresh Data
            </button>
          </div>
          
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">System Statistics</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="stat-card text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats?.totalFines}</div>
                    <div className="text-gray-600 mt-2">Total Fines</div>
                  </div>
                  
                  <div className="stat-card text-center">
                    <div className="text-3xl font-bold text-green-600">{stats?.totalPayments}</div>
                    <div className="text-gray-600 mt-2">Total Payments</div>
                  </div>
                  
                  <div className="stat-card text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats?.totalOfficers}</div>
                    <div className="text-gray-600 mt-2">Total Officers</div>
                  </div>
                  
                  <div className="stat-card text-center">
                    <div className="text-3xl font-bold text-yellow-600">{stats?.totalDrivers}</div>
                    <div className="text-gray-600 mt-2">Total Drivers</div>
                  </div>
                  
                  <div className="stat-card text-center">
                    <div className="text-3xl font-bold text-indigo-600">{stats?.collectionRate}%</div>
                    <div className="text-gray-600 mt-2">Collection Rate</div>
                  </div>
                </div>
                
                <div className="filter-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">API Status</h3>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-gray-700">Connected to backend API successfully</span>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Base URL: http://localhost:5000/api</p>
                    <p className="mt-2">Note: This is a mock implementation. In a real application, this would connect to your actual backend API.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}