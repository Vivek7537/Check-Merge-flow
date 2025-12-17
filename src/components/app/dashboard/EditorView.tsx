"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "../projects/ProjectCard";
import { Project, ProjectStatus } from "@/lib/types";

export default function EditorView() {
  const { user } = useAuth();
  const { projects } = useData();

  const editorProjects = projects.filter(p => p.editorId === user.name || p.editorId === null);

  const myActiveWork = editorProjects.filter(
    p =>
      p.editorId === user.name &&
      (p.status === "Assigned" || p.status === "In Progress" || p.status === "Pending by Customer")
  ).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const newProjects = editorProjects.filter(p => p.status === "New");

  const completedProjects = editorProjects.filter(
    p => p.editorId === user.name && p.status === "Done"
  ).sort((a,b) => new Date(b.completionDate!).getTime() - new Date(a.completionDate!).getTime());

  const allMyProjects = editorProjects.filter(p => p.editorId === user.name || p.status === 'New');

  const renderProjectList = (projectList: Project[], emptyMessage: string) => {
    if (projectList.length === 0) {
      return <p className="text-muted-foreground mt-4">{emptyMessage}</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {projectList.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="active">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="active">My Active Work ({myActiveWork.length})</TabsTrigger>
        <TabsTrigger value="new">New ({newProjects.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
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
  );
}
