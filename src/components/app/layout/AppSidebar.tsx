"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, FileText, Users, Settings, PanelLeft } from "lucide-react";
import Logo from "@/components/app/shared/Logo";

const teamLeaderNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/reports", icon: FileText, label: "Reports" },
];

const editorNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const navItems = user.role === "Team Leader" ? teamLeaderNav : editorNav;

  return (
    <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <Logo />
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                    >
                    <a>
                        <item.icon />
                        <span>{item.label}</span>
                    </a>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{ children: 'Toggle Sidebar' }} className="group-data-[collapsible=icon]:justify-center">
                        <PanelLeft />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
