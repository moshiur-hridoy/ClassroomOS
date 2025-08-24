"use client";

import * as React from "react";
import { Plus, Pencil } from "lucide-react";

import Link from "next/link";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Separator } from "@/registry/new-york-v4/ui/separator";
import { Badge } from "@/registry/new-york-v4/ui/badge";

// In a future iteration, role will come from auth. For now, default to Admin.

type BranchRoom = {
  roomName: string;
  capacity: number;
};

type Branch = {
  id: string;
  name: string;
  internalName: string; // unique
  location: string;
  rooms: BranchRoom[];
  branchManagerUserId: string;
  status: "Active" | "Inactive";
};

const demoBranches: Branch[] = [
  {
    id: "b1",
    name: "Uttara Center",
    internalName: "U1",
    location: "House 12, Road 3, Uttara, Dhaka",
    rooms: [
      { roomName: "Room A", capacity: 30 },
      { roomName: "Room B", capacity: 24 },
    ],
    branchManagerUserId: "mgr-01",
    status: "Active",
  },
  {
    id: "b2",
    name: "Mirpur Center",
    internalName: "M1",
    location: "Plot 5, Section 10, Mirpur, Dhaka",
    rooms: [{ roomName: "Room 1", capacity: 20 }],
    branchManagerUserId: "mgr-02",
    status: "Inactive",
  },
];

export default function BranchesPage() {
  const [currentUserId] = React.useState("mgr-01");
  const [branches] = React.useState<Branch[]>(demoBranches);

  const isAdmin = true;
  const isManager = false;
  const isStockholder = false;

  function canEditBranch(branch: Branch) {
    if (isAdmin) return true;
    if (isManager) return branch.branchManagerUserId === currentUserId;
    return false;
  }





  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 px-4 py-4">
        <h1 className="text-xl font-semibold">Branches</h1>
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Button asChild>
              <Link href="/branches/new">
                <Plus className="mr-1 size-4" /> Add Branch
              </Link>
            </Button>
          )}
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
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Rooms</th>
                <th className="px-3 py-2">Manager</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-2">{b.name}</td>
                  <td className="px-3 py-2 font-mono">{b.internalName}</td>
                  <td className="px-3 py-2">{b.location}</td>
                  <td className="px-3 py-2">{b.rooms.length}</td>
                  <td className="px-3 py-2">{b.branchManagerUserId}</td>
                  <td className="px-3 py-2">
                    <Badge variant={b.status === "Active" ? "success" : "destructive"}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={!canEditBranch(b)}
                        aria-label="Edit branch"
                      >
                        <Link href={`/branches/${b.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
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


