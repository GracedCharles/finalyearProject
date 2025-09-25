import { useState } from 'react';
import Header from '../components/Header';

interface Officer {
  id: string;
  name: string;
  email: string;
  badgeNumber: string;
  department: string;
  rank: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  joinDate: string;
  finesIssued: number;
}

export default function OfficersManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Mock data
  const officers: Officer[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@traffic.gov',
      badgeNumber: 'TO-001',
      department: 'Central Traffic Unit',
      rank: 'Senior Officer',
      status: 'Active',
      joinDate: '2020-03-15',
      finesIssued: 127
    },
    {
      id: '2',
      name: 'Mary Johnson',
      email: 'mary.johnson@traffic.gov',
      badgeNumber: 'TO-002',
      department: 'North District',
      rank: 'Officer',
      status: 'Active',
      joinDate: '2021-07-22',
      finesIssued: 98
    },
    {
      id: '3',
      name: 'Robert Brown',
      email: 'robert.brown@traffic.gov',
      badgeNumber: 'TO-003',
      department: 'South District',
      rank: 'Officer',
      status: 'Suspended',
      joinDate: '2019-11-30',
      finesIssued: 156
    },
    {
      id: '4',
      name: 'Lisa Davis',
      email: 'lisa.davis@traffic.gov',
      badgeNumber: 'TO-004',
      department: 'East District',
      rank: 'Supervisor',
      status: 'Active',
      joinDate: '2018-05-10',
      finesIssued: 203
    },
  ];

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = 
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || officer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'badge-success';
      case 'Inactive': return 'badge-info';
      case 'Suspended': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Officers Management" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="section-header">
            <h1 className="section-title">Officers Management</h1>
            <button className="btn btn-primary">
              Add New Officer
            </button>
          </div>
          
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">All Officers</h2>
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
                      placeholder="Search officers by name, email, badge or department..."
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
                    <option value="Inactive">Inactive</option>
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
                    <th>Officer</th>
                    <th>Badge Number</th>
                    <th>Department</th>
                    <th>Rank</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Fines Issued</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfficers.map((officer) => (
                    <tr key={officer.id}>
                      <td>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-800 font-medium">{officer.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{officer.name}</div>
                            <div className="text-sm text-gray-500">{officer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-500">{officer.badgeNumber}</td>
                      <td className="text-gray-500">{officer.department}</td>
                      <td className="text-gray-500">{officer.rank}</td>
                      <td>
                        <span className={`badge ${getStatusColor(officer.status)}`}>
                          {officer.status}
                        </span>
                      </td>
                      <td className="text-gray-500">{officer.joinDate}</td>
                      <td className="text-gray-500">{officer.finesIssued}</td>
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