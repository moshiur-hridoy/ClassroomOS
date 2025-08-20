"use client";

import * as React from "react";
import { Shield, UserCircle2, LineChart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Separator } from "@/registry/new-york-v4/ui/separator";

export default function LoginPage() {
  const { loginAs } = useAuth();
  const router = useRouter();

  function quick(role: "admin" | "manager" | "stockholder") {
    loginAs(role);
    router.push("/");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo only: default to admin
    quick("admin");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-md flex-col items-stretch justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full border">
          <span className="text-primary">🎓</span>
        </div>
        <h1 className="text-3xl font-bold">ClassroomOS</h1>
        <p className="text-muted-foreground mt-2">Sign in to access the dashboard with sidebar navigation</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Email</label>
          <Input placeholder="Enter your email" type="email" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Password</label>
          <Input placeholder="Enter your password" type="password" />
        </div>
        <Button type="submit" className="h-11 text-base">Sign in</Button>
      </form>

      <div className="text-center">
        <h2 className="text-lg font-semibold">Quick Demo Access</h2>
        <p className="text-muted-foreground mt-1">Click any button below to instantly log in and see the sidebar</p>
      </div>

      <div className="grid gap-2">
        <Button variant="outline" className="justify-start" onClick={() => quick("admin")}> 
          <Shield className="mr-2 size-4" /> Admin - Full Access
        </Button>
        <Button variant="outline" className="justify-start" onClick={() => quick("manager")}>
          <UserCircle2 className="mr-2 size-4" /> Branch Manager - Limited Access
        </Button>
        <Button variant="outline" className="justify-start" onClick={() => quick("stockholder")}>
          <LineChart className="mr-2 size-4" /> Stockholder - Read Only
        </Button>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <div className="font-medium mb-2">Manual Login Credentials:</div>
        <div>admin@classroomos.com / admin123</div>
        <div>sarah@classroomos.com / manager123</div>
        <div>mike@classroomos.com / stockholder123</div>
      </div>
    </div>
  );
}


