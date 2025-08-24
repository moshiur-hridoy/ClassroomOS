"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card";
import { Users, Shield, Settings, Building } from "lucide-react";

export default function SettingsPage() {
  const settingsItems = [
    {
      title: "Users & Roles",
      description: "Manage users and assign roles",
      icon: Users,
      href: "/settings/users-roles",
      color: "text-blue-600"
    },
    {
      title: "Permissions",
      description: "Configure role permissions",
      icon: Shield,
      href: "/settings/permissions",
      color: "text-green-600"
    },
    {
      title: "System Settings",
      description: "General system configuration",
      icon: Settings,
      href: "/settings/system",
      color: "text-purple-600"
    },
    {
      title: "Organization",
      description: "Manage organization details",
      icon: Building,
      href: "/settings/organization",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="flex h-full w-full flex-col">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your application settings and configurations</p>
      </div>
      
      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
