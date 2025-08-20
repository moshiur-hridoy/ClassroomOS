"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import Link from "next/link";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/new-york-v4/ui/sheet";

type BatchStatus = "Active" | "Inactive";
type Program = "IELTS" | "Spoken English Junior" | "Spoken English" | "TOEFL" | "GRE" | "GMAT";
type Weekday = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

type Batch = {
  id: string;
  name: string;
  internalName: string; // unique
  branchId: string; // FK to Branch
  program: Program;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  days: Weekday[];
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  capacity: number;
  admissionStartDate: string; // yyyy-mm-dd
  admissionEndDate: string; // yyyy-mm-dd
  status: BatchStatus;
  enrolled: number; // read-only for now to validate Enrollment ≤ Capacity
};

const WEEK_DAYS: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PROGRAMS: Program[] = [
  "IELTS",
  "Spoken English Junior",
  "Spoken English",
  "TOEFL",
  "GRE",
  "GMAT",
];

// Demo branches to populate the Branch selector
const demoBranches = [
  { id: "b1", name: "Uttara Center", internalName: "U1" },
  { id: "b2", name: "Mirpur Center", internalName: "M1" },
];

const demoBatches: Batch[] = [
  {
    id: "bt1",
    name: "IELTS Morning",
    internalName: "IELTS-M-1",
    branchId: "b1",
    program: "IELTS",
    startDate: "2025-09-01",
    endDate: "2025-11-30",
    days: ["Sun", "Tue", "Thu"],
    startTime: "10:00",
    endTime: "12:00",
    capacity: 30,
    admissionStartDate: "2025-08-15",
    admissionEndDate: "2025-08-31",
    status: "Active",
    enrolled: 18,
  },
];

export default function BatchesPage() {
  const [batches, setBatches] = React.useState<Batch[]>(demoBatches);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setFormState(emptyForm());
    setIsSheetOpen(true);
  }



  type FormFields = {
    name: string;
    internalName: string;
    branchId: string;
    program: Program | "";
    startDate: string;
    endDate: string;
    days: Weekday[];
    startTime: string;
    endTime: string;
    capacity: string;
    admissionStartDate: string;
    admissionEndDate: string;
    status: BatchStatus;
  };

  type FormState = FormFields & {
    errors: Partial<Record<keyof FormFields | `days.${number}`, string>>;
  };

  function emptyForm(): FormState {
    return {
      name: "",
      internalName: "",
      branchId: demoBranches[0]?.id ?? "",
      program: "",
      startDate: "",
      endDate: "",
      days: [],
      startTime: "",
      endTime: "",
      capacity: "",
      admissionStartDate: "",
      admissionEndDate: "",
      status: "Active",
      errors: {},
    };
  }

  const [formState, setFormState] = React.useState<FormState>(emptyForm());

  function setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFormState((s) => ({ ...s, [key]: value }));
  }

  function toggleDay(day: Weekday) {
    setFormState((s) => {
      const has = s.days.includes(day);
      return { ...s, days: has ? s.days.filter((d) => d !== day) : [...s.days, day] };
    });
  }

  function validate(): boolean {
    const errors: FormState["errors"] = {};
    if (!formState.name.trim()) errors.name = "Required";
    if (!formState.internalName.trim()) errors.internalName = "Required";
    if (!formState.branchId) errors.branchId = "Required";
    if (!formState.program) errors.program = "Required";
    if (!formState.startDate) errors.startDate = "Required";
    if (!formState.endDate) errors.endDate = "Required";
    if (formState.days.length === 0) errors.days = "Pick at least one day";
    if (!formState.startTime) errors.startTime = "Required";
    if (!formState.endTime) errors.endTime = "Required";
    const cap = Number(formState.capacity);
    if (!formState.capacity || !Number.isFinite(cap) || cap <= 0) errors.capacity = "Invalid";
    if (!formState.admissionStartDate) errors.admissionStartDate = "Required";
    if (!formState.admissionEndDate) errors.admissionEndDate = "Required";

    // Uniqueness of internalName
    const existing = batches.find(
      (b) => b.internalName.toLowerCase() === formState.internalName.trim().toLowerCase()
    );
    if (existing && existing.id !== editingId) errors.internalName = "Internal code must be unique";

    // Date constraints
    if (formState.startDate && formState.endDate) {
      if (new Date(formState.endDate) < new Date(formState.startDate)) {
        errors.endDate = "EndDate must be on/after StartDate";
      }
    }
    if (formState.admissionStartDate && formState.startDate) {
      if (new Date(formState.admissionStartDate) > new Date(formState.startDate)) {
        errors.admissionStartDate = "AdmissionStart ≤ StartDate";
      }
    }
    if (formState.admissionEndDate && formState.startDate) {
      if (new Date(formState.admissionEndDate) > new Date(formState.startDate)) {
        errors.admissionEndDate = "AdmissionEnd ≤ StartDate";
      }
    }
    if (
      formState.admissionStartDate &&
      formState.admissionEndDate &&
      new Date(formState.admissionEndDate) < new Date(formState.admissionStartDate)
    ) {
      errors.admissionEndDate = "AdmissionEnd ≥ AdmissionStart";
    }

    // Enrollment ≤ Capacity (validate against existing enrolled when editing)
    if (editingId) {
      const editing = batches.find((b) => b.id === editingId);
      if (editing) {
        if (cap < editing.enrolled) errors.capacity = `Capacity must be ≥ enrolled (${editing.enrolled})`;
      }
    }

    setFormState((s) => ({ ...s, errors }));
    return Object.keys(errors).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const payload: Batch = {
      id: editingId ?? `bt-${Date.now()}`,
      name: formState.name.trim(),
      internalName: formState.internalName.trim(),
      branchId: formState.branchId,
      program: formState.program as Program,
      startDate: formState.startDate,
      endDate: formState.endDate,
      days: [...formState.days],
      startTime: formState.startTime,
      endTime: formState.endTime,
      capacity: Number(formState.capacity),
      admissionStartDate: formState.admissionStartDate,
      admissionEndDate: formState.admissionEndDate,
      status: formState.status,
      enrolled: editingId ? batches.find((b) => b.id === editingId)?.enrolled ?? 0 : 0,
    };

    setBatches((prev) => {
      const exists = prev.some((b) => b.id === payload.id);
      if (exists) return prev.map((b) => (b.id === payload.id ? payload : b));
      return [payload, ...prev];
    });
    setIsSheetOpen(false);
  }

  function branchName(id: string) {
    return demoBranches.find((b) => b.id === id)?.name ?? id;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <h1 className="text-xl font-semibold">Batches</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild>
            <Link href="/batches/new">
              <Plus className="mr-1 size-4" /> Add Batch
            </Link>
          </Button>
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
                <th className="px-3 py-2">Branch</th>
                <th className="px-3 py-2">Program</th>
                <th className="px-3 py-2">Schedule</th>
                <th className="px-3 py-2">Capacity</th>
                <th className="px-3 py-2">Enrolled</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-2">{b.name}</td>
                  <td className="px-3 py-2 font-mono">{b.internalName}</td>
                  <td className="px-3 py-2">{branchName(b.branchId)}</td>
                  <td className="px-3 py-2">{b.program}</td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-muted-foreground">
                      {b.startDate} → {b.endDate}
                    </div>
                    <div>{b.days.join(", ")} {b.startTime}–{b.endTime}</div>
                  </td>
                  <td className="px-3 py-2">{b.capacity}</td>
                  <td className="px-3 py-2">{b.enrolled}</td>
                  <td className="px-3 py-2">
                    <Badge variant={b.status === "Active" ? "success" : "destructive"}>{b.status}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/batches/${b.id}`}>View Details</Link>
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
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Batch" : "Add Batch"}</SheetTitle>
            <SheetDescription>
              One program per batch. End ≥ Start. Admission ≤ Start. Enrollment ≤ Capacity.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={onSubmit} className="flex h-full flex-col gap-4 p-2">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="name">Name</label>
                <Input id="name" value={formState.name} onChange={(e) => setField("name", e.target.value)} aria-invalid={!!formState.errors.name} />
                {formState.errors.name && <div className="text-destructive text-xs">{formState.errors.name}</div>}
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="internal">InternalName</label>
                <Input id="internal" value={formState.internalName} onChange={(e) => setField("internalName", e.target.value)} aria-invalid={!!formState.errors.internalName} />
                {formState.errors.internalName && (
                  <div className="text-destructive text-xs">{formState.errors.internalName}</div>
                )}
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="branch">Branch</label>
                <select
                  id="branch"
                  value={formState.branchId}
                  onChange={(e) => setField("branchId", e.target.value)}
                  className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                >
                  {demoBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.internalName})
                    </option>
                  ))}
                </select>
                {formState.errors.branchId && <div className="text-destructive text-xs">{formState.errors.branchId}</div>}
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="program">Program</label>
                <select
                  id="program"
                  value={formState.program}
                  onChange={(e) => setField("program", e.target.value as Program)}
                  className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                >
                  <option value="">Select program</option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {formState.errors.program && <div className="text-destructive text-xs">{formState.errors.program}</div>}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="startDate">Start Date</label>
                  <Input id="startDate" type="date" value={formState.startDate} onChange={(e) => setField("startDate", e.target.value)} aria-invalid={!!formState.errors.startDate} />
                  {formState.errors.startDate && <div className="text-destructive text-xs">{formState.errors.startDate}</div>}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="endDate">End Date</label>
                  <Input id="endDate" type="date" value={formState.endDate} onChange={(e) => setField("endDate", e.target.value)} aria-invalid={!!formState.errors.endDate} />
                  {formState.errors.endDate && <div className="text-destructive text-xs">{formState.errors.endDate}</div>}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Days</div>
                <div className="flex flex-wrap gap-3">
                  {WEEK_DAYS.map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formState.days.includes(d)}
                        onChange={() => toggleDay(d)}
                      />
                      {d}
                    </label>
                  ))}
                </div>
                {formState.errors.days && <div className="text-destructive text-xs">{formState.errors.days}</div>}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="startTime">Start Time</label>
                  <Input id="startTime" type="time" value={formState.startTime} onChange={(e) => setField("startTime", e.target.value)} aria-invalid={!!formState.errors.startTime} />
                  {formState.errors.startTime && <div className="text-destructive text-xs">{formState.errors.startTime}</div>}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="endTime">End Time</label>
                  <Input id="endTime" type="time" value={formState.endTime} onChange={(e) => setField("endTime", e.target.value)} aria-invalid={!!formState.errors.endTime} />
                  {formState.errors.endTime && <div className="text-destructive text-xs">{formState.errors.endTime}</div>}
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="capacity">Capacity</label>
                <Input id="capacity" inputMode="numeric" value={formState.capacity} onChange={(e) => setField("capacity", e.target.value)} aria-invalid={!!formState.errors.capacity} />
                {formState.errors.capacity && <div className="text-destructive text-xs">{formState.errors.capacity}</div>}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="adStart">Admission Start</label>
                  <Input id="adStart" type="date" value={formState.admissionStartDate} onChange={(e) => setField("admissionStartDate", e.target.value)} aria-invalid={!!formState.errors.admissionStartDate} />
                  {formState.errors.admissionStartDate && <div className="text-destructive text-xs">{formState.errors.admissionStartDate}</div>}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="adEnd">Admission End</label>
                  <Input id="adEnd" type="date" value={formState.admissionEndDate} onChange={(e) => setField("admissionEndDate", e.target.value)} aria-invalid={!!formState.errors.admissionEndDate} />
                  {formState.errors.admissionEndDate && <div className="text-destructive text-xs">{formState.errors.admissionEndDate}</div>}
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formState.status}
                  onChange={(e) => setField("status", e.target.value as BatchStatus)}
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
              <Button type="submit">{editingId ? "Save Changes" : "Create Batch"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
        <SheetTrigger asChild></SheetTrigger>
      </Sheet>
    </div>
  );
}


