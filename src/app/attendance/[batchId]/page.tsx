"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Edit, MoreHorizontal, Check, X, CalendarIcon } from "lucide-react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york-v4/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/new-york-v4/ui/dropdown-menu";

type Status = "Present" | "Absent" | "Late";

type StudentRow = {
  studentId: string;
  studentName: string;
  punchIn?: string;
  punchOut?: string;
  status: Status;
  correctionLog: Array<{ user: string; time: string; note: string }>;
};

const demoBatch = {
  id: "bt1",
  name: "IELTS Morning",
  internalName: "IELTS-M-1",
  program: "IELTS",
  branch: "Uttara Center",
  status: "Active" as const,
};

const demoStudents: StudentRow[] = [
  { studentId: "S-1001", studentName: "Nadia Rahman", punchIn: "09:55", punchOut: "12:05", status: "Present", correctionLog: [] },
  { studentId: "S-1002", studentName: "Arif Hossain", punchIn: "10:08", punchOut: "12:00", status: "Late", correctionLog: [] },
  { studentId: "S-1003", studentName: "Samira Akter", status: "Absent", correctionLog: [] },
];

export default function AttendanceDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [rows, setRows] = React.useState<StudentRow[]>(demoStudents);
  const [correctionFor, setCorrectionFor] = React.useState<string | null>(null);
  const [noteText, setNoteText] = React.useState<string>("");
  const [tempStatus, setTempStatus] = React.useState<Status | null>(null);

  function setStatus(studentId: string, status: Status) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  }

  function setTime(studentId: string, field: "punchIn" | "punchOut", value: string) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, [field]: value } : r)));
  }

  function logCorrection(studentId: string, note: string) {
    const entry = { user: "staff-demo", time: new Date().toISOString(), note };
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, correctionLog: [...r.correctionLog, entry] } : r)));
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="text-sm text-muted-foreground">Attendance</div>
        <div className="text-muted-foreground">/</div>
        <div className="font-medium">{demoBatch.name}</div>
        <div className="ml-auto flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : <span className="text-muted-foreground">Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" /> Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/batches/${demoBatch.id}/edit`} className="gap-2 inline-flex items-center">
              <Edit className="size-4" /> Edit Batch
            </Link>
          </Button>
        </div>
      </div>
      <Separator />

      <div className="px-4 py-4">
        <div className="mb-4 grid gap-1">
          <div className="text-lg font-semibold flex items-center gap-2">
            {demoBatch.name}
            <span className="text-muted-foreground text-sm">({demoBatch.internalName})</span>
            <Badge variant={demoBatch.status === "Active" ? "success" : "secondary"}>{demoBatch.status}</Badge>
          </div>
          <div className="text-muted-foreground text-sm">
            Program: {demoBatch.program} • Branch: {demoBatch.branch}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-foreground">
              <tr className="text-left">
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Punch In</th>
                <th className="px-3 py-2">Punch Out</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Manual Correction</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.studentId} className="border-t">
                  <td className="px-3 py-2">{r.studentName}</td>
                  <td className="px-3 py-2 font-mono">{r.studentId}</td>
                  <td className="px-3 py-2">
                    <Input type="time" value={r.punchIn ?? ""} onChange={(e) => setTime(r.studentId, "punchIn", e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <Input type="time" value={r.punchOut ?? ""} onChange={(e) => setTime(r.studentId, "punchOut", e.target.value)} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          r.status === "Present" ? "success" : r.status === "Absent" ? "destructive" : "warning"
                        }
                      >
                        {r.status}
                      </Badge>
                      {/* Status dropdown moved to Manual Correction cell when editing */}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      {correctionFor !== r.studentId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setCorrectionFor(r.studentId)
                                setNoteText("")
                                setTempStatus(r.status)
                              }}
                            >
                              Manual correction
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {correctionFor === r.studentId && (
                        <div className="flex items-center gap-2">
                          <select
                            value={tempStatus || r.status}
                            onChange={(e) => setTempStatus(e.target.value as Status)}
                            className="border-input bg-background text-foreground h-9 rounded-md border px-2 text-sm"
                          >
                            <option>Present</option>
                            <option>Absent</option>
                            <option>Late</option>
                          </select>
                          <Input
                            placeholder="Add note for correction log"
                            className="w-56"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && noteText.trim()) {
                                logCorrection(r.studentId, noteText.trim())
                                setNoteText("")
                                setCorrectionFor(null)
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Save correction"
                            onClick={() => {
                              if (tempStatus && tempStatus !== r.status) {
                                setStatus(r.studentId, tempStatus)
                              }
                              if (noteText.trim()) {
                                logCorrection(r.studentId, noteText.trim())
                              }
                              setNoteText("")
                              setCorrectionFor(null)
                              setTempStatus(null)
                            }}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Cancel correction"
                            onClick={() => {
                              setNoteText("")
                              setCorrectionFor(null)
                              setTempStatus(null)
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


