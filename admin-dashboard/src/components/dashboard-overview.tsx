"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminApi } from "@/lib/api"
import { AlertTriangle, Car, CheckCircle, Clock, DollarSign, Receipt, TrendingUp, Users, XCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface SystemStats {
  totalFines: number
  totalPayments: number
  totalUsers: number
  recentFines: number
  recentPayments: number
  totalRevenue: number
  pendingAmount: number
}

interface RecentFine {
  _id: string
  fineId: string
  vehicleRegistration: string
  fineAmount: number
  status: string
  issuedAt: string
  offenseTypeId: {
    category: string
  }
}

export function DashboardOverview() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [recentFines, setRecentFines] = useState<RecentFine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch system stats
        const statsData = await adminApi.getSystemStats()
        setStats(statsData)
        
        // Fetch recent fines
        const finesData = await adminApi.getAllFines({ limit: '5' })
        setRecentFines(finesData.fines || [])
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
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

  const statsData = [
    {
      title: "Total Fines",
      value: stats?.totalFines?.toLocaleString() || "0",
      change: "+12.5%",
      trend: "up",
      icon: Receipt,
      color: "text-chart-1",
    },
    {
      title: "Active Users",
      value: stats?.totalUsers?.toLocaleString() || "0",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-chart-2",
    },
    {
      title: "Revenue",
      value: `MK${stats?.totalRevenue?.toLocaleString() || "0"}`,
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-chart-3",
    },
    {
      title: "Pending Payments",
      value: `MK${stats?.pendingAmount?.toLocaleString() || "0"}`,
      change: "-5.1%",
      trend: "down",
      icon: Clock,
      color: "text-chart-4",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-center font-bold text-card-foreground">{stat.value}</div>
                <p className={`text-xs text-center ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Fines */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Recent Fines
            </CardTitle>
            <CardDescription>Latest traffic violations and their payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFines.map((fine) => (
                <div key={fine._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Car className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{fine.fineId}</p>
                      <p className="text-sm text-muted-foreground">Vehicle: {fine.vehicleRegistration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-card-foreground">MK{fine.fineAmount}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(fine.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(fine.status)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full bg-transparent">
                View All Fines
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2">
                <Receipt className="h-4 w-4" />
                Issue New Fine
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Users className="h-4 w-4" />
                Add User
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <TrendingUp className="h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Payment Gateway</p>
                  <p className="text-xs text-muted-foreground">3 failed transactions in last hour</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Overdue Fines</p>
                  <p className="text-xs text-muted-foreground">127 fines are past due date</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">System Status</p>
                  <p className="text-xs text-muted-foreground">All services operational</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}