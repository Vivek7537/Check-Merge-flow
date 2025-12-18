
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { LayoutDashboard, Users, PanelLeft } from "lucide-react";
import Logo from "@/components/app/shared/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "../shared/StarRating";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

export default function AppSidebar() {
  const { user } = useAuth();
  const { editors } = useData();
  const pathname = usePathname();

  return (
    <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <Logo />
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
            
            <SidebarSeparator className="my-2" />

             <div className="px-2 group-data-[collapsible=icon]:hidden">
                <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Editor Ratings
                </h3>
                <div className="space-y-3">
                    {editors.map((editor) => (
                    <div key={editor.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={`https://api.dicebear.com/8.x/initials/svg?seed=${editor.name}`}
                            alt={editor.name}
                        />
                        <AvatarFallback>
                            {getInitials(editor.name)}
                        </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-medium leading-tight">{editor.name}</p>
                            <StarRating rating={editor.rating} />
                        </div>
                    </div>
                    ))}
                </div>
            </div>

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
