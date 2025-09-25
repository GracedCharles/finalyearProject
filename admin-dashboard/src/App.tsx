"use client"

import { AlertTriangle, Clock, DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react"
import { useState } from "react"
import { Route, Routes } from "react-router-dom"
import "./App.css"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import ApiTest from "./pages/ApiTest"
import DriversManagement from "./pages/DriversManagement"
import FinesManagement from "./pages/FinesManagement"
import OfficersManagement from "./pages/OfficersManagement"
import Reports from "./pages/Reports"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const stats = [
    {
      title: "Total Fines",
      value: "1,248",
      change: "+12%",
      trend: "up",
      icon: AlertTriangle,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Payments",
      value: "342",
      change: "+5%",
      trend: "up",
      icon: Clock,
      iconColor: "bg-amber-100 text-amber-600",
    },
    {
      title: "Total Collected",
      value: "MKW 245,600",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      iconColor: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Active Officers",
      value: "24",
      change: "+2%",
      trend: "up",
      icon: Users,
      iconColor: "bg-violet-100 text-violet-600",
    },
  ]

  const recentFines = [
    {
      id: "FN-2023-001",
      driver: "John Smith",
      offense: "Speeding",
      amount: "MKW 2,500",
      status: "Paid",
      date: "2023-06-15",
    },
    {
      id: "FN-2023-002",
      driver: "Mary Johnson",
      offense: "Parking Violation",
      amount: "MKW 1,200",
      status: "Pending",
      date: "2023-06-14",
    },
    {
      id: "FN-2023-003",
      driver: "Robert Brown",
      offense: "Running Red Light",
      amount: "MKW 3,000",
      status: "Overdue",
      date: "2023-06-10",
    },
    {
      id: "FN-2023-004",
      driver: "Lisa Davis",
      offense: "No Seatbelt",
      amount: "MKW 800",
      status: "Paid",
      date: "2023-06-12",
    },
  ]

  const topOffenses = [
    { offense: "Speeding", count: 142, percentage: 35, color: "bg-blue-500" },
    { offense: "Parking Violation", count: 98, percentage: 24, color: "bg-amber-500" },
    { offense: "Running Red Light", count: 76, percentage: 19, color: "bg-rose-500" },
    { offense: "No Seatbelt", count: 64, percentage: 16, color: "bg-violet-500" },
    { offense: "Other", count: 24, percentage: 6, color: "bg-slate-500" },
  ]

  const DashboardContent = () => (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your traffic fine management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                    )}
                    <span className="text-sm font-medium ml-1 text-gray-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconColor}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Fines</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fine ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offense
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentFines.map((fine, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fine.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fine.driver}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fine.offense}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fine.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          fine.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : fine.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {fine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fine.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all fines →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Offenses</h2>
            <p className="text-sm text-gray-500 mt-1">Most common violations this month</p>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {topOffenses.map((offense, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{offense.offense}</span>
                    <span className="text-sm font-medium text-gray-700">{offense.count} ({offense.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${offense.color}`} 
                      style={{ width: `${offense.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Collection Rate</h3>
            <p className="text-sm text-gray-500 mt-1">Payment success rate</p>
          </div>
          <div className="p-6 flex items-center justify-center">
            <div className="relative">
              <svg className="w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="502.4"
                  strokeDashoffset="100"
                  transform="rotate(-90 96 96)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">82%</span>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 pb-4">Payment Collection Rate</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">Latest system events</p>
          </div>
          <div className="p-6 space-y-4">
            {[
              { action: "New fine issued", user: "Officer Johnson", time: "2 min ago" },
              { action: "Payment received", user: "Driver Smith", time: "15 min ago" },
              { action: "Officer registered", user: "Admin", time: "1 hour ago" },
              { action: "Report generated", user: "System", time: "2 hours ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header title="Traffic Fine Management" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <DashboardContent />
              </>
            }
          />
          <Route path="/fines" element={<FinesManagement />} />
          <Route path="/officers" element={<OfficersManagement />} />
          <Route path="/drivers" element={<DriversManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/api-test" element={<ApiTest />} />
        </Routes>
      </div>
    </div>
  )
}

export default App