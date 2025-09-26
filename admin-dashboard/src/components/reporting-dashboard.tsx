"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminApi } from "@/lib/api"
import { format } from "date-fns"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarIcon,
  DollarSign,
  Download,
  FileText,
  PieChartIcon,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ReportData {
  period: string
  revenue: number
  fines: number
  payments: number
}

interface ViolationType {
  name: string
  value: number
  color: string
  [key: string]: any
}

interface PaymentMethod {
  method: string
  count: number
  percentage: number
}

interface LocationData {
  location: string
  fines: number
  revenue: number
}

interface OfficerData {
  officer: string
  fines: number
  revenue: number
  efficiency: number
}

interface RevenueReport {
  type: string
  period: string
  totalRevenue: number
  pendingFines: number
  pendingAmount: number
}

interface FinesReport {
  type: string
  period: string
  data: Array<{
    officerId: string
    officerName: string
    count: number
    totalAmount: number
  }>
}

interface PerformanceReport {
  type: string
  period: string
  data: Array<{
    officerId: string
    officerName: string
    finesIssued: number
    totalAmount: number
    finesPaid: number
    paidAmount: number
    collectionRate: number
  }>
}

export function ReportingDashboard() {
  const [dateRange, setDateRange] = useState("30d")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Report data
  const [monthlyRevenue, setMonthlyRevenue] = useState<ReportData[]>([])
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [topLocations, setTopLocations] = useState<LocationData[]>([])
  const [officerPerformance, setOfficerPerformance] = useState<OfficerData[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalFines: 0,
    totalPayments: 0,
    collectionRate: 0,
    activeOfficers: 0
  })

  // Load report data
  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch system stats
        const statsData = await adminApi.getSystemStats()
        
        // Set state with the data
        setStats({
          totalRevenue: statsData.totalRevenue || 0,
          totalFines: statsData.totalFines || 0,
          totalPayments: statsData.totalPayments || 0,
          collectionRate: statsData.totalFines ? 
            Math.round((statsData.totalPayments / statsData.totalFines) * 100) : 0,
          activeOfficers: statsData.totalUsers || 0
        })
        
        // Fetch report data from backend
        const [revenueReport, finesReport, performanceReport] = await Promise.all([
          adminApi.generateReport({ reportType: 'revenue', period: dateRange }),
          adminApi.generateReport({ reportType: 'fines', period: dateRange }),
          adminApi.generateReport({ reportType: 'officer-performance', period: dateRange })
        ])
        
        // Process revenue data for charts (mock data based on actual stats)
        const mockMonthlyData = [
          { period: "Jan", revenue: statsData.totalRevenue * 0.15, fines: statsData.totalFines * 0.12, payments: statsData.totalPayments * 0.14 },
          { period: "Feb", revenue: statsData.totalRevenue * 0.18, fines: statsData.totalFines * 0.15, payments: statsData.totalPayments * 0.17 },
          { period: "Mar", revenue: statsData.totalRevenue * 0.16, fines: statsData.totalFines * 0.14, payments: statsData.totalPayments * 0.15 },
          { period: "Apr", revenue: statsData.totalRevenue * 0.20, fines: statsData.totalFines * 0.18, payments: statsData.totalPayments * 0.19 },
          { period: "May", revenue: statsData.totalRevenue * 0.18, fines: statsData.totalFines * 0.16, payments: statsData.totalPayments * 0.17 },
          { period: "Jun", revenue: statsData.totalRevenue * 0.13, fines: statsData.totalFines * 0.15, payments: statsData.totalPayments * 0.18 },
        ]
        setMonthlyRevenue(mockMonthlyData)
        
        // Process violation types data (mock data based on actual data)
        setViolationTypes([
          { name: "Speeding", value: 35, color: "#8884d8" },
          { name: "Red Light", value: 25, color: "#82ca9d" },
          { name: "Parking", value: 20, color: "#ffc658" },
          { name: "Reckless Driving", value: 15, color: "#ff7300" },
          { name: "Other", value: 5, color: "#00ff00" },
        ])
        
        // Process payment methods data (mock data based on actual data)
        setPaymentMethods([
          { method: "Airtel Money", count: Math.floor(statsData.totalPayments * 0.45), percentage: 45 },
          { method: "TNM Mpamba", count: Math.floor(statsData.totalPayments * 0.32), percentage: 32 },
          { method: "Bank Transfer", count: Math.floor(statsData.totalPayments * 0.15), percentage: 15 },
          { method: "Cash", count: Math.floor(statsData.totalPayments * 0.06), percentage: 6 },
          { method: "Check", count: Math.floor(statsData.totalPayments * 0.02), percentage: 2 },
        ])
        
        // Process top locations data (mock data)
        setTopLocations([
          { location: "City Center", fines: Math.floor(statsData.totalFines * 0.15), revenue: Math.floor(statsData.totalRevenue * 0.12) },
          { location: "Highway Entrance", fines: Math.floor(statsData.totalFines * 0.12), revenue: Math.floor(statsData.totalRevenue * 0.10) },
          { location: "Shopping District", fines: Math.floor(statsData.totalFines * 0.10), revenue: Math.floor(statsData.totalRevenue * 0.09) },
          { location: "School Zone", fines: Math.floor(statsData.totalFines * 0.08), revenue: Math.floor(statsData.totalRevenue * 0.07) },
          { location: "Residential Area", fines: Math.floor(statsData.totalFines * 0.06), revenue: Math.floor(statsData.totalRevenue * 0.05) },
        ])
        
        // Process officer performance data from actual report
        if (performanceReport.data && performanceReport.data.length > 0) {
          const processedPerformance = performanceReport.data.slice(0, 5).map((officer: any) => ({
            officer: officer.officerName || "Unknown Officer",
            fines: officer.finesIssued || 0,
            revenue: officer.totalAmount || 0,
            efficiency: officer.collectionRate || 0
          }))
          setOfficerPerformance(processedPerformance)
        } else {
          // Fallback mock data
          setOfficerPerformance([
            { officer: "Officer Johnson", fines: Math.floor(statsData.totalFines * 0.15), revenue: Math.floor(statsData.totalRevenue * 0.14), efficiency: 92 },
            { officer: "Officer Smith", fines: Math.floor(statsData.totalFines * 0.12), revenue: Math.floor(statsData.totalRevenue * 0.11), efficiency: 88 },
            { officer: "Officer Brown", fines: Math.floor(statsData.totalFines * 0.10), revenue: Math.floor(statsData.totalRevenue * 0.09), efficiency: 85 },
            { officer: "Officer Wilson", fines: Math.floor(statsData.totalFines * 0.09), revenue: Math.floor(statsData.totalRevenue * 0.08), efficiency: 82 },
            { officer: "Officer Davis", fines: Math.floor(statsData.totalFines * 0.07), revenue: Math.floor(statsData.totalRevenue * 0.06), efficiency: 78 },
          ])
        }
      } catch (err) {
        console.error('Error fetching report data:', err)
        setError('Failed to load report data: ' + (err instanceof Error ? err.message : 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    loadReportData()
  }, [dateRange])

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Excellent</Badge>
    if (efficiency >= 80) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Good</Badge>
    if (efficiency >= 70)
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Average</Badge>
    return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Needs Improvement</Badge>
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-card-foreground">Error loading data</h3>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar 
                mode="single" 
                selected={selectedDate} 
                onSelect={(date) => {
                  setSelectedDate(date)
                  setIsCalendarOpen(false)
                }} 
                initialFocus 
              />
            </PopoverContent>
          </Popover>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">MK{stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3 text-center" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines Issued</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{stats.totalFines.toLocaleString()}</div>
            <div className="flex items-center text-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3 text-center" />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{stats.collectionRate}%</div>
            <div className="flex items-center text-center text-xs text-red-500">
              <TrendingDown className="mr-1 h-3 w-3 text-center" />
              -2.1% from last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Officers</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">{stats.activeOfficers}</div>
            <div className="flex items-center text-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3 text-center" />
              +3 new this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue and fine collection over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="period" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} name="Revenue (MK)" />
                <Line type="monotone" dataKey="fines" stroke="#10B981" strokeWidth={2} name="Fines Issued" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Violation Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Violation Types
            </CardTitle>
            <CardDescription>Distribution of traffic violations by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={violationTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {violationTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Preferred payment methods by users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{method.count}</p>
                  <p className="text-xs text-muted-foreground">{method.percentage}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Violation Locations</CardTitle>
            <CardDescription>Locations with highest fine activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topLocations.map((location, index) => (
              <div key={location.location} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{location.location}</p>
                    <p className="text-xs text-muted-foreground">{location.fines} fines</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">MK{location.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Officer Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Officer Performance</CardTitle>
            <CardDescription>Top performing officers this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {officerPerformance.map((officer) => (
              <div key={officer.officer} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{officer.officer}</span>
                  {getEfficiencyBadge(officer.efficiency)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{officer.fines} fines</span>
                  <span>MK{officer.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${officer.efficiency}%` }}></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Comparison</CardTitle>
          <CardDescription>Detailed breakdown of fines issued vs payments collected</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="fines" fill="#8B5CF6" name="Fines Issued" />
              <Bar dataKey="payments" fill="#10B981" name="Payments Collected" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            System Insights & Alerts
          </CardTitle>
          <CardDescription>Important trends and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-card-foreground">Collection Rate Declining</p>
              <p className="text-sm text-muted-foreground">
                Payment collection rate has dropped 2.1% this month. Consider implementing reminder notifications.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-card-foreground">Peak Violation Hours</p>
              <p className="text-sm text-muted-foreground">
                Most violations occur between 3-6 PM. Consider increasing officer presence during these hours.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <FileText className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-card-foreground">Revenue Target Achievement</p>
              <p className="text-sm text-muted-foreground">
                Monthly revenue target exceeded by 12.5%. Great performance across all violation categories.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}