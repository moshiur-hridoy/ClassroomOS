"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover";

type BatchStatus = "Running" | "Admission Ongoing" | "Admission Closed" | "Inactive";
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

// Demo batches data (same as main page)
const demoBatches = [
  {
    id: "bt1",
    name: "IRC1",
    internalName: "C1",
    branchId: "b1",
    program: "IELTS" as Program,
    startDate: new Date("2025-09-01"),
    endDate: new Date("2025-11-30"),
    days: ["Sun", "Tue", "Thu"] as Weekday[],
    startTime: "10:00",
    endTime: "12:00",
    capacity: 30,
    admissionStartDate: new Date("2025-08-15"),
    admissionEndDate: new Date("2025-08-31"),
    status: "Running" as BatchStatus,
    enrolled: 18,
    totalClasses: 80,
    completedClasses: 30,
  },
  {
    id: "bt2",
    name: "IRC2",
    internalName: "C3",
    branchId: "b2",
    program: "Spoken English" as Program,
    startDate: new Date("2025-09-15"),
    endDate: new Date("2025-12-15"),
    days: ["Mon", "Wed", "Fri"] as Weekday[],
    startTime: "14:00",
    endTime: "16:00",
    capacity: 25,
    admissionStartDate: new Date("2025-09-01"),
    admissionEndDate: new Date("2025-09-14"),
    status: "Admission Ongoing" as BatchStatus,
    enrolled: 0,
    totalClasses: 80,
    completedClasses: 0,
  },
  {
    id: "bt3",
    name: "IRC3",
    internalName: "C5",
    branchId: "b1",
    program: "TOEFL" as Program,
    startDate: new Date("2025-08-01"),
    endDate: new Date("2025-10-31"),
    days: ["Tue", "Thu", "Sat"] as Weekday[],
    startTime: "16:00",
    endTime: "18:00",
    capacity: 20,
    admissionStartDate: new Date("2025-07-15"),
    admissionEndDate: new Date("2025-07-31"),
    status: "Running" as BatchStatus,
    enrolled: 15,
    totalClasses: 80,
    completedClasses: 60,
  },
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

type FormState = FormFields & {
  errors: Partial<Record<keyof FormFields | `days.${number}`, string>>;
};

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
    status: "Running",
    errors: {},
  };
}

interface EditBatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBatchPage({ params }: EditBatchPageProps) {
  const [id, setId] = React.useState<string>("");
  const router = useRouter();
  const [formState, setFormState] = React.useState<FormState>(emptyForm());

  // Handle async params and load batch data
  React.useEffect(() => {
    const loadParams = async () => {
      const { id: paramId } = await params;
      setId(paramId);
      
      const batch = demoBatches.find((b) => b.id === paramId);
      if (batch) {
        setFormState({
          name: batch.name,
          internalName: batch.internalName,
          branchId: batch.branchId,
          program: batch.program,
          startDate: batch.startDate,
          endDate: batch.endDate,
          days: [...batch.days],
          startTime: batch.startTime,
          endTime: batch.endTime,
          capacity: batch.capacity.toString(),
          admissionStartDate: batch.admissionStartDate,
          admissionEndDate: batch.admissionEndDate,
          status: batch.status,
          errors: {},
        });
      }
    };
    
    loadParams();
  }, [params]);

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
    router.push("/batches");
  }

  const currentBatch = demoBatches.find((b) => b.id === id);
  if (!currentBatch) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button asChild variant="outline">
            <Link href="/batches" className="inline-flex items-center gap-2">
              <ChevronLeft className="size-4" /> Back
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Batch not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <Button asChild variant="outline">
          <Link href="/batches" className="inline-flex items-center gap-2">
            <ChevronLeft className="size-4" /> Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Edit Batch</h1>
      </div>
      <Separator />

      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <div className="grid gap-4">
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
              {formState.errors.internalName && <div className="text-destructive text-xs">{formState.errors.internalName}</div>}
            </div>
          </div>

          {/* Row 3: Admission start date | Admission end date */}
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
                    {formState.admissionStartDate ? formState.admissionStartDate.toLocaleDateString() : <span className="text-muted-foreground">DD/MM/YYYY</span>}
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
                    {formState.admissionEndDate ? formState.admissionEndDate.toLocaleDateString() : <span className="text-muted-foreground">DD/MM/YYYY</span>}
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

          {/* Row 4: Class start date | Class end date */}
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
                    {formState.startDate ? formState.startDate.toLocaleDateString() : <span className="text-muted-foreground">DD/MM/YYYY</span>}
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
                    {formState.endDate ? formState.endDate.toLocaleDateString() : <span className="text-muted-foreground">DD/MM/YYYY</span>}
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

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href="/batches">Cancel</Link>
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
