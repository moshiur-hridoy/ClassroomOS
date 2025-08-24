"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Calendar as CalendarIcon, List, Search, MoreVertical, Clock } from "lucide-react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Input } from "@/registry/new-york-v4/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york-v4/ui/dialog";
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/new-york-v4/ui/breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/new-york-v4/ui/popover";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";

function formatTime(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const hour = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? "pm" : "am";
  return `${hour}${m ? ":" + String(m).padStart(2, "0") : ""} ${ampm}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" });
}

function getActivityTypeColor(type: string) {
  const colors = {
    'Lecture': 'bg-blue-50 text-blue-700 border-blue-200',
    'Exam': 'bg-red-50 text-red-700 border-red-200',
    'PTM': 'bg-purple-50 text-purple-700 border-purple-200',
    'Play Day': 'bg-green-50 text-green-700 border-green-200',
    'Homework': 'bg-orange-50 text-orange-700 border-orange-200',
    'Rating': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Free Class': 'bg-gray-50 text-gray-700 border-gray-200',
    'Speaking Tests': 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
}

type BatchStatus = "Active" | "Inactive";
type Program = "IELTS" | "Spoken English Junior" | "Spoken English" | "TOEFL" | "GRE" | "GMAT";
type Weekday = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

type Batch = {
  id: string;
  name: string;
  internalName: string;
  branchId: string;
  program: Program;
  startDate: string;
  endDate: string;
  days: Weekday[];
  startTime: string;
  endTime: string;
  capacity: number;
  admissionStartDate: string;
  admissionEndDate: string;
  status: BatchStatus;
  enrolled: number;
};

type Activity = {
  id: string;
  title: string;
  code: string;
  tag: string;
  date: string;
  time: string;
  roomId: string;
  teachers: string;
};

// Demo data
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

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const batch = demoBatches.find(b => b.id === id);
  const [view, setView] = React.useState<"list" | "calendar">("list");
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [generatorOpen, setGeneratorOpen] = React.useState(false);
  const [editingActivity, setEditingActivity] = React.useState<string | null>(null);
  const [highlightedActivity, setHighlightedActivity] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [pendingActivities, setPendingActivities] = React.useState<Activity[]>([]);
  const [hasPendingChanges, setHasPendingChanges] = React.useState(false);
  const [selectedActivities, setSelectedActivities] = React.useState<Set<string>>(new Set());
  const [assignTeacherOpen, setAssignTeacherOpen] = React.useState(false);
  const [selectedTeachers, setSelectedTeachers] = React.useState<string[]>([]);
  const [toast, setToast] = React.useState<{ message: string; visible: boolean }>({ message: "", visible: false });

  function showToast(message: string) {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: "", visible: false });
    }, 3000);
  }

  if (!batch) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold">Batch not found</h1>
          <p className="text-muted-foreground">The requested batch could not be found.</p>
        </div>
      </div>
    );
  }

  const branch = demoBranches.find(b => b.id === batch.branchId);

  // Generate activities inline
  async function generateActivitiesInline() {
    if (!batch) return;
    
    setIsGenerating(true);
    setHasPendingChanges(false);
    
    // Simulate API call with loading
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const baseDate = new Date(batch.startDate);
    const generatedActivities: Activity[] = Array.from({ length: 8 }).map((_, i) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i * 2); // Every 2 days
      return {
        id: `act-${i + 1}`,
        title: `Class ${i + 1}`,
        code: `IRL0${i + 1}`,
        tag: i === 1 ? "Exam" : i === 3 ? "Play Day" : i === 5 ? "Rating" : "Lecture",
        date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
        time: `${batch.startTime} - ${batch.endTime}`,
        roomId: "",
        teachers: "",
      };
    });
    
    setPendingActivities(generatedActivities);
    setHasPendingChanges(true);
    setIsGenerating(false);
  }

  function saveActivities() {
    setActivities(pendingActivities);
    setPendingActivities([]);
    setHasPendingChanges(false);
  }

  function discardActivities() {
    setPendingActivities([]);
    setHasPendingChanges(false);
  }

  function toggleActivitySelection(activityId: string) {
    setSelectedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    const allActivityIds = activities.map(a => a.id);
    if (selectedActivities.size === activities.length) {
      setSelectedActivities(new Set());
    } else {
      setSelectedActivities(new Set(allActivityIds));
    }
  }

  function assignTeachersToSelected() {
    if (selectedTeachers.length === 0) return;
    
    const teachersString = selectedTeachers.join(', ');
    const classCount = selectedActivities.size;
    
    // Update saved activities
    setActivities(prev => 
      prev.map(activity => 
        selectedActivities.has(activity.id) 
          ? { ...activity, teachers: teachersString }
          : activity
      )
    );
    // Update pending activities
    setPendingActivities(prev => 
      prev.map(activity => 
        selectedActivities.has(activity.id) 
          ? { ...activity, teachers: teachersString }
          : activity
      )
    );
    
    // Show success toast
    const teacherNames = selectedTeachers.join(', ');
    showToast(`${teacherNames} assigned to ${classCount} class${classCount !== 1 ? 'es' : ''}`);
    
    // Keep activities selected, only clear teacher selection and close dialog
    setSelectedTeachers([]);
    setAssignTeacherOpen(false);
  }

  function assignRoomToSelected(roomId: string) {
    const classCount = selectedActivities.size;
    
    // Update saved activities
    setActivities(prev => 
      prev.map(activity => 
        selectedActivities.has(activity.id) 
          ? { ...activity, roomId: roomId }
          : activity
      )
    );
    // Update pending activities
    setPendingActivities(prev => 
      prev.map(activity => 
        selectedActivities.has(activity.id) 
          ? { ...activity, roomId: roomId }
          : activity
      )
    );
    
    // Show success toast
    showToast(`${roomId} assigned to ${classCount} class${classCount !== 1 ? 'es' : ''}`);
    
    // Keep activities selected so user can assign teachers too
  }

  // helpers moved to module scope

  function handleDateChange(activityId: string, newDate: Date) {
    setActivities(prev => {
      const updated = prev.map(act => 
        act.id === activityId 
          ? { ...act, date: newDate.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) }
          : act
      );
      
      // Sort by date
      const sorted = updated.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Highlight the moved activity
      setHighlightedActivity(activityId);
      setTimeout(() => setHighlightedActivity(null), 2000);
      
      return sorted;
    });
    setEditingActivity(null);
  }

  function handleTimeChange(activityId: string, newTime: string, isStart: boolean) {
    setActivities(prev => prev.map(act => 
      act.id === activityId 
        ? { 
            ...act, 
            time: isStart 
              ? `${newTime} - ${act.time.split(' - ')[1] || '12:00 PM'}`
              : `${act.time.split(' - ')[0] || '10:00 AM'} - ${newTime}`
          }
        : act
    ));
    setEditingActivity(null);
  }

  // Click outside to close calendar/time picker
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editingActivity && !(event.target as Element).closest('.activity-edit-area')) {
        setEditingActivity(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingActivity]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/batches">All Batches</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{batch.internalName}</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Batch Activity Planner</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
      <Separator />

      {/* Summary info bar */}
      <div className="px-4 py-4">
        <div className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <SummaryItem label="Course" value={`${batch.program} Program`} />
          <SummaryItem label="Batch" value={batch.internalName} />
          <SummaryItem label="Class Duration" value={`${formatTime(batch.startTime)} to ${formatTime(batch.endTime)}`} />
          <SummaryItem label="Branch" value={branch?.name ?? "-"} />
          <SummaryItem label="Days" value={batch.days.join(", ")} />
          <SummaryItem label="Start Date" value={formatDate(batch.startDate)} />
        </div>
      </div>

      {/* Title + controls */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold">Batch Activity Planner</h2>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background p-1 text-sm">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => setView("list")}
              >
                <List className="mr-2 size-4" /> List
              </Button>
              <Button
                variant={view === "calendar" ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => setView("calendar")}
              >
                <CalendarIcon className="mr-2 size-4" /> Calendar
              </Button>
            </div>
            <Button className="gap-2" disabled={activities.length === 0}>
              <Plus className="size-4" /> Add Activity
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-3">
          {/* Select All - only show when there are activities */}
          {activities.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                ref={(el) => {
                  if (el) el.indeterminate = selectedActivities.size > 0 && selectedActivities.size < activities.length;
                }}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                onChange={toggleSelectAll}
                checked={activities.length > 0 && selectedActivities.size === activities.length}
              />
              <span className="text-sm text-muted-foreground">
                {selectedActivities.size > 0 ? `${selectedActivities.size} selected` : "Select All"}
              </span>
              {selectedActivities.size > 0 && (
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => setAssignTeacherOpen(true)}
                  >
                    Assign Teacher
                  </Button>
                                        <select 
                        className="border-input bg-background text-foreground h-8 rounded-md border px-2 text-sm min-w-28"
                        onChange={(e) => e.target.value && assignRoomToSelected(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign Room</option>
                        <option value="A1">Room A1</option>
                        <option value="A2">Room A2</option>
                        <option value="B1">Room B1</option>
                        <option value="B2">Room B2</option>
                        <option value="B7">Room B7</option>
                        <option value="C1">Room C1</option>
                        <option value="Lab 1">Lab 1</option>
                        <option value="Conference Room">Conference Room</option>
                      </select>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:block">
              <select className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm min-w-40">
                <option value="">Select batch</option>
                {demoBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2" />
              <Input placeholder="Search" className="pl-8 w-44 sm:w-56" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-8">
        {/* Shimmer loading */}
        {isGenerating && (
          <div className="flex flex-col gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between gap-4 rounded-xl border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-200 size-10"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending activities (green border) */}
        {hasPendingChanges && pendingActivities.length > 0 && (
          <div className="mb-6">
            <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50/50">
              <div className="flex items-center justify-between mb-4">
                {/* Select All for pending activities - Left side */}
                <div className="flex items-center gap-2">
                  <input
                    ref={(el) => {
                      if (el) {
                        const allPendingIds = pendingActivities.map(a => a.id);
                        const selectedPendingCount = allPendingIds.filter(id => selectedActivities.has(id)).length;
                        el.indeterminate = selectedPendingCount > 0 && selectedPendingCount < pendingActivities.length;
                      }
                    }}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    onChange={() => {
                      const allPendingIds = pendingActivities.map(a => a.id);
                      if (selectedActivities.size === pendingActivities.length && 
                          allPendingIds.every(id => selectedActivities.has(id))) {
                        // Clear all pending selections
                        const newSelected = new Set(selectedActivities);
                        allPendingIds.forEach(id => newSelected.delete(id));
                        setSelectedActivities(newSelected);
                      } else {
                        // Select all pending
                        const newSelected = new Set(selectedActivities);
                        allPendingIds.forEach(id => newSelected.add(id));
                        setSelectedActivities(newSelected);
                      }
                    }}
                    checked={pendingActivities.length > 0 && pendingActivities.every(a => selectedActivities.has(a.id))}
                  />
                  <span className="text-sm text-muted-foreground">
                    {pendingActivities.filter(a => selectedActivities.has(a.id)).length > 0 
                      ? `${pendingActivities.filter(a => selectedActivities.has(a.id)).length} selected` 
                      : "Select All"}
                  </span>
                  {pendingActivities.some(a => selectedActivities.has(a.id)) && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => setAssignTeacherOpen(true)}
                      >
                        Assign Teacher
                      </Button>
                      <select 
                        className="border-input bg-background text-foreground h-8 rounded-md border px-2 text-sm min-w-28"
                        onChange={(e) => e.target.value && assignRoomToSelected(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign Room</option>
                        <option value="A1">Room A1</option>
                        <option value="A2">Room A2</option>
                        <option value="B1">Room B1</option>
                        <option value="B2">Room B2</option>
                        <option value="B7">Room B7</option>
                        <option value="C1">Room C1</option>
                        <option value="Lab 1">Lab 1</option>
                        <option value="Conference Room">Conference Room</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {/* Generated Activities text and buttons - Right side */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium text-sm">Generated Activities (Not Saved)</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={discardActivities}>
                      Discard
                    </Button>
                    <Button size="sm" onClick={saveActivities}>
                      Save Activities
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {pendingActivities.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          onChange={() => toggleActivitySelection(a.id)}
                          checked={selectedActivities.has(a.id)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span>{a.title}</span>
                          <span className="text-muted-foreground">{a.code}</span>
                          <Badge 
                            variant="secondary" 
                            className={`rounded-full border ${getActivityTypeColor(a.tag)}`}
                          >
                            {a.tag}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground text-sm">Introductory class and Listening (Pre-assessment)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="grid grid-cols-4 gap-6 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Date</div>
                          <div className="font-medium">{a.date}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Time</div>
                          <div>{a.time}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Room</div>
                          <div className="font-medium">{a.roomId || "Not assigned"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Teacher</div>
                          <div className="font-medium">{a.teachers || "Not assigned"}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {activities.length === 0 && !isGenerating && !hasPendingChanges && (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="flex max-w-md flex-col items-center gap-4 text-center">
              <EmptyCoursesIllustration />
              <div className="text-muted-foreground">No Activity Found</div>
              <Button 
                className="gap-2" 
                onClick={generateActivitiesInline}
                disabled={isGenerating}
              >
                <Plus className="size-4" /> 
                {isGenerating ? "Generating..." : "Generate Batch Activity"}
              </Button>
            </div>
          </div>
        )}

        {/* Saved activities */}
        {activities.length > 0 && (
          <div className="flex flex-col gap-3">
            {activities.map((a) => (
              <div 
                key={a.id} 
                className={`flex items-center justify-between gap-4 rounded-xl border bg-background p-4 transition-all duration-500 ${
                  highlightedActivity === a.id ? 'border-blue-400 shadow-md' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      onChange={() => toggleActivitySelection(a.id)}
                      checked={selectedActivities.has(a.id)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span>{a.title}</span>
                      <span className="text-muted-foreground">{a.code}</span>
                      <Badge 
                        variant="secondary" 
                        className={`rounded-full border ${getActivityTypeColor(a.tag)}`}
                      >
                        {a.tag}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-sm">Introductory topic</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="grid grid-cols-4 gap-6 text-sm w-full">
                    <div className="min-w-0">
                      <div className="text-muted-foreground mb-1">Date</div>
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded py-1 transition-colors activity-edit-area"
                        onClick={() => setEditingActivity(editingActivity === `${a.id}-date` ? null : `${a.id}-date`)}
                      >
                        <span className="font-medium">{a.date}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted flex-shrink-0"
                        >
                          <CalendarIcon className="h-3 w-3" />
                        </Button>
                      </div>
                      {editingActivity === `${a.id}-date` && (
                        <div className="absolute z-50 mt-2 bg-background border rounded-lg p-3 shadow-lg activity-edit-area">
                          <Calendar 
                            mode="single" 
                            selected={new Date(a.date)} 
                            onSelect={(date) => {
                              if (date) handleDateChange(a.id, date);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-muted-foreground mb-1">Time</div>
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded py-1 transition-colors activity-edit-area"
                        onClick={() => setEditingActivity(editingActivity === `${a.id}-time` ? null : `${a.id}-time`)}
                      >
                        <span className="font-medium">{a.time}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted flex-shrink-0"
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                      </div>
                      {editingActivity === `${a.id}-time` && (
                        <div className="absolute z-50 mt-2 bg-background border rounded-lg p-2 shadow-lg activity-edit-area">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Start</label>
                              <Input
                                type="time"
                                className="h-8 text-xs"
                                defaultValue={a.time.split(' - ')[0]}
                                onBlur={(e) => handleTimeChange(a.id, e.target.value, true)}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">End</label>
                              <Input
                                type="time"
                                className="h-8 text-xs"
                                defaultValue={a.time.split(' - ')[1]}
                                onBlur={(e) => handleTimeChange(a.id, e.target.value, false)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-muted-foreground mb-1">Room</div>
                      <div className="font-medium">{a.roomId || "Not assigned"}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-muted-foreground mb-1">Teacher</div>
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {a.teachers ? a.teachers.split(',').map((teacher, index) => (
                            <div key={index} className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white">
                              {teacher.trim()}
                            </div>
                          )) : <span className="text-muted-foreground text-sm">Not assigned</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Teacher Dialog */}
      <Dialog open={assignTeacherOpen} onOpenChange={setAssignTeacherOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Teacher</DialogTitle>
            <DialogDescription>
              Assign a teacher to {selectedActivities.size} selected class{selectedActivities.size !== 1 ? 'es' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Teachers</label>
              <div className="grid gap-2">
                {[
                  { code: "JD", name: "John Doe" },
                  { code: "SS", name: "Sarah Smith" },
                  { code: "MJ", name: "Michael Johnson" },
                  { code: "ED", name: "Emily Davis" },
                  { code: "DW", name: "David Wilson" }
                ].map((teacher) => (
                  <label key={teacher.code} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedTeachers.includes(teacher.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeachers(prev => [...prev, teacher.code]);
                        } else {
                          setSelectedTeachers(prev => prev.filter(t => t !== teacher.code));
                        }
                      }}
                    />
                    <span className="text-sm">{teacher.name} ({teacher.code})</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Select multiple teachers to assign to the selected classes.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedTeachers([]);
              setAssignTeacherOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={assignTeachersToSelected}
              disabled={selectedTeachers.length === 0}
            >
              Assign Teachers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-right">
          <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

    </div>
  );
}



function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function EmptyCoursesIllustration() {
  return (
    <svg width="161" height="160" viewBox="0 0 161 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M78.1923 140.495C106.192 140.495 128.892 117.795 128.892 89.6945C128.892 61.5945 106.192 38.8945 78.1923 38.8945C50.1923 38.8945 27.4923 61.5945 27.4923 89.6945C27.4923 117.795 50.1923 140.495 78.1923 140.495Z" fill="#EAEEF9"/>
      <path d="M40.8923 56.7949H112.992C115.892 56.7949 118.092 58.9949 118.092 61.8949V107.595C118.092 110.495 115.892 112.695 112.992 112.695H40.8923C37.9923 112.695 35.7923 110.495 35.7923 107.595V61.8949C35.7923 58.9949 38.1923 56.7949 40.8923 56.7949Z" fill="url(#paint0_linear_53_4508)"/>
      <path d="M119.492 86.0953V108.595C119.492 111.495 117.192 113.895 114.192 113.895H40.0923C37.1923 113.895 34.7923 111.495 34.7923 108.595V84.1953" stroke="#1676EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M113.192 73.4941H89.7923C87.4923 73.4941 85.2923 74.2941 83.5923 75.6941L77.4923 80.6941C75.7923 82.0941 73.5923 82.8941 71.2923 82.8941H44.8923C42.1923 82.8941 39.9923 85.0941 39.9923 87.7941C39.9923 87.9941 39.9923 88.2941 40.0923 88.4941L44.9923 114.294C45.3923 116.694 47.3923 118.494 49.8923 118.494H106.392C108.792 118.494 110.892 116.794 111.292 114.394L118.092 79.0941C118.592 76.3941 116.792 73.9941 114.092 73.4941C113.692 73.4941 113.392 73.4941 113.192 73.4941Z" fill="white"/>
      <g filter="url(#filter0_d_53_4508)">
        <path d="M123.692 66.5941H93.2924C90.2924 66.5941 87.4924 67.5941 85.1924 69.4941L77.1924 75.9941C74.9924 77.7941 72.0924 78.8941 69.0924 78.8941H34.6924C31.1924 78.8941 28.3924 81.7941 28.3924 85.1941C28.3924 85.4941 28.3924 85.7941 28.4924 86.0941L34.7924 119.794C35.2924 122.994 37.9924 125.294 41.0924 125.294H114.692C117.892 125.294 120.492 123.094 120.992 119.894L129.892 73.7941C130.492 70.2941 128.192 67.1941 124.692 66.4941C124.392 66.5941 123.992 66.5941 123.692 66.5941Z" fill="url(#paint1_linear_53_4508)"/>
      </g>
      <path d="M64.8923 101.495C66.6923 101.495 68.1923 99.9945 68.1923 98.1945C68.1923 96.3945 66.6923 94.8945 64.8923 94.8945C63.0923 94.8945 61.5923 96.3945 61.5923 98.1945C61.5923 99.9945 63.0923 101.495 64.8923 101.495Z" fill="#989FB0"/>
      <path d="M90.5923 101.395C92.3923 101.395 93.8923 99.8949 93.8923 98.0949C93.8923 96.2949 92.3923 94.7949 90.5923 94.7949C88.7923 94.7949 87.2923 96.2949 87.2923 98.0949C87.2923 99.9949 88.7923 101.395 90.5923 101.395Z" fill="#989FB0"/>
      <path d="M128.592 122.994C128.192 124.694 127.592 126.494 126.892 127.994C124.992 131.694 121.992 134.594 118.292 136.494C114.492 138.394 109.992 139.194 105.492 138.194C94.8924 135.994 88.0924 125.594 90.2924 114.994C92.4924 104.394 102.792 97.4942 113.392 99.7942C117.192 100.594 120.492 102.494 123.292 105.094C127.992 109.794 129.992 116.594 128.592 122.994Z" fill="url(#paint2_linear_53_4508)"/>
      <path d="M115.692 117.294H111.192V112.794C111.192 111.894 110.492 111.094 109.492 111.094C108.592 111.094 107.792 111.794 107.792 112.794V117.294H103.292C102.392 117.294 101.592 117.994 101.592 118.994C101.592 119.994 102.292 120.694 103.292 120.694H107.792V125.194C107.792 126.094 108.492 126.894 109.492 126.894C110.392 126.894 111.192 126.194 111.192 125.194V120.694H115.692C116.592 120.694 117.392 119.994 117.392 118.994C117.392 117.994 116.592 117.294 115.692 117.294Z" fill="white"/>
      <path d="M73.6923 77.7949C70.0923 70.7949 69.2923 62.3949 71.6923 54.7949C73.9923 47.1949 79.4923 40.6949 86.2923 36.9949C88.3923 35.8949 90.7923 34.9949 93.1923 34.8949C95.5923 34.7949 98.1923 35.5949 99.7923 37.5949C101.392 39.3949 101.692 42.3949 100.392 44.3949C98.9923 46.2949 96.1923 47.0949 93.8923 46.4949C90.1923 45.7949 87.1923 42.8949 86.2923 39.3949C85.3923 35.8949 86.5923 31.7949 89.3923 29.4949C91.1923 27.8949 93.6923 26.9949 95.9923 26.2949C107.192 22.9949 119.392 22.5949 130.792 25.0949" stroke="#C9D4E2" strokeWidth="2" strokeMiterlimit="10" strokeDasharray="4 4"/>
      <path d="M80.8924 104.994H74.6924V106.494H80.8924V104.994Z" fill="#989FB0"/>
      <path d="M136.792 22.4944C136.692 23.9944 136.592 25.3944 135.492 25.6944C134.392 25.9944 133.892 24.9944 133.192 23.5944C132.492 22.2944 132.892 20.8944 134.092 20.5944C135.192 20.2944 136.992 20.6944 136.792 22.4944Z" fill="#DAE2EB"/>
      <path d="M135.592 29.6949C135.892 27.8949 136.192 26.8949 135.192 26.3949C134.092 25.8949 133.392 26.7949 132.192 27.9949C131.192 29.0949 131.792 30.6949 132.792 31.1949C133.992 31.7949 135.292 31.1949 135.592 29.6949Z" fill="#DAE2EB"/>
      <path d="M136.992 26.3949C136.892 27.0949 136.392 27.5949 135.692 27.6949C135.392 27.6949 135.092 27.6949 134.692 27.6949C133.292 27.4949 132.192 26.5949 132.292 25.6949C132.392 24.7949 133.692 24.2949 135.292 24.4949C135.592 24.4949 135.892 24.5949 136.092 24.6949C136.692 24.8949 137.092 25.5949 136.992 26.3949C136.992 26.3949 136.992 26.2949 136.992 26.3949Z" fill="#989FB0"/>
      <path d="M25.3924 54.4949C25.3924 52.7949 25.3924 51.0949 26.5924 50.5949C27.8924 50.0949 28.5924 51.2949 29.5924 52.9949C30.4924 54.4949 30.0924 56.0949 28.7924 56.5949C27.6924 57.0949 25.3924 56.7949 25.3924 54.4949Z" fill="#DAE2EB"/>
      <path d="M26.0923 46.095C25.8923 48.195 25.5923 49.395 26.8923 49.895C28.1923 50.395 28.8923 49.295 30.1923 47.695C31.1923 46.295 30.4923 44.495 29.1923 43.995C27.8923 43.495 26.2923 44.395 26.0923 46.095Z" fill="#DAE2EB"/>
      <path d="M24.9923 50.0945C24.9923 49.2945 25.5923 48.6945 26.2923 48.5945C26.5923 48.4945 26.9923 48.4945 27.3923 48.5945C28.9923 48.6945 30.3923 49.5945 30.2923 50.5945C30.1923 51.5945 28.8923 52.2945 27.1923 52.0945C26.8923 52.0945 26.5923 51.9945 26.2923 51.8945C25.4923 51.7945 24.9923 50.9945 24.9923 50.0945Z" fill="#989FB0"/>
      <path d="M31.7923 50.3945C42.2923 50.3945 61.6923 56.4945 61.9923 78.8945" stroke="#C9D4E2" strokeWidth="2" strokeMiterlimit="10" strokeDasharray="4 4"/>
      <defs>
        <filter id="filter0_d_53_4508" x="6.39236" y="55.4941" width="145.595" height="102.801" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="11"/>
          <feGaussianBlur stdDeviation="11"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.397708 0 0 0 0 0.47749 0 0 0 0 0.575 0 0 0 0.27 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_53_4508"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_53_4508" result="shape"/>
        </filter>
        <linearGradient id="paint0_linear_53_4508" x1="76.9488" y1="58.7368" x2="76.9488" y2="90.1129" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B0BACC"/>
          <stop offset="1" stopColor="#969EAE"/>
        </linearGradient>
        <linearGradient id="paint1_linear_53_4508" x1="79.1568" y1="65.134" x2="79.1568" y2="125.928" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDFEFF"/>
          <stop offset="0.9964" stopColor="#ECF0F5"/>
        </linearGradient>
        <linearGradient id="paint2_linear_53_4508" x1="89.8611" y1="118.994" x2="129.038" y2="118.994" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B0BACC"/>
          <stop offset="1" stopColor="#969EAE"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
