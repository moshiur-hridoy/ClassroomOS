"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";

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

const seed: Record<string, FormFields> = {
  b1: {
    name: "Uttara Center",
    internalName: "U1",
    location: "House 12, Road 3, Uttara, Dhaka",
    rooms: [
      { roomName: "Room A", capacity: "30" },
      { roomName: "Room B", capacity: "24" },
    ],
    branchManagerUserId: "mgr-01",
    status: "Active",
  },
  b2: {
    name: "Mirpur Center",
    internalName: "M1",
    location: "Plot 5, Section 10, Mirpur, Dhaka",
    rooms: [{ roomName: "Room 1", capacity: "20" }],
    branchManagerUserId: "mgr-02",
    status: "Inactive",
  },
};

export default function EditBranchPage() {
  const { id } = useParams<{ id: string }>();
  const initial: FormFields = seed[id] ?? {
    name: "",
    internalName: "",
    location: "",
    rooms: [{ roomName: "", capacity: "" }],
    branchManagerUserId: "",
    status: "Active",
  };

  const [formState, setFormState] = React.useState<FormState>({ ...initial, errors: {} });

  function setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
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
    formState.rooms.forEach((r, idx) => {
      if (!r.roomName.trim()) errors[`rooms.${idx}.roomName`] = "Required";
      const cap = Number(r.capacity);
      if (!r.capacity || !Number.isFinite(cap) || cap <= 0)
        errors[`rooms.${idx}.capacity`] = "Invalid";
    });
    setFormState((s) => ({ ...s, errors }));
    return Object.keys(errors).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // Placeholder: integrate persistence later
    window.history.back();
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <Button asChild variant="outline">
          <Link href="/branches" className="inline-flex items-center gap-2">
            <ChevronLeft className="size-4" /> Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Edit Branch</h1>
      </div>
      <Separator />

      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
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
              onChange={(e) => setField("status", e.target.value as FormFields["status"])}
              className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="!flex !flex-row !items-center !justify-end !gap-2">
          <Link href="/branches">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}


