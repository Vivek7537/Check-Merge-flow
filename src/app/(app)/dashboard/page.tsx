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
import { PlusCircle } from "lucide-react";
import ProjectCard from "@/components/app/projects/ProjectCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, editors } = useData();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const myProjects =
    user.role === "Editor"
      ? projects.filter((p) => p.editorId === user.name)
      : [];
  const newProjects = projects.filter((p) => p.status === "New");
  const otherProjects =
    user.role === "Editor"
      ? projects.filter((p) => p.editorId !== user.name && p.status !== "New")
      : projects;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Here's what's happening.
          </p>
        </div>
        {user.role === "Team Leader" && (
          <Button onClick={() => setSheetOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </header>
      
      {user.role === "Editor" && (
        <>
          {newProjects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">
                New Available Projects
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {newProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
          {myProjects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold font-headline mt-8 mb-4">
                My Active Projects
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {user.role === 'Editor' ? "Other Projects" : "All Projects"}
              </captionTitle>
              <CardDescription>
                {user.role === 'Editor' ? "Projects assigned to other editors." : "Manage and track all ongoing and completed projects."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ProjectsTable
              projects={user.role === "Editor" ? otherProjects : projects}
            />
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
