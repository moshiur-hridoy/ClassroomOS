"use client";

import * as React from "react";

import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/new-york-v4/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york-v4/ui/dialog";
import { Switch } from "@/registry/new-york-v4/ui/switch";

type GovHoliday = {
  name: string;
  date: string; // yyyy-mm-dd
};

type TimeBlock = {
  id: string;
  name: string;
  date: Date | undefined;
  type: "Full Day" | "Time Range";
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
};

const GOVERNMENT_HOLIDAYS: GovHoliday[] = [
  { name: "International Mother Language Day", date: "2025-02-21" },
  { name: "Independence Day", date: "2025-03-26" },
  { name: "Pohela Boishakh", date: "2025-04-14" },
  { name: "Eid-ul-Fitr (approx)", date: "2025-03-31" },
  { name: "Eid-ul-Adha (approx)", date: "2025-06-08" },
  { name: "Victory Day", date: "2025-12-16" },
];

export default function TimeBlocksPage() {
  const [customBlocks, setCustomBlocks] = React.useState<TimeBlock[]>([]);
  const [open, setOpen] = React.useState(false);

  function removeBlock(id: string) {
    setCustomBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <h1 className="text-xl font-semibold">Time blocks</h1>
        <div className="ml-auto flex items-center gap-2">
          <AddTimeBlockDialog open={open} onOpenChange={setOpen} onCreate={(b) => setCustomBlocks((p) => [b, ...p])} />
        </div>
      </div>
      <Separator />

      <div className="px-4 py-6">
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Government holidays</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-foreground">
                <tr className="text-left">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {GOVERNMENT_HOLIDAYS.map((h) => (
                  <tr key={h.name + h.date} className="border-t">
                    <td className="px-3 py-2">{formatYmd(h.date)}</td>
                    <td className="px-3 py-2">{h.name}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">Holiday</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Custom time blocks</h2>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Add</Button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-foreground">
                <tr className="text-left">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      No custom time blocks yet. Click Add to create one.
                    </td>
                  </tr>
                ) : (
                  customBlocks.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="px-3 py-2">{b.date ? b.date.toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2">{b.name}</td>
                      <td className="px-3 py-2">
                        <Badge variant={b.type === "Full Day" ? "secondary" : "outline"}>{b.type}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        {b.type === "Time Range" ? `${b.startTime ?? ""} – ${b.endTime ?? ""}` : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => removeBlock(b.id)}>
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function AddTimeBlockDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (b: TimeBlock) => void;
}) {
  const [name, setName] = React.useState("");
  const [isFullDay, setIsFullDay] = React.useState(true);
  const [allBranch, setAllBranch] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [reason, setReason] = React.useState("");

  function reset() {
    setName("");
    setIsFullDay(true);
    setDate(new Date());
    setStartTime("");
    setEndTime("");
    setReason("");
    setAllBranch(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !name.trim()) return;
    const type: TimeBlock["type"] = isFullDay ? "Full Day" : "Time Range";
    if (!isFullDay && (!startTime || !endTime)) return;
    onCreate({ id: `tb-${Date.now()}`, name: name.trim(), date, type, startTime, endTime });
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Time Block</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Time Block Title</DialogTitle>
          <DialogDescription>Make a full day off or block a time range.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor="tb-name">Time Block Title</label>
              <Input id="tb-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor="tb-reason">Resone</label>
              <Input id="tb-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    {date ? date.toLocaleDateString() : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {!isFullDay && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="tb-start">Start time</label>
                  <Input id="tb-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="tb-end">End time</label>
                  <Input id="tb-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-8 pt-2">
              <label className="inline-flex items-center gap-3">
                <span className="text-sm">Full day</span>
                <Switch checked={isFullDay} onCheckedChange={setIsFullDay} />
              </label>
              <label className="inline-flex items-center gap-3">
                <span className="text-sm">All Branch</span>
                <Switch checked={allBranch} onCheckedChange={setAllBranch} />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatYmd(ymd: string) {
  const d = new Date(ymd);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString();
}


