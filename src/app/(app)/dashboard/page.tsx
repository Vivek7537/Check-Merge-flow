"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import StatsCards from "@/components/app/dashboard/StatsCards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/components/app/shared/StarRating";
import ProjectsTable from "@/components/app/projects/ProjectsTable";
import { ProjectSheet } from "@/components/app/projects/ProjectSheet";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { isDelayed } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, editors } = useData();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const totalProjects = projects.length;
  const pendingProjects = projects.filter(
    (p) => p.status !== "Done" && p.status !== "Pending by Customer"
  ).length;
  const completedProjects = projects.filter((p) => p.status === "Done").length;
  const delayedProjects = projects.filter(
    (p) => p.status !== "Done" && isDelayed(p)
  ).length;

  const stats = [
    { title: "Total Projects", value: totalProjects },
    { title: "Pending Projects", value: pendingProjects },
    { title: "Completed Projects", value: completedProjects },
    { title: "Delayed Projects", value: delayedProjects },
  ];

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's what's happening.
        </p>
      </header>
      <StatsCards stats={stats} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Editor Performance</CardTitle>
            <CardDescription>Live ratings based on performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Editor</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editors.map((editor) => (
                  <TableRow key={editor.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/8.x/initials/svg?seed=${editor.name}`}
                          alt={editor.name}
                        />
                        <AvatarFallback>{getInitials(editor.name)}</AvatarFallback>
                      </Avatar>
                      {editor.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <StarRating rating={editor.rating} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>
                Manage and track all ongoing and completed projects.
              </CardDescription>
            </div>
            {user.role === 'Team Leader' && (
              <Button size="sm" onClick={() => setSheetOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ProjectsTable projects={projects} />
          </CardContent>
        </Card>
      </div>
      <ProjectSheet open={isSheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
