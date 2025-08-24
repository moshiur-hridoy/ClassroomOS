"use client";

import * as React from "react";
import { Plus, Pencil, Calendar, BarChart3, Search, Settings, ChevronDown } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/registry/new-york-v4/ui/dropdown-menu";

type BatchStatus = "Running" | "Admission Ongoing" | "Admission Closed" | "Inactive";
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
  totalClasses: number;
  completedClasses: number;
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
    name: "IRC1",
    internalName: "C1",
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
    status: "Running",
    enrolled: 18,
    totalClasses: 80,
    completedClasses: 30,
  },
  {
    id: "bt2",
    name: "IRC2",
    internalName: "C3",
    branchId: "b2",
    program: "Spoken English",
    startDate: "2025-09-15",
    endDate: "2025-12-15",
    days: ["Mon", "Wed", "Fri"],
    startTime: "14:00",
    endTime: "16:00",
    capacity: 25,
    admissionStartDate: "2025-09-01",
    admissionEndDate: "2025-09-14",
    status: "Admission Ongoing",
    enrolled: 0,
    totalClasses: 80,
    completedClasses: 0,
  },
  {
    id: "bt3",
    name: "IRC3",
    internalName: "C5",
    branchId: "b1",
    program: "TOEFL",
    startDate: "2025-08-01",
    endDate: "2025-10-31",
    days: ["Tue", "Thu", "Sat"],
    startTime: "16:00",
    endTime: "18:00",
    capacity: 20,
    admissionStartDate: "2025-07-15",
    admissionEndDate: "2025-07-31",
    status: "Running",
    enrolled: 15,
    totalClasses: 80,
    completedClasses: 60,
  },
];

export default function BatchesPage() {
  const [batches, setBatches] = React.useState<Batch[]>(demoBatches);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = React.useState<string>("");
  const [selectedProgram, setSelectedProgram] = React.useState<string>("");
  const [selectedBatch, setSelectedBatch] = React.useState<string>("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  
  // Column visibility states
  const [visibleColumns, setVisibleColumns] = React.useState({
    name: true,
    branch: true,
    program: true,
    schedule: true,
    startDate: true,
    endDate: true,
    progress: true,
    capacity: true,
    enrolled: true,
    actions: true,
  });

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
    totalClasses: string;
    completedClasses: string;
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
      status: "Running",
      totalClasses: "",
      completedClasses: "",
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
    
    const totalClasses = Number(formState.totalClasses);
    if (!formState.totalClasses || !Number.isFinite(totalClasses) || totalClasses <= 0) errors.totalClasses = "Invalid";
    const completedClasses = Number(formState.completedClasses);
    if (!formState.completedClasses || !Number.isFinite(completedClasses) || completedClasses < 0) errors.completedClasses = "Invalid";
    if (completedClasses > totalClasses) errors.completedClasses = "Cannot exceed total classes";

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
      totalClasses: Number(formState.totalClasses),
      completedClasses: Number(formState.completedClasses),
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

  // Filter and search logic
  const filteredBatches = React.useMemo(() => {
    return batches.filter((batch) => {
      // Branch filter
      if (selectedBranch && batch.branchId !== selectedBranch) return false;
      
      // Program filter
      if (selectedProgram && batch.program !== selectedProgram) return false;
      
      // Batch filter (by batch name)
      if (selectedBatch && batch.name !== selectedBatch) return false;
      
      // Status filter
      if (selectedStatus && batch.status !== selectedStatus) return false;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          batch.name,
          batch.internalName,
          batch.program,
          batch.status,
          branchName(batch.branchId),
          batch.days.join(" "),
        ].join(" ").toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }
      
      return true;
    });
  }, [batches, selectedBranch, selectedProgram, selectedBatch, selectedStatus, searchQuery]);

  function toggleColumnVisibility(column: keyof typeof visibleColumns) {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
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

      {/* Filter Section */}
      <div className="px-4 py-4 border-b bg-muted/20">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]"
          >
            <option value="">Select branch</option>
            {demoBranches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          {/* Program Filter */}
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]"
          >
            <option value="">Select program</option>
            {PROGRAMS.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[120px]"
          >
            <option value="">Select Batch</option>
            {[...new Set(batches.map(b => b.name))].map((batchName) => (
              <option key={batchName} value={batchName}>
                {batchName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[100px]"
          >
            <option value="">Status</option>
            <option value="Running">Running</option>
            <option value="Admission Ongoing">Admission Ongoing</option>
            <option value="Admission Closed">Admission Closed</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Search Bar */}
          <div className="relative ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            
            {/* Column Customization Gear */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.name}
                  onCheckedChange={() => toggleColumnVisibility('name')}
                >
                  Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.branch}
                  onCheckedChange={() => toggleColumnVisibility('branch')}
                >
                  Branch
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.program}
                  onCheckedChange={() => toggleColumnVisibility('program')}
                >
                  Program
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.schedule}
                  onCheckedChange={() => toggleColumnVisibility('schedule')}
                >
                  Schedule
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.startDate}
                  onCheckedChange={() => toggleColumnVisibility('startDate')}
                >
                  Start Date
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.endDate}
                  onCheckedChange={() => toggleColumnVisibility('endDate')}
                >
                  End Date
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.progress}
                  onCheckedChange={() => toggleColumnVisibility('progress')}
                >
                  Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.capacity}
                  onCheckedChange={() => toggleColumnVisibility('capacity')}
                >
                  Capacity
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.enrolled}
                  onCheckedChange={() => toggleColumnVisibility('enrolled')}
                >
                  Enrolled
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-foreground">
              <tr className="text-left">
                {visibleColumns.name && <th className="px-3 py-2">Name</th>}
                {visibleColumns.branch && <th className="px-3 py-2">Branch</th>}
                {visibleColumns.program && <th className="px-3 py-2">Program</th>}
                {visibleColumns.schedule && <th className="px-3 py-2">Schedule</th>}
                {visibleColumns.startDate && <th className="px-3 py-2">Start Date</th>}
                {visibleColumns.endDate && <th className="px-3 py-2">End Date</th>}
                {visibleColumns.progress && <th className="px-3 py-2">Progress</th>}
                {visibleColumns.capacity && <th className="px-3 py-2">Capacity</th>}
                {visibleColumns.enrolled && <th className="px-3 py-2">Enrolled</th>}
                {visibleColumns.actions && <th className="px-3 py-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((b) => (
                <tr key={b.id} className="border-t">
                  {visibleColumns.name && (
                    <td className="px-3 py-2">
                      <div className="font-semibold">
                        <span className="text-foreground">{b.name}</span>{" "}
                        <span className="text-muted-foreground">{b.internalName}</span>
                      </div>
                      <Badge 
                        variant={
                          b.status === "Running" ? "success" : 
                          b.status === "Admission Ongoing" ? "default" :
                          b.status === "Admission Closed" ? "secondary" : 
                          "destructive"
                        }
                        className="mt-1"
                      >
                        {b.status}
                      </Badge>
                    </td>
                  )}
                  {visibleColumns.branch && <td className="px-3 py-2">{branchName(b.branchId)}</td>}
                  {visibleColumns.program && <td className="px-3 py-2">{b.program}</td>}
                  {visibleColumns.schedule && (
                    <td className="px-3 py-2">
                      <div className="font-medium">{b.startTime}–{b.endTime}</div>
                      <div className="text-xs text-muted-foreground">{b.days.join(", ")}</div>
                    </td>
                  )}
                  {visibleColumns.startDate && <td className="px-3 py-2">{b.startDate}</td>}
                  {visibleColumns.endDate && <td className="px-3 py-2">{b.endDate}</td>}
                  {visibleColumns.progress && (
                    <td className="px-3 py-2">
                      {(() => {
                        const progressPercent = b.totalClasses > 0 ? Math.round((b.completedClasses / b.totalClasses) * 100) : 0;
                        const getProgressColor = () => {
                          if (progressPercent === 0) return "bg-gray-300";
                          if (progressPercent >= 100) return "bg-red-500";
                          return "bg-green-500";
                        };
                        
                        return (
                          <div className="w-full">
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
                              <div 
                                className={`h-full ${getProgressColor()}`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {b.completedClasses} of {b.totalClasses}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                  )}
                  {visibleColumns.capacity && <td className="px-3 py-2">{b.capacity}</td>}
                  {visibleColumns.enrolled && <td className="px-3 py-2">{b.enrolled}</td>}
                  {visibleColumns.actions && (
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md border">
                          <Link href={`/batches/${b.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md border">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0 rounded-md border">
                          <Link href={`/batches/${b.id}`}>
                            <BarChart3 className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  )}
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
              {/* Row 1: Select branch | Select program */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="branch">Select branch</label>
                  <select
                    id="branch"
                    value={formState.branchId}
                    onChange={(e) => setField("branchId", e.target.value)}
                    className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
                  >
                    <option value="">All branch</option>
                    {demoBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.internalName})
                      </option>
                    ))}
                  </select>
                  {formState.errors.branchId && <div className="text-destructive text-xs">{formState.errors.branchId}</div>}
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
              </div>

              {/* Row 2: Batch name | Internal name */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="name">Batch name</label>
                  <Input id="name" placeholder="Write here" value={formState.name} onChange={(e) => setField("name", e.target.value)} aria-invalid={!!formState.errors.name} />
                  {formState.errors.name && <div className="text-destructive text-xs">{formState.errors.name}</div>}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="internal">Internal name</label>
                  <Input id="internal" placeholder="Write here" value={formState.internalName} onChange={(e) => setField("internalName", e.target.value)} aria-invalid={!!formState.errors.internalName} />
                  {formState.errors.internalName && (
                    <div className="text-destructive text-xs">{formState.errors.internalName}</div>
                  )}
                </div>
              </div>

              {/* Row 3: Admission start date | Admission end date */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="adStart">Admission start date</label>
                  <Input id="adStart" type="date" placeholder="DD/MM/YYYY" value={formState.admissionStartDate} onChange={(e) => setField("admissionStartDate", e.target.value)} aria-invalid={!!formState.errors.admissionStartDate} />
                  {formState.errors.admissionStartDate && <div className="text-destructive text-xs">{formState.errors.admissionStartDate}</div>}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="adEnd">Admission end date</label>
                  <Input id="adEnd" type="date" placeholder="DD/MM/YYYY" value={formState.admissionEndDate} onChange={(e) => setField("admissionEndDate", e.target.value)} aria-invalid={!!formState.errors.admissionEndDate} />
                  {formState.errors.admissionEndDate && <div className="text-destructive text-xs">{formState.errors.admissionEndDate}</div>}
                </div>
              </div>

              {/* Row 4: Class start date | Class end date */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="startDate">Class start date</label>
                  <Input id="startDate" type="date" placeholder="DD/MM/YYYY" value={formState.startDate} onChange={(e) => setField("startDate", e.target.value)} aria-invalid={!!formState.errors.startDate} />
                  {formState.errors.startDate && <div className="text-destructive text-xs">{formState.errors.startDate}</div>}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="endDate">Class end date</label>
                  <Input id="endDate" type="date" placeholder="DD/MM/YYYY" value={formState.endDate} onChange={(e) => setField("endDate", e.target.value)} aria-invalid={!!formState.errors.endDate} />
                  {formState.errors.endDate && <div className="text-destructive text-xs">{formState.errors.endDate}</div>}
                </div>
              </div>

              {/* Row 5: Class day (full width) */}
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

              {/* Row 6: Start time | End time */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="startTime">Start time</label>
                  <Input id="startTime" type="time" placeholder="Select time" value={formState.startTime} onChange={(e) => setField("startTime", e.target.value)} aria-invalid={!!formState.errors.startTime} />
                  {formState.errors.startTime && <div className="text-destructive text-xs">{formState.errors.startTime}</div>}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="endTime">End time</label>
                  <Input id="endTime" type="time" placeholder="Select time" value={formState.endTime} onChange={(e) => setField("endTime", e.target.value)} aria-invalid={!!formState.errors.endTime} />
                  {formState.errors.endTime && <div className="text-destructive text-xs">{formState.errors.endTime}</div>}
                </div>
              </div>

              {/* Row 7: Capacity | Status */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="capacity">Capacity</label>
                  <Input id="capacity" inputMode="numeric" placeholder="Write here" value={formState.capacity} onChange={(e) => setField("capacity", e.target.value)} aria-invalid={!!formState.errors.capacity} />
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
                    <option value="Running">Running</option>
                    <option value="Admission Ongoing">Admission Ongoing</option>
                    <option value="Admission Closed">Admission Closed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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


