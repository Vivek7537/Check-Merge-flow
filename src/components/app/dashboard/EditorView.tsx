"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "../projects/ProjectCard";
import { Project, ProjectStatus } from "@/lib/types";
import StatsCards from "./StatsCards";
import { isDelayed } from "@/lib/utils";
import { Briefcase, CheckCircle, Clock, AlertTriangle, PlusCircle } from 'lucide-react';
import { ProjectSheet } from "../projects/ProjectSheet";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function EditorView() {
  const { user } = useAuth();
  const { projects } = useData();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const myProjects = projects.filter(p => p.editorId === user.name);

  const myActiveWork = myProjects.filter(
    p =>
      (p.status === "Assigned" || p.status === "In Progress" || p.status === "Pending by Customer")
  ).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const newProjects = projects.filter(p => p.status === "New");

  const completedProjects = myProjects.filter(
    p => p.status === "Done"
  ).sort((a,b) => new Date(b.completionDate!).getTime() - new Date(a.completionDate!).getTime());

  const allMyProjects = projects.filter(p => p.editorId === user.name || p.status === 'New');

  const delayedProjects = myActiveWork.filter(isDelayed).length;
  
  const stats = [
    { title: "Active Projects", value: myActiveWork.length, icon: Briefcase },
    { title: "Projects to Take", value: newProjects.length, icon: Clock },
    { title: "Completed This Month", value: completedProjects.filter(p => p.completionDate && p.completionDate.getMonth() === new Date().getMonth()).length, icon: CheckCircle },
    { title: "Delayed Projects", value: delayedProjects, icon: AlertTriangle },
  ];

  const renderProjectList = (projectList: Project[], emptyMessage: string) => {
    if (projectList.length === 0) {
      return <p className="text-muted-foreground mt-4 text-center">{emptyMessage}</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        {projectList.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1"></div>
        {user.role === 'Team Leader' && (
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4"/>
              Add Project
            </Button>
        )}
      </div>

      <StatsCards stats={stats} />
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="active">My Active Work ({myActiveWork.length})</TabsTrigger>
          <TabsTrigger value="new">New Projects ({newProjects.length})</TabsTrigger>
          <TabsTrigger value="completed">My Completed ({completedProjects.length})</TabsTrigger>
          <TabsTrigger value="all">All My Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderProjectList(myActiveWork, "No active projects. Check the 'New' tab to pick up work!")}
        </TabsContent>
        <TabsContent value="new">
          {renderProjectList(newProjects, "No new projects available at the moment.")}
        </TabsContent>
        <TabsContent value="completed">
          {renderProjectList(completedProjects, "You haven't completed any projects yet.")}
        </TabsContent>
        <TabsContent value="all">
          {renderProjectList(allMyProjects, "No projects found.")}
        </TabsContent>
      </Tabs>
      <ProjectSheet open={isSheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
