"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Users, Shield } from "lucide-react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york-v4/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/new-york-v4/ui/breadcrumb";

type Role = "Admin" | "FDO" | "ADO" | "Branch Manager";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  branch?: string;
  status: "Active" | "Inactive";
  createdAt: string;
};

// Demo data
const demoUsers: User[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Admin",
    status: "Active",
    createdAt: "2024-01-15"
  },
  {
    id: "u2",
    name: "Sarah Smith",
    email: "sarah.smith@company.com",
    role: "FDO",
    status: "Active",
    createdAt: "2024-01-20"
  },
  {
    id: "u3",
    name: "Michael Johnson",
    email: "michael.johnson@company.com",
    role: "Branch Manager",
    branch: "Uttara Center",
    status: "Active",
    createdAt: "2024-01-25"
  },
  {
    id: "u4",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "ADO",
    status: "Active",
    createdAt: "2024-02-01"
  },
  {
    id: "u5",
    name: "David Wilson",
    email: "david.wilson@company.com",
    role: "Branch Manager",
    branch: "Mirpur Center",
    status: "Inactive",
    createdAt: "2024-02-05"
  }
];

const roleColors = {
  "Admin": "bg-red-50 text-red-700 border-red-200",
  "FDO": "bg-blue-50 text-blue-700 border-blue-200",
  "ADO": "bg-green-50 text-green-700 border-green-200",
  "Branch Manager": "bg-purple-50 text-purple-700 border-purple-200"
};

type FormFields = {
  name: string;
  email: string;
  role: Role | "";
  branch: string;
  status: "Active" | "Inactive";
};

function emptyForm(): FormFields {
  return {
    name: "",
    email: "",
    role: "",
    branch: "",
    status: "Active"
  };
}

export default function UsersRolesPage() {
  const [users, setUsers] = React.useState<User[]>(demoUsers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<Role | "">("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [formData, setFormData] = React.useState<FormFields>(emptyForm());

  // Filter users
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !selectedRole || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  // Role statistics
  const roleStats = React.useMemo(() => {
    const stats = {
      "Admin": 0,
      "FDO": 0,
      "ADO": 0,
      "Branch Manager": 0
    };
    users.forEach(user => {
      if (user.status === "Active") {
        stats[user.role]++;
      }
    });
    return stats;
  }, [users]);

  function handleCreate() {
    if (!formData.name || !formData.email || !formData.role) return;

    const newUser: User = {
      id: `u${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role as Role,
      branch: formData.role === "Branch Manager" ? formData.branch : undefined,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUser]);
    setFormData(emptyForm());
    setIsCreateOpen(false);
  }

  function handleEdit() {
    if (!editingUser || !formData.name || !formData.email || !formData.role) return;

    setUsers(prev => prev.map(user => 
      user.id === editingUser.id 
        ? {
            ...user,
            name: formData.name,
            email: formData.email,
            role: formData.role as Role,
            branch: formData.role === "Branch Manager" ? formData.branch : undefined,
            status: formData.status
          }
        : user
    ));

    setEditingUser(null);
    setFormData(emptyForm());
    setIsEditOpen(false);
  }

  function openEditDialog(user: User) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch || "",
      status: user.status
    });
    setIsEditOpen(true);
  }

  function handleDelete(userId: string) {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/settings">Settings</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Users & Roles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="size-4" /> Add User
        </Button>
      </div>

      {/* Role Statistics */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(roleStats).map(([role, count]) => (
            <Card key={role}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{role}</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">Active users</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2" />
          <Input 
            placeholder="Search users..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm min-w-40"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role | "")}
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="FDO">FDO</option>
          <option value="ADO">ADO</option>
          <option value="Branch Manager">Branch Manager</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="flex-1 px-4 pb-4">
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Branch</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant="secondary" 
                        className={`${roleColors[user.role]} border`}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{user.branch || "-"}</span>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={user.status === "Active" ? "default" : "secondary"}
                        className={user.status === "Active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign a role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role</label>
              <select 
                className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Role }))}
              >
                <option value="">Select a role</option>
                <option value="Admin">Admin</option>
                <option value="FDO">FDO</option>
                <option value="ADO">ADO</option>
                <option value="Branch Manager">Branch Manager</option>
              </select>
            </div>
            {formData.role === "Branch Manager" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Branch</label>
                <select 
                  className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                >
                  <option value="">Select a branch</option>
                  <option value="Uttara Center">Uttara Center</option>
                  <option value="Mirpur Center">Mirpur Center</option>
                  <option value="Dhanmondi Center">Dhanmondi Center</option>
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role</label>
              <select 
                className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Role }))}
              >
                <option value="">Select a role</option>
                <option value="Admin">Admin</option>
                <option value="FDO">FDO</option>
                <option value="ADO">ADO</option>
                <option value="Branch Manager">Branch Manager</option>
              </select>
            </div>
            {formData.role === "Branch Manager" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Branch</label>
                <select 
                  className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                >
                  <option value="">Select a branch</option>
                  <option value="Uttara Center">Uttara Center</option>
                  <option value="Mirpur Center">Mirpur Center</option>
                  <option value="Dhanmondi Center">Dhanmondi Center</option>
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
