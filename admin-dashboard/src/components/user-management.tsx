"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi } from "@/lib/api"
import { AlertTriangle, Download, Edit, Mail, Plus, Search, Shield, Trash2, User } from "lucide-react"
import { useEffect, useState } from "react"

interface UserType {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: "admin" | "officer" | "clerk" | "driver"
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// Interface for creating a new user
interface NewUserType extends Omit<UserType, '_id' | 'createdAt' | 'updatedAt'> {
  password?: string
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for add user form
  const [addUserForm, setAddUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "clerk" as UserType['role']
  })

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminApi.getAllUsers()
        setUsers(data || [])
      } catch (err) {
        setError('Failed to load users data: ' + (err instanceof Error ? err.message : 'Unknown error'))
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Admin</Badge>
      case "officer":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Officer</Badge>
      case "driver":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Driver</Badge>
      case "clerk":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Clerk</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge> :
      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inactive</Badge>
  }

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "active" && user.isActive) || 
      (selectedStatus === "inactive" && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleEditUser = async (user: UserType) => {
    try {
      setSelectedUser(user)
      setIsEditUserOpen(true)
    } catch (err) {
      console.error('Error editing user:', err)
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        await adminApi.deleteUser(id)
        // Refresh the users list
        const data = await adminApi.getAllUsers()
        setUsers(data || [])
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Failed to delete user: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleSaveUser = async (updatedUser: UserType) => {
    try {
      await adminApi.updateUser(updatedUser._id, updatedUser)
      // Refresh the users list
      const data = await adminApi.getAllUsers()
      setUsers(data || [])
      setIsEditUserOpen(false)
      setSelectedUser(null)
    } catch (err) {
      console.error('Error updating user:', err)
      alert('Failed to update user: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleAddUser = async (newUser: NewUserType) => {
    try {
      const response = await adminApi.createUser(newUser)
      // Refresh the users list
      const data = await adminApi.getAllUsers()
      setUsers(data || [])
      setIsAddUserOpen(false)
      // Reset form fields
      setAddUserForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "clerk"
      })
      
      // Show success message
      alert(response.message || 'User created successfully!')
    } catch (err: any) {
      console.error('Error creating user:', err)
      let errorMessage = 'Failed to create user'
      
      // Try to extract error message from the response
      if (err.message) {
        errorMessage = err.message
      } else if (err.error) {
        errorMessage = err.error
        if (err.details) {
          errorMessage += ': ' + err.details
        }
      }
      
      alert('Failed to create user: ' + errorMessage)
    }
  }

  const handleAddUserClick = () => {
    // Reset form fields before opening dialog
    setAddUserForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "clerk"
    })
    setIsAddUserOpen(true)
  }

  const handleAddUserSubmit = () => {
    const { firstName, lastName, email, password, role } = addUserForm
    
    if (firstName && lastName && email && role) {
      handleAddUser({ firstName, lastName, email, role, isActive: true, password: password || undefined })
    } else {
      alert('Please fill all required fields')
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-muted-foreground">Loading users data...</p>
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
          <h2 className="text-2xl font-bold text-card-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage system users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleAddUserClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{users.length}</div>
            <p className="text-xs text-center text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{users.filter(u => u.isActive).length}</div>
            <p className="text-xs text-center text-muted-foreground">{Math.round((users.filter(u => u.isActive).length / Math.max(users.length, 1)) * 100)}% of total users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Officers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{users.filter(u => u.role === 'officer').length}</div>
            <p className="text-xs text-center text-muted-foreground">Traffic enforcement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-center font-bold">{users.filter(u => u.role === 'driver').length}</div>
            <p className="text-xs text-center text-muted-foreground">Registered drivers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Search and filter users by role, status, and other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="officer">Officer</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="clerk">Clerk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName} ${user.lastName}`}
                          />
                          <AvatarFallback>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-card-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
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
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
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

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]" onClose={() => setIsAddUserOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with appropriate role and permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-first-name" className="text-right">
                First Name
              </Label>
              <Input 
                id="add-first-name" 
                className="col-span-3" 
                value={addUserForm.firstName}
                onChange={(e) => setAddUserForm({...addUserForm, firstName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-last-name" className="text-right">
                Last Name
              </Label>
              <Input 
                id="add-last-name" 
                className="col-span-3" 
                value={addUserForm.lastName}
                onChange={(e) => setAddUserForm({...addUserForm, lastName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-email" className="text-right">
                Email
              </Label>
              <Input 
                id="add-email" 
                type="email" 
                className="col-span-3" 
                value={addUserForm.email}
                onChange={(e) => setAddUserForm({...addUserForm, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-password" className="text-right">
                Password
              </Label>
              <Input 
                id="add-password" 
                type="password" 
                className="col-span-3" 
                placeholder="Leave blank for email invitation" 
                value={addUserForm.password}
                onChange={(e) => setAddUserForm({...addUserForm, password: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-role" className="text-right">
                Role
              </Label>
              <Select 
                value={addUserForm.role} 
                onValueChange={(value) => setAddUserForm({...addUserForm, role: value as UserType['role']})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="clerk">Clerk</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleAddUserSubmit}
            >
              Create User
            </Button>
          </DialogFooter>
          <DialogClose onClose={() => setIsAddUserOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]" onClose={() => setIsEditUserOpen(false)}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-first-name" className="text-right">
                  First Name
                </Label>
                <Input 
                  id="edit-first-name" 
                  defaultValue={selectedUser.firstName} 
                  className="col-span-3" 
                  onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-last-name" className="text-right">
                  Last Name
                </Label>
                <Input 
                  id="edit-last-name" 
                  defaultValue={selectedUser.lastName} 
                  className="col-span-3" 
                  onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  defaultValue={selectedUser.email} 
                  className="col-span-3" 
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, role: value as UserType['role']})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="clerk">Clerk</SelectItem>
                    <SelectItem value="officer">Officer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={selectedUser.isActive ? "active" : "inactive"} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, isActive: value === "active"})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={() => selectedUser && handleSaveUser(selectedUser)}
            >
              Save Changes
            </Button>
          </DialogFooter>
          <DialogClose onClose={() => setIsEditUserOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}