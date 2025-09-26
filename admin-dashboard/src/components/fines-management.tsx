import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { adminApi } from "@/lib/api"
import {
    AlertTriangle,
    Camera,
    Clock,
    DollarSign,
    Edit,
    FileText,
    Plus,
    Search,
    Trash2
} from "lucide-react"
import { useEffect, useState } from "react"

interface FineType {
  _id: string
  fineId: string
  vehicleRegistration: string
  driverName: string
  driverLicenseNumber: string
  offenseTypeId: {
    _id: string
    code: string
    description: string
    amount: number
    category: string
    name?: string // Add optional name property
  }
  fineAmount: number
  status: "PENDING" | "PAID" | "OVERDUE" | "DISPUTED" | "CANCELLED"
  issuedAt: string
  dueDate: string
  location?: string // Add optional location property
  officerId: {
    _id: string
    firstName: string
    lastName: string
  }
  description: string
  evidence: string[]
}

export function FinesManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedViolation, setSelectedViolation] = useState("all")
  const [isAddFineOpen, setIsAddFineOpen] = useState(false)
  const [isEditFineOpen, setIsEditFineOpen] = useState(false)
  const [selectedFine, setSelectedFine] = useState<FineType | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [fines, setFines] = useState<FineType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load fines data
  useEffect(() => {
    const loadFines = async () => {
      try {
        setLoading(true)
        const data = await adminApi.getAllFines()
        setFines(data.fines || [])
      } catch (err) {
        setError('Failed to load fines data')
        console.error('Error fetching fines:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFines()
  }, [])

  const violationTypes = [
    "Speeding",
    "Red Light",
    "Parking",
    "Reckless Driving",
    "DUI",
    "No Insurance",
    "Expired Registration",
    "Illegal Turn",
    "Stop Sign",
    "Other",
  ]

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Overdue</Badge>
      case "disputed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Disputed</Badge>
      case "cancelled":
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getViolationBadge = (type: string) => {
    const colors = {
      Speeding: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "Red Light": "bg-red-500/10 text-red-500 border-red-500/20",
      Parking: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "Reckless Driving": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      DUI: "bg-red-600/10 text-red-600 border-red-600/20",
    }
    const colorClass = colors[type as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20"
    return <Badge className={colorClass}>{type}</Badge>
  }

  const filteredFines = fines.filter((fine) => {
    const matchesSearch =
      fine.fineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.vehicleRegistration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fine.driverName && fine.driverName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === "all" || fine.status.toLowerCase() === selectedStatus
    const matchesViolation = selectedViolation === "all" || 
      (fine.offenseTypeId.category === selectedViolation) || 
      (fine.offenseTypeId.name === selectedViolation)

    const matchesTab = activeTab === "all" || fine.status.toLowerCase() === activeTab

    return matchesSearch && matchesStatus && matchesViolation && matchesTab
  })

  const handleEditFine = async (fine: FineType) => {
    try {
      // In a real implementation, you would open a dialog to edit the fine
      // For now, we'll just log the action
      console.log('Editing fine:', fine)
      setSelectedFine(fine)
      setIsEditFineOpen(true)
    } catch (err) {
      console.error('Error editing fine:', err)
    }
  }

  const handleDeleteFine = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this fine?')) {
        await adminApi.deleteFine(id)
        // Refresh the fines list
        const data = await adminApi.getAllFines()
        setFines(data.fines || [])
      }
    } catch (err) {
      console.error('Error deleting fine:', err)
      alert('Failed to delete fine: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleSaveFine = async (updatedFine: FineType) => {
    try {
      await adminApi.updateFine(updatedFine._id, updatedFine)
      // Refresh the fines list
      const data = await adminApi.getAllFines()
      setFines(data.fines || [])
      setIsEditFineOpen(false)
      setSelectedFine(null)
    } catch (err) {
      console.error('Error updating fine:', err)
      alert('Failed to update fine: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleIssueFine = async () => {
    try {
      // In a real implementation, you would collect form data and send it to the backend
      // For now, we'll just close the dialog
      setIsAddFineOpen(false)
      // Refresh the fines list
      const data = await adminApi.getAllFines()
      setFines(data.fines || [])
    } catch (err) {
      console.error('Error issuing fine:', err)
      alert('Failed to issue fine: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const getTabCount = (status: string) => {
    if (status === "all") return fines.length
    return fines.filter((fine) => fine.status.toLowerCase() === status).length
  }

  const totalRevenue = fines.filter((f) => f.status === "PAID").reduce((sum, f) => sum + f.fineAmount, 0)
  const pendingAmount = fines.filter((f) => f.status === "PENDING").reduce((sum, f) => sum + f.fineAmount, 0)
  const overdueAmount = fines.filter((f) => f.status === "OVERDUE").reduce((sum, f) => sum + f.fineAmount, 0)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-muted-foreground">Loading fines data...</p>
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
          <h2 className="text-2xl font-bold text-card-foreground">Fine Management</h2>
          <p className="text-muted-foreground">Issue, track, and manage traffic violations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddFineOpen} onOpenChange={setIsAddFineOpen}>
            <DialogTrigger>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Issue Fine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]" onClose={() => setIsAddFineOpen(false)}>
              <DialogHeader>
                <DialogTitle>Issue New Fine</DialogTitle>
                <DialogDescription>Create a new traffic violation fine with all required details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle Number</Label>
                    <Input id="vehicle" placeholder="ABC-123" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver">Driver Name</Label>
                    <Input id="driver" placeholder="John Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license">Driver License</Label>
                    <Input id="license" placeholder="DL123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="violation">Violation Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select violation" />
                      </SelectTrigger>
                      <SelectContent>
                        {violationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Fine Amount ($)</Label>
                    <Input id="amount" type="number" placeholder="150" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Main St & 5th Ave" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Detailed description of the violation..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officer">Issuing Officer</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select officer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFF001">Officer Johnson</SelectItem>
                      <SelectItem value="OFF002">Officer Smith</SelectItem>
                      <SelectItem value="OFF003">Officer Brown</SelectItem>
                      <SelectItem value="OFF004">Officer Wilson</SelectItem>
                      <SelectItem value="OFF005">Officer Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleIssueFine}>Issue Fine</Button>
              </DialogFooter>
              <DialogClose onClose={() => setIsAddFineOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{fines.length}</div>
            <p className="text-xs text-center text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">MK{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-center text-muted-foreground">From paid fines</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">MK{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-center text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">MK{overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-center text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Fines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Violations</CardTitle>
          <CardDescription>Manage and track all traffic fines and violations</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by fine number, vehicle, or driver..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedViolation} onValueChange={setSelectedViolation}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Violation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Violations</SelectItem>
                {violationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({getTabCount("pending")})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({getTabCount("paid")})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({getTabCount("overdue")})</TabsTrigger>
              <TabsTrigger value="disputed">Disputed ({getTabCount("disputed")})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fine Details</TableHead>
                  <TableHead>Driver & Vehicle</TableHead>
                  <TableHead>Violation</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFines.map((fine) => (
                  <TableRow key={fine._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">{fine.fineId}</p>
                        <p className="text-sm text-muted-foreground">{fine.location || 'Location not specified'}</p>
                        <p className="text-xs text-muted-foreground">by {fine.officerId?.firstName} {fine.officerId?.lastName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">{fine.driverName || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{fine.vehicleRegistration}</p>
                        <p className="text-xs text-muted-foreground">{fine.driverLicenseNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getViolationBadge(fine.offenseTypeId?.category || fine.offenseTypeId?.name || 'Other')}</TableCell>
                    <TableCell>
                      <p className="font-medium">${fine.fineAmount}</p>
                    </TableCell>
                    <TableCell>{getStatusBadge(fine.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(fine.dueDate).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">Issued: {new Date(fine.issuedAt).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            Open
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-card">
                          <DropdownMenuLabel className="text-start">Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditFine(fine)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Fine
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Camera className="mr-2 h-4 w-4" />
                            View Evidence
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Print Citation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteFine(fine._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Fine
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

      {/* Edit Fine Dialog */}
      <Dialog open={isEditFineOpen} onOpenChange={setIsEditFineOpen}>
        <DialogContent className="sm:max-w-[600px]" onClose={() => setIsEditFineOpen(false)}>
          <DialogHeader>
            <DialogTitle>Edit Fine</DialogTitle>
            <DialogDescription>Update fine details and status.</DialogDescription>
          </DialogHeader>
          {selectedFine && (
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle">Vehicle Number</Label>
                  <Input 
                    id="edit-vehicle" 
                    defaultValue={selectedFine.vehicleRegistration} 
                    onChange={(e) => setSelectedFine({...selectedFine, vehicleRegistration: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver">Driver Name</Label>
                  <Input 
                    id="edit-driver" 
                    defaultValue={selectedFine.driverName || ''} 
                    onChange={(e) => setSelectedFine({...selectedFine, driverName: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Fine Amount ($)</Label>
                  <Input 
                    id="edit-amount" 
                    type="number" 
                    defaultValue={selectedFine.fineAmount} 
                    onChange={(e) => setSelectedFine({...selectedFine, fineAmount: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    defaultValue={selectedFine.status} 
                    onValueChange={(value) => setSelectedFine({...selectedFine, status: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                      <SelectItem value="DISPUTED">Disputed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  defaultValue={selectedFine.description} 
                  onChange={(e) => setSelectedFine({...selectedFine, description: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={() => selectedFine && handleSaveFine(selectedFine)}
            >
              Save Changes
            </Button>
          </DialogFooter>
          <DialogClose onClose={() => setIsEditFineOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}