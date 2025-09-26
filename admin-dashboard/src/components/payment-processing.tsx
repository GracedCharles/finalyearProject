"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { adminApi } from "@/lib/api"
import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  MoreHorizontal,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Smartphone,
  XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"

interface PaymentType {
  _id: string
  paymentId: string
  fineId: {
    _id: string
    fineId: string
    driverName: string
    vehicleRegistration: string
  }
  amount: number
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED"
  paidAt: string
  transactionId: string
  paymentMethod: string
}

interface ProcessPaymentData {
  fineId: string
  amount: number | string
  paymentMethod: string
  transactionId: string
  payerId: string
}

export function PaymentProcessing() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedMethod, setSelectedMethod] = useState("all")
  const [isProcessPaymentOpen, setIsProcessPaymentOpen] = useState(false)
  const [isRefundOpen, setIsRefundOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [payments, setPayments] = useState<PaymentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [processPaymentData, setProcessPaymentData] = useState<ProcessPaymentData>({
    fineId: "",
    amount: "",
    paymentMethod: "",
    transactionId: "",
    payerId: ""
  })
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundReason, setRefundReason] = useState("")

  // Load payments data
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminApi.getAllPayments()
        // Ensure correct typing for status
        const typedPayments = (data.payments || []).map((payment: any) => ({
          ...payment,
          status: payment.status as "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED"
        }))
        setPayments(typedPayments)
      } catch (err) {
        console.error('Error fetching payments:', err)
        setError('Failed to load payments data: ' + (err instanceof Error ? err.message : 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [])

  const handleProcessPayment = async () => {
    try {
      const paymentData = {
        ...processPaymentData,
        amount: typeof processPaymentData.amount === 'string' 
          ? parseFloat(processPaymentData.amount) 
          : processPaymentData.amount
      }
      
      await adminApi.processPayment(paymentData)
      setIsProcessPaymentOpen(false)
      
      // Reset form
      setProcessPaymentData({
        fineId: "",
        amount: "",
        paymentMethod: "",
        transactionId: "",
        payerId: ""
      })
      
      // Reload payments
      const data = await adminApi.getAllPayments()
      const typedPayments = (data.payments || []).map((payment: any) => ({
        ...payment,
        status: payment.status as "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED"
      }))
      setPayments(typedPayments)
    } catch (err) {
      console.error('Error processing payment:', err)
      setError('Failed to process payment: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleRefund = async () => {
    try {
      // In a real implementation, you would call a refund API endpoint
      // For now, we'll just update the UI to show the refund
      if (selectedPayment) {
        const updatedPayments = payments.map(payment => 
          payment._id === selectedPayment._id 
            ? { ...payment, status: "REFUNDED" as "REFUNDED" } 
            : payment
        )
        setPayments(updatedPayments)
        setIsRefundOpen(false)
      }
    } catch (err) {
      console.error('Error processing refund:', err)
      setError('Failed to process refund: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>
      case "refunded":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Refunded</Badge>
      case "disputed":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Disputed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "airtel_money":
        return <Smartphone className="h-4 w-4" />
      case "tnm_mpamba":
        return <Smartphone className="h-4 w-4" />
      case "bank_transfer":
        return <Banknote className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      airtel_money: "Airtel Money",
      tnm_mpamba: "TNM Mpamba",
      bank_transfer: "Bank Transfer",
    }
    return labels[method?.toLowerCase()] || method || "Unknown"
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.fineId.fineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.fineId.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.fineId.vehicleRegistration.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || payment.status.toLowerCase() === selectedStatus
    const matchesMethod = selectedMethod === "all" || payment.paymentMethod.toLowerCase() === selectedMethod
    const matchesTab = activeTab === "all" || payment.status.toLowerCase() === activeTab

    return matchesSearch && matchesStatus && matchesMethod && matchesTab
  })

  const getTabCount = (status: string) => {
    if (status === "all") return payments.length
    return payments.filter((payment) => payment.status.toLowerCase() === status).length
  }

  const totalRevenue = payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0)
  const failedAmount = payments.filter((p) => p.status === "FAILED").reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-muted-foreground">Loading payments data...</p>
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
          <h2 className="text-2xl font-bold text-card-foreground">Payment Processing</h2>
          <p className="text-muted-foreground">Manage payments, refunds, and transaction processing</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsProcessPaymentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">MK{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-center text-muted-foreground">Net after processing fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">MK{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-center text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">MK{failedAmount.toLocaleString()}</div>
            <p className="text-xs text-center text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{payments.length}</div>
            <p className="text-xs text-center text-muted-foreground">All payment records</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>Track and manage all payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="airtel_money">Airtel Money</SelectItem>
                  <SelectItem value="tnm_mpamba">TNM Mpamba</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Tabs */}
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
                  <TabsTrigger value="success">Completed ({getTabCount("success")})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({getTabCount("pending")})</TabsTrigger>
                  <TabsTrigger value="failed">Failed ({getTabCount("failed")})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Transactions Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Fine & Driver</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-card-foreground">{payment.paymentId}</p>
                          <p className="text-sm text-muted-foreground">{new Date(payment.paidAt).toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-card-foreground">{payment.fineId.fineId}</p>
                          <p className="text-sm text-muted-foreground">{payment.fineId.driverName}</p>
                          <p className="text-xs text-muted-foreground">{payment.fineId.vehicleRegistration}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.paymentMethod)}
                          <span className="text-sm">{getMethodLabel(payment.paymentMethod)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">MK{payment.amount}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => {
                            // We'll handle the dropdown manually since our component doesn't support asChild
                            // In a real implementation, you would implement proper dropdown functionality
                          }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Receipt className="mr-2 h-4 w-4" />
                              View Receipt
                            </DropdownMenuItem>
                            {payment.status === "SUCCESS" && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedPayment(payment)
                                setRefundAmount(payment.amount)
                                setIsRefundOpen(true)
                              }}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Process Refund
                              </DropdownMenuItem>
                            )}
                            {payment.status === "FAILED" && (
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateway Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gateway Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Airtel Money</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">TNM Mpamba</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Bank Transfer</span>
                </div>
                <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Delayed</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Payment Completed</p>
                  <p className="text-xs text-muted-foreground">TXN-2024-001 - MK150.00</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Payment Failed</p>
                  <p className="text-xs text-muted-foreground">TXN-2024-003 - Insufficient funds</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Refund Processed</p>
                  <p className="text-xs text-muted-foreground">TXN-2024-002 - MK200.00</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Process Payment Dialog */}
      <Dialog open={isProcessPaymentOpen} onOpenChange={setIsProcessPaymentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Manual Payment</DialogTitle>
            <DialogDescription>Record a manual payment for a traffic fine.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fine-number">Fine Number</Label>
              <Input 
                id="fine-number" 
                placeholder="TF-2024-001" 
                value={processPaymentData.fineId}
                onChange={(e) => setProcessPaymentData({...processPaymentData, fineId: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (MK)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="150.00"
                  value={processPaymentData.amount}
                  onChange={(e) => setProcessPaymentData({...processPaymentData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select 
                  value={processPaymentData.paymentMethod}
                  onValueChange={(value) => setProcessPaymentData({...processPaymentData, paymentMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airtel_money">Airtel Money</SelectItem>
                    <SelectItem value="tnm_mpamba">TNM Mpamba</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID</Label>
              <Input 
                id="transaction-id" 
                placeholder="Transaction reference number" 
                value={processPaymentData.transactionId}
                onChange={(e) => setProcessPaymentData({...processPaymentData, transactionId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payer-id">Payer ID</Label>
              <Input 
                id="payer-id" 
                placeholder="Driver license or mobile number" 
                value={processPaymentData.payerId}
                onChange={(e) => setProcessPaymentData({...processPaymentData, payerId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional payment details..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleProcessPayment}>Process Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>Issue a refund for this payment transaction.</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Transaction</Label>
                <div className="col-span-3">
                  <p className="text-sm font-medium">{selectedPayment.paymentId}</p>
                  <p className="text-xs text-muted-foreground">{selectedPayment.fineId.fineId}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Original Amount</Label>
                <div className="col-span-3">
                  <p className="text-sm font-medium">MK{selectedPayment.amount}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refund-amount" className="text-right">
                  Refund Amount
                </Label>
                <Input 
                  id="refund-amount" 
                  type="number" 
                  value={refundAmount} 
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refund-reason" className="text-right">
                  Reason
                </Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="duplicate">Duplicate Payment</SelectItem>
                    <SelectItem value="error">Processing Error</SelectItem>
                    <SelectItem value="dispute">Customer Dispute</SelectItem>
                    <SelectItem value="cancelled">Fine Cancelled</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refund-notes" className="text-right">
                  Notes
                </Label>
                <Textarea id="refund-notes" className="col-span-3" placeholder="Additional notes..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="destructive" onClick={handleRefund}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}