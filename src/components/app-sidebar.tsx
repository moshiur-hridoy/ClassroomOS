"use client"

import * as React from "react"
import {
  Building2,
  AlarmClockOff,
  ChartBar,
  ClipboardList,
  GraduationCap,
  Layers3,
  LogOut,
  Settings2,
  Users2,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/registry/new-york-v4/ui/avatar"
import { Button } from "@/registry/new-york-v4/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/new-york-v4/ui/dropdown-menu"
import { Separator } from "@/registry/new-york-v4/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/registry/new-york-v4/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
}

const NAV_MAIN: NavItem[] = [
  { title: "Dashboard", href: "/", icon: ChartBar },
  { title: "Branches", href: "/branches", icon: Building2 },
  { title: "Batches", href: "/batches", icon: Layers3 },
  { title: "Time blocks", href: "/holidays", icon: AlarmClockOff },
  { title: "Attendance", href: "/attendance", icon: ClipboardList },
  { title: "Students", href: "/students", icon: GraduationCap },
]

const NAV_SECONDARY: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings2 },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-sm text-xs font-bold">
            CO
          </div>
          <div className="text-sm font-semibold">ClassroomOS</div>
        </div>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_MAIN.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_SECONDARY.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserFooter name={user?.name ?? "Guest"} email={user?.email ?? "not signed in"} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function UserFooter({ name, email }: { name: string; email: string }) {
  const { logout } = useAuth()
  const router = useRouter()
  return (
    <div className="flex items-center justify-between gap-2 rounded-md p-2">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-muted-foreground text-xs">{email}</div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Account actions">
            <LogOut className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <a href="/settings">Settings</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => { logout(); router.push("/login") }}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


