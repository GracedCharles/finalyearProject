import { useState } from 'react';
import Header from '../components/Header';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: string;
  totalFines: number;
  totalPaid: number;
  outstandingAmount: number;
  status: 'Active' | 'Suspended';
}

export default function DriversManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Mock data
  const drivers: Driver[] = [
    {
      id: '1',
      name: 'John Smith',
      licenseNumber: 'DL-12345',
      email: 'john.smith@email.com',
      phone: '+265 999 123 456',
      address: 'Lilongwe, Malawi',
      totalFines: 3,
      totalPaid: 2,
      outstandingAmount: 2500,
      status: 'Active'
    },
    {
      id: '2',
      name: 'Mary Johnson',
      licenseNumber: 'DL-67890',
      email: 'mary.johnson@email.com',
      phone: '+265 888 234 567',
      address: 'Blantyre, Malawi',
      totalFines: 1,
      totalPaid: 1,
      outstandingAmount: 0,
      status: 'Active'
    },
    {
      id: '3',
      name: 'Robert Brown',
      licenseNumber: 'DL-11111',
      email: 'robert.brown@email.com',
      phone: '+265 777 345 678',
      address: 'Mzuzu, Malawi',
      totalFines: 5,
      totalPaid: 3,
      outstandingAmount: 8000,
      status: 'Suspended'
    },
    {
      id: '4',
      name: 'Lisa Davis',
      licenseNumber: 'DL-22222',
      email: 'lisa.davis@email.com',
      phone: '+265 666 456 789',
      address: 'Zomba, Malawi',
      totalFines: 2,
      totalPaid: 2,
      outstandingAmount: 0,
      status: 'Active'
    },
  ];

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'badge-success';
      case 'Suspended': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Drivers Management" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="section-header">
            <h1 className="section-title">Drivers Management</h1>
            <button className="btn btn-primary">
              Add New Driver
            </button>
          </div>
          
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">All Drivers</h2>
            </div>
            
            {/* Filters */}
            <div className="filter-section">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="search-bar">
                    <div className="search-icon">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search drivers by name, license or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button className="btn btn-outline mr-2">
                  Export to CSV
                </button>
                <button className="btn btn-primary">
                  Generate Report
                </button>
              </div>
            </div>
            
            {/* Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>License Number</th>
                    <th>Contact</th>
                    <th>Total Fines</th>
                    <th>Paid</th>
                    <th>Outstanding</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id}>
                      <td>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-800 font-medium">{driver.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-sm text-gray-500">{driver.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-500">{driver.licenseNumber}</td>
                      <td>
                        <div className="text-sm text-gray-900">{driver.email}</div>
                        <div className="text-sm text-gray-500">{driver.phone}</div>
                      </td>
                      <td className="text-gray-500">{driver.totalFines}</td>
                      <td className="text-gray-500">{driver.totalPaid}</td>
                      <td className="font-medium text-red-600">MKW {driver.outstandingAmount.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-button view">
                            View
                          </button>
                          <button className="action-button edit">
                            Edit
                          </button>
                          <button className="action-button delete">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="pagination">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of{' '}
                <span className="font-medium">4</span> results
              </div>
              <div className="flex space-x-2">
                <button className="btn btn-sm btn-outline">
                  Previous
                </button>
                <button className="btn btn-sm btn-outline">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}