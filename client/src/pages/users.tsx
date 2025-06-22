"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getInitials, hasPermission } from "@/lib/auth"
import { apiRequest } from "@/lib/queryClient"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertUserSchema, type User } from "@shared/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Briefcase, Crown, Edit, Eye, HardHat, Plus, Shield, UserCheck, Users, UserX } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const createUserSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(6, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type CreateUserForm = z.infer<typeof createUserSchema>

export default function UsersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  })

  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  })

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "yard_staff",
      name: "",
      isActive: true,
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const { confirmPassword, ...userData } = data
      return apiRequest("POST", "/api/users", userData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] })
      toast({
        title: "Success",
        description: "User created successfully",
      })
      form.reset()
      setShowCreateModal(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => apiRequest("PUT", `/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] })
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    },
  })

  // Check if current user has admin permissions
  const canManageUsers = currentUser && hasPermission(currentUser.role, ["admin"])

  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Access Restricted
              </h2>
              <p className="text-gray-600">
                You don't have permission to access user management. Only administrators can manage users.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: {
        label: "Administrator",
        gradient: "from-purple-500 to-indigo-600",
        bg: "from-purple-50 to-indigo-50",
        icon: Crown,
      },
      export_manager: {
        label: "Export Manager",
        gradient: "from-blue-500 to-cyan-600",
        bg: "from-blue-50 to-cyan-50",
        icon: Briefcase,
      },
      yard_staff: {
        label: "Yard Staff",
        gradient: "from-gray-500 to-slate-600",
        bg: "from-gray-50 to-slate-50",
        icon: HardHat,
      },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.yard_staff
    const RoleIcon = config.icon

    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${config.bg} border border-white/50`}
      >
        <RoleIcon className="w-3 h-3 mr-1.5 text-gray-600" />
        <span className={`text-xs font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {config.label}
        </span>
      </div>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full ${
          isActive
            ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50"
            : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50"
        }`}
      >
        <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
        <span
          className={`text-xs font-semibold ${
            isActive
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    )
  }

  const toggleUserStatus = (userId: number, currentStatus: boolean) => {
    updateMutation.mutate({
      id: userId,
      data: { isActive: !currentStatus },
    })
  }

  const onSubmit = (data: CreateUserForm) => {
    createMutation.mutate(data)
  }

  const filteredUsers = users?.filter((user) => {
    const matchesRole = !filters.role || filters.role === "all" || user.role === filters.role
    const matchesStatus =
      !filters.status ||
      filters.status === "all" ||
      (filters.status === "active" && user.isActive) ||
      (filters.status === "inactive" && !user.isActive)
    const matchesSearch =
      !filters.search ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.username.toLowerCase().includes(filters.search.toLowerCase())

    return matchesRole && matchesStatus && matchesSearch
  })

  const totalUsers = users?.length || 0
  const activeUsers = users?.filter((u) => u.isActive).length || 0
  const inactiveUsers = users?.filter((u) => !u.isActive).length || 0
  const adminUsers = users?.filter((u) => u.role === "admin").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-6 p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-gray-600">Manage system users and permissions</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalUsers}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                    <span className="text-sm text-indigo-600 font-medium">All registered</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{activeUsers}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                    <span className="text-sm text-emerald-600 font-medium">Currently online</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{inactiveUsers}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <span className="text-sm text-red-600 font-medium">Suspended</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserX className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{adminUsers}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                    <span className="text-sm text-purple-600 font-medium">Full access</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-gray-100/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                All Users
              </CardTitle>
              <div className="flex space-x-3">
                <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                  <SelectTrigger className="w-40 bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="export_manager">Export Manager</SelectItem>
                    <SelectItem value="yard_staff">Yard Staff</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-32 bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-64 bg-white/60 backdrop-blur-sm border-white/20"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Created</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredUsers?.length ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                              <span className="text-white font-medium text-sm">{getInitials(user.name)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500 font-medium">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{user.email}</td>
                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4">{getStatusBadge(user.isActive)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 hover:border-gray-200 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`transition-all duration-300 ${
                                user.isActive
                                  ? "hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:border-red-200"
                                  : "hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-200"
                              }`}
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                              disabled={updateMutation.isPending || user.id === currentUser?.id}
                            >
                              {user.isActive ? (
                                <UserX className="w-4 h-4 text-red-600" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-emerald-600" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create User Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Add New User
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    {...form.register("name")}
                    className="bg-white/60 backdrop-blur-sm border-white/20"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 font-medium">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    {...form.register("username")}
                    className="bg-white/60 backdrop-blur-sm border-white/20"
                  />
                  {form.formState.errors.username && (
                    <p className="text-sm text-red-600 font-medium">{form.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...form.register("email")}
                    className="bg-white/60 backdrop-blur-sm border-white/20"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 font-medium">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                    Role
                  </Label>
                  <Select onValueChange={(value) => form.setValue("role", value)}>
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="export_manager">Export Manager</SelectItem>
                      <SelectItem value="yard_staff">Yard Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.role && (
                    <p className="text-sm text-red-600 font-medium">{form.formState.errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    {...form.register("password")}
                    className="bg-white/60 backdrop-blur-sm border-white/20"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 font-medium">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    {...form.register("confirmPassword")}
                    className="bg-white/60 backdrop-blur-sm border-white/20"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 font-medium">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-white/60 backdrop-blur-sm border-white/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {createMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
