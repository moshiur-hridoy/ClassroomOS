"use client";

import * as React from "react";
import { Plus, Pencil, Power, PowerOff } from "lucide-react";

import Link from "next/link";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
} from "@/registry/new-york-v4/ui/sheet";

// In a future iteration, role will come from auth. For now, default to Admin.

type BranchRoom = {
  roomName: string;
  capacity: number;
};

type Branch = {
  id: string;
  name: string;
  internalName: string; // unique
  location: string;
  rooms: BranchRoom[];
  branchManagerUserId: string;
  status: "Active" | "Inactive";
};

const demoBranches: Branch[] = [
  {
    id: "b1",
    name: "Uttara Center",
    internalName: "U1",
    location: "House 12, Road 3, Uttara, Dhaka",
    rooms: [
      { roomName: "Room A", capacity: 30 },
      { roomName: "Room B", capacity: 24 },
    ],
    branchManagerUserId: "mgr-01",
    status: "Active",
  },
  {
    id: "b2",
    name: "Mirpur Center",
    internalName: "M1",
    location: "Plot 5, Section 10, Mirpur, Dhaka",
    rooms: [{ roomName: "Room 1", capacity: 20 }],
    branchManagerUserId: "mgr-02",
    status: "Inactive",
  },
];

export default function BranchesPage() {
  const [currentUserId, setCurrentUserId] = React.useState("mgr-01");
  const [branches, setBranches] = React.useState<Branch[]>(demoBranches);

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const isAdmin = true;
  const isManager = false;
  const isStockholder = false;

  function canEditBranch(branch: Branch) {
    if (isAdmin) return true;
    if (isManager) return branch.branchManagerUserId === currentUserId;
    return false;
  }

  function openCreate() {
    setEditingId(null);
    setFormState(emptyFormState());
    setIsSheetOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditingId(branch.id);
    setFormState({
      name: branch.name,
      internalName: branch.internalName,
      location: branch.location,
      rooms: branch.rooms.map((r) => ({ roomName: r.roomName, capacity: String(r.capacity) })),
      branchManagerUserId: branch.branchManagerUserId,
      status: branch.status,
      errors: {},
    });
    setIsSheetOpen(true);
  }

  function toggleStatus(branch: Branch) {
    if (!canEditBranch(branch)) return;
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branch.id ? { ...b, status: b.status === "Active" ? "Inactive" : "Active" } : b
      )
    );
  }

  // Form state
  type FormRoom = { roomName: string; capacity: string };
  type FormFields = {
    name: string;
    internalName: string;
    location: string;
    rooms: FormRoom[];
    branchManagerUserId: string;
    status: "Active" | "Inactive";
  };

  type FormState = FormFields & {
    errors: Partial<
      Record<
        keyof FormFields | `rooms.${number}.roomName` | `rooms.${number}.capacity`,
        string
      >
    >;
  };

  function emptyFormState(): FormState {
    return {
      name: "",
      internalName: "",
      location: "",
      rooms: [{ roomName: "", capacity: "" }],
      branchManagerUserId: currentUserId,
      status: "Active",
      errors: {},
    };
  }

  const [formState, setFormState] = React.useState<FormState>(emptyFormState());

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((s) => ({ ...s, [key]: value }));
  }

  function setRoomField(index: number, key: keyof FormRoom, value: string) {
    setFormState((s) => {
      const rooms = s.rooms.slice();
      rooms[index] = { ...rooms[index], [key]: value };
      return { ...s, rooms };
    });
  }

  function addRoom() {
    setFormState((s) => ({ ...s, rooms: [...s.rooms, { roomName: "", capacity: "" }] }));
  }

  function removeRoom(index: number) {
    setFormState((s) => ({ ...s, rooms: s.rooms.filter((_, i) => i !== index) }));
  }

  function validate(): boolean {
    const errors: FormState["errors"] = {};
    if (!formState.name.trim()) errors.name = "Required";
    if (!formState.internalName.trim()) errors.internalName = "Required";
    if (!formState.location.trim()) errors.location = "Required";

    // Unique internalName
    const existing = branches.find(
      (b) => b.internalName.toLowerCase() === formState.internalName.trim().toLowerCase()
    );
    if (existing && existing.id !== editingId) errors.internalName = "Internal code must be unique";

    // Rooms
    formState.rooms.forEach((r, idx) => {
      if (!r.roomName.trim()) errors[`rooms.${idx}.roomName`] = "Required";
      const cap = Number(r.capacity);
      if (!r.capacity || !Number.isFinite(cap) || cap <= 0) errors[`rooms.${idx}.capacity`] = "Invalid";
    });

    setFormState((s) => ({ ...s, errors }));
    return Object.keys(errors).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: Branch = {
      id: editingId ?? `b-${Date.now()}`,
      name: formState.name.trim(),
      internalName: formState.internalName.trim(),
      location: formState.location.trim(),
      rooms: formState.rooms.map((r) => ({ roomName: r.roomName.trim(), capacity: Number(r.capacity) })),
      branchManagerUserId: formState.branchManagerUserId,
      status: formState.status,
    };

    setBranches((prev) => {
      const exists = prev.some((b) => b.id === payload.id);
      if (exists) return prev.map((b) => (b.id === payload.id ? payload : b));
      return [payload, ...prev];
    });

    setIsSheetOpen(false);
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <h1 className="text-xl font-semibold">Branches</h1>
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Button asChild>
              <Link href="/branches/new">
                <Plus className="mr-1 size-4" /> Add Branch
              </Link>
            </Button>
          )}
        </div>
      </div>
      <Separator />

      <div className="px-4 py-4">
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-foreground">
              <tr className="text-left">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Internal</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Rooms</th>
                <th className="px-3 py-2">Manager</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-2">{b.name}</td>
                  <td className="px-3 py-2 font-mono">{b.internalName}</td>
                  <td className="px-3 py-2">{b.location}</td>
                  <td className="px-3 py-2">{b.rooms.length}</td>
                  <td className="px-3 py-2">{b.branchManagerUserId}</td>
                  <td className="px-3 py-2">
                    <Badge variant={b.status === "Active" ? "success" : "destructive"}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(b)}
                        disabled={!canEditBranch(b)}
                        aria-label="Edit branch"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(b)}
                        disabled={!canEditBranch(b)}
                        aria-label={b.status === "Active" ? "Deactivate" : "Activate"}
                      >
                        {b.status === "Active" ? (
                          <PowerOff className="size-4" />
                        ) : (
                          <Power className="size-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Branch" : "Add Branch"}</SheetTitle>
            <SheetDescription>
              {isAdmin
                ? "Admins can create, edit, and deactivate branches."
                : isManager
                ? "Managers can edit their own branch."
                : "Stockholders have read-only access."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={onSubmit} className="flex h-full flex-col gap-4 p-2">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(e) => setField("name", e.target.value)}
                  aria-invalid={!!formState.errors.name}
                />
                {formState.errors.name && (
                  <div className="text-destructive text-xs">{formState.errors.name}</div>
                )}
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="internalName">
                  InternalName
                </label>
                <Input
                  id="internalName"
                  value={formState.internalName}
                  onChange={(e) => setField("internalName", e.target.value)}
                  aria-invalid={!!formState.errors.internalName}
                />
                {formState.errors.internalName && (
                  <div className="text-destructive text-xs">{formState.errors.internalName}</div>
                )}
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="location">
                  Location
                </label>
                <Input
                  id="location"
                  value={formState.location}
                  onChange={(e) => setField("location", e.target.value)}
                  aria-invalid={!!formState.errors.location}
                />
                {formState.errors.location && (
                  <div className="text-destructive text-xs">{formState.errors.location}</div>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Rooms</div>
                  <Button type="button" variant="outline" size="sm" onClick={addRoom}>
                    Add Room
                  </Button>
                </div>
                <div className="grid gap-3">
                  {formState.rooms.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                      <div className="sm:col-span-3">
                        <Input
                          placeholder="Room Name"
                          value={r.roomName}
                          onChange={(e) => setRoomField(idx, "roomName", e.target.value)}
                          aria-invalid={!!formState.errors[`rooms.${idx}.roomName`]}
                        />
                        {formState.errors[`rooms.${idx}.roomName`] && (
                          <div className="text-destructive text-xs">
                            {formState.errors[`rooms.${idx}.roomName`]}
                          </div>
                        )}
                      </div>
                      <div className="sm:col-span-2 flex items-start gap-2">
                        <Input
                          placeholder="Capacity"
                          inputMode="numeric"
                          value={r.capacity}
                          onChange={(e) => setRoomField(idx, "capacity", e.target.value)}
                          aria-invalid={!!formState.errors[`rooms.${idx}.capacity`]}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeRoom(idx)}
                          className="shrink-0"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="manager">
                  Branch Manager (User ID)
                </label>
                <Input
                  id="manager"
                  value={formState.branchManagerUserId}
                  onChange={(e) => setField("branchManagerUserId", e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  value={formState.status}
                  onChange={(e) => setField("status", e.target.value as FormState["status"]) }
                  className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <SheetFooter className="mt-auto flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Save Changes" : "Create Branch"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
        <SheetTrigger asChild></SheetTrigger>
      </Sheet>
    </div>
  );
}


