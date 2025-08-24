"use client";

import * as React from "react";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";

export default function NewBranchPage() {
  const router = useRouter();
  const [currentUserId] = React.useState("mgr-01");
  
  const [formState, setFormState] = React.useState<FormState>({
    name: "",
    internalName: "",
    location: "",
    googleMapLink: "",
    rooms: [{ roomName: "", capacity: "", roomType: "Regular" }],
    branchManagerUserId: "",
    status: "Active",
    errors: {},
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const isAdmin = true;

  // Form state types
  type FormRoom = { roomName: string; capacity: string; roomType: string };
  type FormFields = {
    name: string;
    internalName: string;
    location: string;
    googleMapLink: string;
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
    setFormState((s) => ({ ...s, rooms: [...s.rooms, { roomName: "", capacity: "", roomType: "Regular" }] }));
  }

  function removeRoom(index: number) {
    setFormState((s) => ({ ...s, rooms: s.rooms.filter((_, i) => i !== index) }));
  }

  function validate(): boolean {
    const errors: FormState["errors"] = {};
    
    if (!formState.name.trim()) errors.name = "Required";
    if (!formState.internalName.trim()) errors.internalName = "Required";
    if (!formState.location.trim()) errors.location = "Required";

    // Rooms
    formState.rooms.forEach((r, idx) => {
      if (!r.roomName.trim()) errors[`rooms.${idx}.roomName`] = "Required";
      const cap = Number(r.capacity);
      if (!r.capacity || !Number.isFinite(cap) || cap <= 0) errors[`rooms.${idx}.capacity`] = "Invalid";
    });

    setFormState((s) => ({ ...s, errors }));
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would be an API call
      console.log("Creating branch:", formState);
      
      // Redirect back to branches list
      router.push("/branches");
    } catch (error) {
      console.error("Error creating branch:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/branches">
            <ArrowLeft className="mr-1 size-4" />
            Back to Branches
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-xl font-semibold">Add New Branch</h1>
      </div>
      <Separator />

      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="name">
                  Branch Name
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
                  Internal Code
                </label>
                <Input
                  id="internalName"
                  value={formState.internalName}
                  onChange={(e) => setField("internalName", e.target.value)}
                  aria-invalid={!!formState.errors.internalName}
                  placeholder="e.g., U1, M1"
                />
                {formState.errors.internalName && (
                  <div className="text-destructive text-xs">{formState.errors.internalName}</div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="location">
                    Location
                  </label>
                  <Input
                    id="location"
                    value={formState.location}
                    onChange={(e) => setField("location", e.target.value)}
                    aria-invalid={!!formState.errors.location}
                    placeholder="Write here"
                  />
                  {formState.errors.location && (
                    <div className="text-destructive text-xs">{formState.errors.location}</div>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="googleMapLink">
                    Google Map link
                  </label>
                  <Input
                    id="googleMapLink"
                    value={formState.googleMapLink}
                    onChange={(e) => setField("googleMapLink", e.target.value)}
                    placeholder="Add link"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Rooms</div>
                <div className="grid gap-3">
                  {formState.rooms.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: '50% 20% 27%' }}>
                        <div>
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
                        <div>
                          <Input
                            placeholder="Capacity"
                            inputMode="numeric"
                            value={r.capacity}
                            onChange={(e) => setRoomField(idx, "capacity", e.target.value)}
                            aria-invalid={!!formState.errors[`rooms.${idx}.capacity`]}
                          />
                          {formState.errors[`rooms.${idx}.capacity`] && (
                            <div className="text-destructive text-xs">
                              {formState.errors[`rooms.${idx}.capacity`]}
                            </div>
                          )}
                        </div>
                        <div>
                          <select
                            value={r.roomType}
                            onChange={(e) => setRoomField(idx, "roomType", e.target.value)}
                            className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm w-full"
                          >
                            <option value="Regular">Regular</option>
                            <option value="Kids Room">Kids Room</option>
                            <option value="Exam room">Exam room</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeRoom(idx)}
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        disabled={formState.rooms.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-start">
                  <Button type="button" variant="outline" size="sm" onClick={addRoom}>
                    <Plus className="mr-1 size-4" />
                    Add Room
                  </Button>
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="manager">
                  Branch Manager
                </label>
                <select
                  id="manager"
                  value={formState.branchManagerUserId}
                  onChange={(e) => setField("branchManagerUserId", e.target.value)}
                  className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                >
                  <option value="">Select Branch Manager</option>
                  <option value="mgr-01">John Smith</option>
                  <option value="mgr-02">Sarah Johnson</option>
                  <option value="mgr-03">Mike Davis</option>
                  <option value="mgr-04">Emily Wilson</option>
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  value={formState.status}
                  onChange={(e) => setField("status", e.target.value as FormState["status"])}
                  className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button type="button" variant="outline" asChild>
                <Link href="/branches">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-1 size-4" />
                {isLoading ? "Creating..." : "Create Branch"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


