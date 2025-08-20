"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover";

type BatchStatus = "Active" | "Inactive";
type Program = "IELTS" | "Spoken English Junior" | "Spoken English" | "TOEFL" | "GRE" | "GMAT";
type Weekday = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

const PROGRAMS: Program[] = [
  "IELTS",
  "Spoken English Junior",
  "Spoken English",
  "TOEFL",
  "GRE",
  "GMAT",
];

const WEEK_DAYS: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const demoBranches = [
  { id: "b1", name: "Uttara Center", internalName: "U1" },
  { id: "b2", name: "Mirpur Center", internalName: "M1" },
];

type FormFields = {
  name: string;
  internalName: string;
  branchId: string;
  program: Program | "";
  startDate: Date | undefined;
  endDate: Date | undefined;
  days: Weekday[];
  startTime: string;
  endTime: string;
  capacity: string;
  admissionStartDate: Date | undefined;
  admissionEndDate: Date | undefined;
  status: BatchStatus;
};

type FormState = FormFields & { errors: Partial<Record<keyof FormFields | `days.${number}`, string>> };

function emptyForm(): FormState {
  return {
    name: "",
    internalName: "",
    branchId: demoBranches[0]?.id ?? "",
    program: "",
    startDate: undefined,
    endDate: undefined,
    days: [],
    startTime: "",
    endTime: "",
    capacity: "",
    admissionStartDate: undefined,
    admissionEndDate: undefined,
    status: "Active",
    errors: {},
  };
}

export default function NewBatchPage() {
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

    if (formState.startDate && formState.endDate) {
      if (formState.endDate < formState.startDate) {
        errors.endDate = "EndDate must be on/after StartDate";
      }
    }
    if (formState.admissionStartDate && formState.startDate) {
      if (formState.admissionStartDate > formState.startDate) {
        errors.admissionStartDate = "AdmissionStart ≤ StartDate";
      }
    }
    if (formState.admissionEndDate && formState.startDate) {
      if (formState.admissionEndDate > formState.startDate) {
        errors.admissionEndDate = "AdmissionEnd ≤ StartDate";
      }
    }
    if (
      formState.admissionStartDate &&
      formState.admissionEndDate &&
      formState.admissionEndDate < formState.admissionStartDate
    ) {
      errors.admissionEndDate = "AdmissionEnd ≥ AdmissionStart";
    }
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
          <Link href="/batches" className="inline-flex items-center gap-2">
            <ChevronLeft className="size-4" /> Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Add new Batch</h1>
      </div>
      <Separator />

      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium" htmlFor="name">Batch name</label>
            <Input id="name" value={formState.name} onChange={(e) => setField("name", e.target.value)} aria-invalid={!!formState.errors.name} />
            {formState.errors.name && <div className="text-destructive text-xs">{formState.errors.name}</div>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium" htmlFor="internal">Internal name</label>
            <Input id="internal" value={formState.internalName} onChange={(e) => setField("internalName", e.target.value)} aria-invalid={!!formState.errors.internalName} />
            {formState.errors.internalName && <div className="text-destructive text-xs">{formState.errors.internalName}</div>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium" htmlFor="branch">Select branch</label>
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor="classStart">Class start date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-invalid={!!formState.errors.startDate}
                  >
                    {formState.startDate ? formState.startDate.toLocaleDateString() : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.startDate}
                    onSelect={(date) => setField("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formState.errors.startDate && <div className="text-destructive text-xs">{formState.errors.startDate}</div>}
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor="classEnd">Class end date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-invalid={!!formState.errors.endDate}
                  >
                    {formState.endDate ? formState.endDate.toLocaleDateString() : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.endDate}
                    onSelect={(date) => setField("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formState.errors.endDate && <div className="text-destructive text-xs">{formState.errors.endDate}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor="adStart">Admission start date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-invalid={!!formState.errors.admissionStartDate}
                  >
                    {formState.admissionStartDate ? formState.admissionStartDate.toLocaleDateString() : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.admissionStartDate}
                    onSelect={(date) => setField("admissionStartDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formState.errors.admissionStartDate && <div className="text-destructive text-xs">{formState.errors.admissionStartDate}</div>}
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor="adEnd">Admission end date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-invalid={!!formState.errors.admissionEndDate}
                  >
                    {formState.admissionEndDate ? formState.admissionEndDate.toLocaleDateString() : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.admissionEndDate}
                    onSelect={(date) => setField("admissionEndDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formState.errors.admissionEndDate && <div className="text-destructive text-xs">{formState.errors.admissionEndDate}</div>}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium" htmlFor="program">Select program</label>
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

          <div className="grid gap-2">
            <div className="text-sm font-medium">Class day</div>
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
              <label className="text-sm font-medium" htmlFor="startTime">Start time</label>
              <Input id="startTime" type="time" value={formState.startTime} onChange={(e) => setField("startTime", e.target.value)} aria-invalid={!!formState.errors.startTime} />
              {formState.errors.startTime && <div className="text-destructive text-xs">{formState.errors.startTime}</div>}
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor="endTime">End time</label>
              <Input id="endTime" type="time" value={formState.endTime} onChange={(e) => setField("endTime", e.target.value)} aria-invalid={!!formState.errors.endTime} />
              {formState.errors.endTime && <div className="text-destructive text-xs">{formState.errors.endTime}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor="capacity">Capacity</label>
              <Input id="capacity" inputMode="numeric" value={formState.capacity} onChange={(e) => setField("capacity", e.target.value)} aria-invalid={!!formState.errors.capacity} />
              {formState.errors.capacity && <div className="text-destructive text-xs">{formState.errors.capacity}</div>}
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

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href="/batches">Cancel</Link>
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </div>
      </form>
    </div>
  );
}


