"use client"

import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  FileText,
  Home,
  Receipt,
  Settings,
  Shield,
  Users
} from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "users", label: "User Management", icon: Users },
    { id: "fines", label: "Fine Management", icon: Receipt },
    { id: "payments", label: "Payment Processing", icon: CreditCard },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-card border-r border-border">
      <div className="flex items-center h-16 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">TrafficAdmin</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="flex items-center p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FineType {
  id: string
  fineNumber: string
  vehicleNumber: string
  driverName: string
  driverLicense: string
  violationType: string
  amount: number
  status: "pending" | "paid" | "overdue" | "disputed" | "cancelled"
  issueDate: string
  dueDate: string
  location: string
  officerName: string
  officerId: string
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

  // Mock data
  const fines: FineType[] = [
    {
      id: "1",
      fineNumber: "TF-2024-001",
      vehicleNumber: "ABC-123",
      driverName: "Michael Brown",
      driverLicense: "DL123456789",
      violationType: "Speeding",
      amount: 150,
      status: "paid",
      issueDate: "2024-01-15",
      dueDate: "2024-02-15",
      location: "Main St & 5th Ave",
      officerName: "Officer Johnson",
      officerId: "OFF001",
      description: "Exceeding speed limit by 15 mph in a 35 mph zone",
      evidence: ["speed_camera_001.jpg", "violation_photo_001.jpg"],
    },
    {
      id: "2",
      fineNumber: "TF-2024-002",
      vehicleNumber: "XYZ-789",
      driverName: "Sarah Wilson",
      driverLicense: "DL987654321",
      violationType: "Red Light",
      amount: 200,
      status: "pending",
      issueDate: "2024-01-14",
      dueDate: "2024-02-14",
      location: "Broadway & 2nd St",
      officerName: "Officer Smith",
      officerId: "OFF002",
      description: "Running red light at intersection",
      evidence: ["red_light_cam_002.jpg"],
    },
    {
      id: "3",
      fineNumber: "TF-2024-003",
      vehicleNumber: "DEF-456",
      driverName: "Robert Davis",
      driverLicense: "DL456789123",
      violationType: "Parking",
      amount: 75,
      status: "overdue",
      issueDate: "2024-01-10",
      dueDate: "2024-02-10",
      location: "City Hall Parking",
      officerName: "Officer Brown",
      officerId: "OFF003",
      description: "Parking in handicapped space without permit",
      evidence: ["parking_violation_003.jpg"],
    },
    {
      id: "4",
      fineNumber: "TF-2024-004",
      vehicleNumber: "GHI-321",
      driverName: "Emily Johnson",
      driverLicense: "DL321654987",
      violationType: "Speeding",
      amount: 125,
      status: "disputed",
      issueDate: "2024-01-12",
      dueDate: "2024-02-12",
      location: "Highway 101 Mile 45",
      officerName: "Officer Wilson",
      officerId: "OFF004",
      description: "Exceeding speed limit by 10 mph in a 55 mph zone",
      evidence: ["radar_reading_004.jpg", "officer_notes_004.pdf"],
    },
    {
      id: "5",
      fineNumber: "TF-2024-005",
      vehicleNumber: "JKL-654",
      driverName: "David Miller",
      driverLicense: "DL654321789",
      violationType: "Reckless Driving",
      amount: 300,
      status: "pending",
      issueDate: "2024-01-13",
      dueDate: "2024-02-13",
      location: "School Zone - Oak Street",
      officerName: "Officer Davis",
      officerId: "OFF005",
      description: "Reckless driving in school zone during school hours",
      evidence: ["witness_statement_005.pdf", "dash_cam_005.mp4"],
    },
  ]

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
    switch (status) {
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
      fine.fineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || fine.status === selectedStatus
    const matchesViolation = selectedViolation === "all" || fine.violationType === selectedViolation
    const matchesTab = activeTab === "all" || fine.status === activeTab

    return matchesSearch && matchesStatus && matchesViolation && matchesTab
  })

  const handleEditFine = (fine: FineType) => {
    setSelectedFine(fine)
    setIsEditFineOpen(true)
  }

  const getTabCount = (status: string) => {
    if (status === "all") return fines.length
    return fines.filter((fine) => fine.status === status).length
  }

  const totalRevenue = fines.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0)
  const pendingAmount = fines.filter((f) => f.status === "pending").reduce((sum, f) => sum + f.amount, 0)
  const overdueAmount = fines.filter((f) => f.status === "overdue").reduce((sum, f) => sum + f.amount, 0)

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
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddFineOpen} onOpenChange={setIsAddFineOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Issue Fine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
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
                <Button type="submit">Issue Fine</Button>
              </DialogFooter>
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
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From paid fines</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
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
                  <TableRow key={fine.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">{fine.fineNumber}</p>
                        <p className="text-sm text-muted-foreground">{fine.location}</p>
                        <p className="text-xs text-muted-foreground">by {fine.officerName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">{fine.driverName}</p>
                        <p className="text-sm text-muted-foreground">{fine.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground">{fine.driverLicense}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getViolationBadge(fine.violationType)}</TableCell>
                    <TableCell>
                      <p className="font-medium">${fine.amount}</p>
                    </TableCell>
                    <TableCell>{getStatusBadge(fine.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm">{fine.dueDate}</p>
                      <p className="text-xs text-muted-foreground">Issued: {fine.issueDate}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Fine
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Fine</DialogTitle>
            <DialogDescription>Update fine details and status.</DialogDescription>
          </DialogHeader>
          {selectedFine && (
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vehicle">Vehicle Number</Label>
                  <Input id="edit-vehicle" defaultValue={selectedFine.vehicleNumber} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-driver">Driver Name</Label>
                  <Input id="edit-driver" defaultValue={selectedFine.driverName} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Fine Amount ($)</Label>
                  <Input id="edit-amount" type="number" defaultValue={selectedFine.amount} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue={selectedFine.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" defaultValue={selectedFine.description} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
