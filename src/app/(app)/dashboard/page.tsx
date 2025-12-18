
"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProjectsTable from "@/components/app/projects/ProjectsTable";
import { ProjectSheet } from "@/components/app/projects/ProjectSheet";
import { Button } from "@/components/ui/button";
import { PlusCircle, Grid, List, CheckCircle, Clock, AlertTriangle, Camera, User } from "lucide-react";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/app/projects/ProjectCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import StatsCards from "@/components/app/dashboard/StatsCards";
import { isDelayed } from "@/lib/utils";
import EditorPerformanceCharts from "@/components/app/dashboard/EditorPerformanceCharts";
import { differenceInDays, isFuture, formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, editors } = useData();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const loggedInEditor = editors.find(e => e.name === user.name);
  
  const getUniqueProjects = (projectList: Project[]) => {
    return Array.from(new Set(projectList.map(p => p.id)))
      .map(id => projectList.find(p => p.id === id)!);
  }

  const newProjects = getUniqueProjects(projects.filter(p => p.status === "New"));
  
  const otherProjects = getUniqueProjects(projects.filter(p => ['New', 'Assigned'].includes(p.status)));
  const allProjects = getUniqueProjects(projects);

  const teamLeaderStats = [
    { title: 'Total Projects', value: allProjects.length, icon: Grid },
    { title: 'In Progress', value: allProjects.filter(p => p.status === 'In Progress').length, icon: Clock },
    { title: 'Completed', value: allProjects.filter(p => p.status === 'Done').length, icon: CheckCircle },
    { title: 'Delayed', value: allProjects.filter(p => isDelayed(p) && p.status !== 'Done').length, icon: AlertTriangle },
  ];

  const myProjects = loggedInEditor ? allProjects.filter(p => p.editorId === loggedInEditor.id) : [];
  const myCompletedProjects = myProjects.filter(p => p.status === 'Done');
  const myDelayedProjects = myProjects.filter(p => isDelayed(p) && p.status !== 'Done');
  const totalPicturesEdited = myCompletedProjects.reduce((acc, p) => acc + (p.picturesEdited || 0), 0);
  
  const now = new Date();
  const urgentProjects = getUniqueProjects(allProjects.filter(p => 
      p.status !== 'Done' && 
      isFuture(p.deadline) &&
      differenceInDays(p.deadline, now) <= 3
  ));

  const recentlyAssignedProjects = getUniqueProjects(allProjects
    .filter(p => p.status === 'Assigned' && p.assignDate)
    .sort((a, b) => new Date(b.assignDate!).getTime() - new Date(a.assignDate!).getTime()));

  const editorStats = [
    { title: 'My Active Projects', value: myProjects.filter(p => ['In Progress', 'Assigned'].includes(p.status)).length, icon: Clock },
    { title: 'My Completed Projects', value: myCompletedProjects.length, icon: CheckCircle },
    { title: 'My Delayed Projects', value: myDelayedProjects.length, icon: AlertTriangle },
    { title: 'Total Pictures Edited', value: totalPicturesEdited, icon: Camera },
  ];


  const renderProjects = (projectList: Project[]) => {
    const uniqueProjects = getUniqueProjects(projectList);

    if (viewMode === 'table') {
        return <ProjectsTable projects={uniqueProjects} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {uniqueProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
        ))}
        </div>
    );
  };

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Urgent Projects</CardTitle>
                <CardDescription>Projects with a deadline in the next 3 days.</CardDescription>
              </CardHeader>
              <CardContent>
                 {urgentProjects.length > 0 ? (
                    <div className="space-y-2">
                      {urgentProjects.slice(0,5).map(project => (
                        <div key={project.id} className="flex items-center gap-3 text-sm">
                          <Image 
                            src={project.imageUrl} 
                            alt={project.name}
                            width={40}
                            height={30}
                            className="rounded-md object-cover h-[30px]"
                            data-ai-hint={project.imageHint}
                          />
                          <div className="flex-1 truncate">
                            <p className="font-medium truncate">{project.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Due in {differenceInDays(project.deadline, now)} days
                            </p>
                          </div>
                        </div>
                      ))}
                      {urgentProjects.length > 5 && (
                         <p className="text-xs text-muted-foreground pt-2">
                            + {urgentProjects.length - 5} more...
                         </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No projects are due in the next 3 days.</p>
                  )}
              </CardContent>
            </Card>
             <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Recently Assigned Projects</CardTitle>
                <CardDescription>Editors who recently took new projects.</CardDescription>
              </CardHeader>
              <CardContent>
                 {recentlyAssignedProjects.length > 0 ? (
                    <div className="space-y-3">
                      {recentlyAssignedProjects.slice(0,5).map(project => {
                        const editor = editors.find(e => e.id === project.editorId);
                        return (
                          <div key={project.id} className="flex items-start gap-3 text-sm">
                            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium">{editor?.name} took "{project.name}"</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(project.assignDate!), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      {recentlyAssignedProjects.length > 5 && (
                         <p className="text-xs text-muted-foreground pt-2">
                            + {recentlyAssignedProjects.length - 5} more...
                         </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No projects have been assigned recently.</p>
                  )}
              </CardContent>
            </Card>
            <div className="lg:col-span-1">
                <EditorPerformanceCharts />
            </div>
        </div>
      )}

      {user.role === 'Team Leader' && (
         <StatsCards stats={teamLeaderStats} />
      )}
       {user.role === 'Editor' && (
         <StatsCards stats={editorStats} />
      )}
       {user.role === 'Editor' && (
         <div className="lg:col-span-2">
            <EditorPerformanceCharts />
        </div>
      )}

      {user.role === 'Editor' && newProjects.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>New Available Projects</CardTitle>
                <CardDescription>Projects that are ready to be taken.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderProjects(newProjects)}
            </CardContent>
         </Card>
      )}

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>
              {user.role === 'Editor' ? "Other Projects" : "All Projects"}
            </CardTitle>
            <CardDescription>
              {user.role === 'Editor' ? "Projects that are new or assigned to other editors." : "Manage and track all ongoing and completed projects."}
            </CardDescription>
          </CardHeader>
          <CardContent>
             {renderProjects(user.role === 'Editor' ? otherProjects : allProjects)}
          </CardContent>
        </Card>
      </div>

      <ProjectSheet open={isSheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
