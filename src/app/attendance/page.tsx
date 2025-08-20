"use client";

import * as React from "react";
import Link from "next/link";

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

type BatchStatus = "Active" | "Completed" | "Archived";

type BatchRow = {
  id: string;
  name: string;
  internalName: string;
  program: string;
  branch: string;
  branchId: string;
  status: BatchStatus;
  enrolled: number;
};

// Demo rows; in real app, fetch from API
const demo: BatchRow[] = [
  {
    id: "bt1",
    name: "IELTS Morning",
    internalName: "IELTS-M-1",
    program: "IELTS",
    branch: "Uttara Center",
    branchId: "b1",
    status: "Active",
    enrolled: 24,
  },
  {
    id: "bt2",
    name: "Spoken Junior A",
    internalName: "SE-J-A",
    program: "Spoken English Junior",
    branch: "Mirpur Center",
    branchId: "b2",
    status: "Completed",
    enrolled: 18,
  },
];

// Demo summary by batch/date (normally computed server-side)
type SummaryCounts = { present: number; absent: number; late: number };
const demoSummary: Record<string, SummaryCounts> = {
  bt1: { present: 18, absent: 4, late: 2 },
  bt2: { present: 14, absent: 3, late: 1 },
};

export default function AttendanceDirectoryPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  // Date is not yet used to change demo data, but wired for future

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <h1 className="text-xl font-semibold">Attendance</h1>
        <div className="ml-auto flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
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
        </div>
      </div>
      <Separator />

      <div className="px-4 py-4">
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-foreground">
              <tr className="text-left">
                <th className="px-3 py-2">Batch</th>
                <th className="px-3 py-2">Program</th>
                <th className="px-3 py-2">Branch</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Enrolled</th>
                <th className="px-3 py-2">Present</th>
                <th className="px-3 py-2">Absent</th>
                <th className="px-3 py-2">Late</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demo.map((b) => {
                const sum = demoSummary[b.id] ?? { present: 0, absent: 0, late: 0 };
                return (
                  <tr key={b.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-muted-foreground text-xs">{b.internalName}</div>
                    </td>
                    <td className="px-3 py-2">{b.program}</td>
                    <td className="px-3 py-2">{b.branch}</td>
                    <td className="px-3 py-2">
                      <Badge variant={b.status === "Active" ? "success" : b.status === "Completed" ? "secondary" : "outline"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{b.enrolled}</td>
                    <td className="px-3 py-2">{sum.present}</td>
                    <td className="px-3 py-2">{sum.absent}</td>
                    <td className="px-3 py-2">{sum.late}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/attendance/${b.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


