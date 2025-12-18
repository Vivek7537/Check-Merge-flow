
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
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
import { PlusCircle, Grid, List } from "lucide-react";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/app/projects/ProjectCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import StatsCards from "@/components/app/dashboard/StatsCards";
import { isDelayed } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, editors } = useData();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const myProjects = projects.filter(p => p.editorId === user.name);
  const newProjects = projects.filter(p => p.status === "New");
  const otherProjects = projects.filter(p => p.editorId && p.editorId !== user.name);

  const stats = [
    { title: 'Total Projects', value: projects.length, icon: Grid },
    { title: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length, icon: List },
    { title: 'Completed', value: projects.filter(p => p.status === 'Done').length, icon: PlusCircle },
    { title: 'Delayed', value: projects.filter(isDelayed).length, icon: Grid },
  ]

  const renderProjects = (projectList: Project[], title: string) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projectList.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Here's what's happening.
          </p>
        </div>
        <div className="flex items-center gap-2">
            {user.role === 'Team Leader' && (
                <Button onClick={() => setSheetOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            )}
             <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as any)} aria-label="View mode">
                <ToggleGroupItem value="card" aria-label="Card view">
                    <Grid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Table view">
                    <List className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
      </header>

      {user.role === 'Team Leader' && (
         <StatsCards stats={stats} />
      )}

      {user.role === 'Editor' && newProjects.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>New Available Projects</CardTitle>
                <CardDescription>Projects that are ready to be taken.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderProjects(newProjects, 'New Available Projects')}
            </CardContent>
         </Card>
      )}

      {user.role === 'Editor' && myProjects.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>My Active Projects</CardTitle>
                <CardDescription>Projects assigned to you.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderProjects(myProjects, 'My Active Projects')}
            </CardContent>
         </Card>
      )}

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {user.role === 'Editor' ? "Other Projects" : "All Projects"}
              </CardTitle>
              <CardDescription>
                {user.role === 'Editor' ? "Projects assigned to other editors." : "Manage and track all ongoing and completed projects."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ProjectsTable projects={user.role === 'Editor' ? otherProjects : projects} />
          </CardContent>
        </Card>
      </div>

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
                        <AvatarFallback>
                          {getInitials(editor.name)}
                        </AvatarFallback>
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
      </div>
      <ProjectSheet open={isSheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
