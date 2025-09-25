import { useState } from 'react';
import Header from '../components/Header';

interface Fine {
  id: string;
  fineId: string;
  driverName: string;
  driverLicense: string;
  vehicleRegistration: string;
  offense: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  issuedDate: string;
  dueDate: string;
  officer: string;
}

export default function FinesManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Mock data
  const fines: Fine[] = [
    {
      id: '1',
      fineId: 'FN-2023-001',
      driverName: 'John Smith',
      driverLicense: 'DL-12345',
      vehicleRegistration: 'CAR-123',
      offense: 'Speeding',
      amount: 'MKW 2,500',
      status: 'Paid',
      issuedDate: '2023-06-15',
      dueDate: '2023-07-15',
      officer: 'Officer Johnson'
    },
    {
      id: '2',
      fineId: 'FN-2023-002',
      driverName: 'Mary Johnson',
      driverLicense: 'DL-67890',
      vehicleRegistration: 'TRK-456',
      offense: 'Parking Violation',
      amount: 'MKW 1,200',
      status: 'Pending',
      issuedDate: '2023-06-14',
      dueDate: '2023-07-14',
      officer: 'Officer Davis'
    },
    {
      id: '3',
      fineId: 'FN-2023-003',
      driverName: 'Robert Brown',
      driverLicense: 'DL-11111',
      vehicleRegistration: 'VAN-789',
      offense: 'Running Red Light',
      amount: 'MKW 3,000',
      status: 'Overdue',
      issuedDate: '2023-06-10',
      dueDate: '2023-07-10',
      officer: 'Officer Wilson'
    },
    {
      id: '4',
      fineId: 'FN-2023-004',
      driverName: 'Lisa Davis',
      driverLicense: 'DL-22222',
      vehicleRegistration: 'SUV-321',
      offense: 'No Seatbelt',
      amount: 'MKW 800',
      status: 'Paid',
      issuedDate: '2023-06-12',
      dueDate: '2023-07-12',
      officer: 'Officer Miller'
    },
  ];

  const filteredFines = fines.filter(fine => {
    const matchesSearch = 
      fine.fineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.driverLicense.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.vehicleRegistration.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || fine.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Overdue': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Fines Management" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="section-header">
            <h1 className="section-title">Fines Management</h1>
            <button className="btn btn-primary">
              Add New Fine
            </button>
          </div>
          
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">All Fines</h2>
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
                      placeholder="Search fines by ID, driver, license or vehicle..."
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
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
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
                    <th>Fine ID</th>
                    <th>Driver</th>
                    <th>License</th>
                    <th>Vehicle</th>
                    <th>Offense</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Issued</th>
                    <th>Due Date</th>
                    <th>Officer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFines.map((fine) => (
                    <tr key={fine.id}>
                      <td className="font-medium text-gray-900">{fine.fineId}</td>
                      <td className="text-gray-500">{fine.driverName}</td>
                      <td className="text-gray-500">{fine.driverLicense}</td>
                      <td className="text-gray-500">{fine.vehicleRegistration}</td>
                      <td className="text-gray-500">{fine.offense}</td>
                      <td className="text-gray-500 font-medium">{fine.amount}</td>
                      <td>
                        <span className={`badge ${getStatusColor(fine.status)}`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="text-gray-500">{fine.issuedDate}</td>
                      <td className="text-gray-500">{fine.dueDate}</td>
                      <td className="text-gray-500">{fine.officer}</td>
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