import { useState } from 'react';
import Header from '../components/Header';

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState('fines');
  const [period, setPeriod] = useState('monthly');
  
  // Mock data for charts
  const finesData = [
    { month: 'Jan', count: 120, amount: 240000 },
    { month: 'Feb', count: 135, amount: 270000 },
    { month: 'Mar', count: 142, amount: 284000 },
    { month: 'Apr', count: 110, amount: 220000 },
    { month: 'May', count: 156, amount: 312000 },
    { month: 'Jun', count: 168, amount: 336000 },
  ];

  const paymentData = [
    { month: 'Jan', collected: 200000, pending: 40000 },
    { month: 'Feb', collected: 230000, pending: 40000 },
    { month: 'Mar', collected: 250000, pending: 34000 },
    { month: 'Apr', collected: 180000, pending: 40000 },
    { month: 'May', collected: 280000, pending: 32000 },
    { month: 'Jun', collected: 300000, pending: 36000 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reports & Analytics" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="section-header">
            <h1 className="section-title">Reports & Analytics</h1>
            <button className="btn btn-primary">
              Export Report
            </button>
          </div>
          
          {/* Report Filters */}
          <div className="filter-section">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  className="form-select"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="fines">Fines Issued</option>
                  <option value="payments">Payment Collection</option>
                  <option value="officers">Officer Performance</option>
                  <option value="violations">Violation Types</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  className="form-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button className="btn btn-outline">
                Export CSV
              </button>
              <button className="btn btn-primary">
                Generate Report
              </button>
            </div>
          </div>
          
          {/* Report Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Fines Issued Chart */}
            <div className="chart-container">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fines Issued Over Time</h3>
              <div className="h-64 flex items-end space-x-2 justify-center">
                {finesData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                      style={{ height: `${(item.count / 200) * 200}px` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Total Fines: {finesData.reduce((sum, item) => sum + item.count, 0)}
              </div>
            </div>
            
            {/* Payment Collection Chart */}
            <div className="chart-container">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Collection</h3>
              <div className="h-64 flex items-end space-x-2 justify-center">
                {paymentData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex items-end space-x-1">
                      <div 
                        className="w-5 bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                        style={{ height: `${(item.collected / 350000) * 180}px` }}
                      ></div>
                      <div 
                        className="w-5 bg-yellow-500 rounded-t hover:bg-yellow-600 transition-colors"
                        style={{ height: `${(item.pending / 350000) * 180}px` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                  <span className="text-gray-600">Collected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                  <span className="text-gray-600">Pending</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Total Fines</p>
                  <h3 className="text-2xl font-bold text-gray-900">831</h3>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Total Collected</p>
                  <h3 className="text-2xl font-bold text-gray-900">MKW 1,480,000</h3>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Pending Payments</p>
                  <h3 className="text-2xl font-bold text-gray-900">MKW 186,000</h3>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Collection Rate</p>
                  <h3 className="text-2xl font-bold text-gray-900">85.2%</h3>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}