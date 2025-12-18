
"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Project } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "@/components/app/projects/ProjectCard";
import { isDelayed } from "@/lib/utils";

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { projects, editors } = useData();

  const loggedInEditor = editors.find(e => e.name === user.name);
  const myProjects = loggedInEditor ? projects.filter(p => p.editorId === loggedInEditor.id) : [];

  const activeProjects = myProjects.filter(p => ['In Progress', 'Assigned'].includes(p.status) && !isDelayed(p));
  const completedProjects = myProjects.filter(p => p.status === 'Done');
  const delayedProjects = myProjects.filter(p => isDelayed(p) && p.status !== 'Done');

  const renderProjectGrid = (projectList: Project[], emptyMessage: string) => {
    if (projectList.length === 0) {
      return <p className="text-muted-foreground text-center py-10">{emptyMessage}</p>
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projectList.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          My Projects
        </h1>
        <p className="text-muted-foreground">
          All projects assigned to you.
        </p>
      </header>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="delayed">Delayed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          {renderProjectGrid(activeProjects, "You have no active projects.")}
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          {renderProjectGrid(completedProjects, "You haven't completed any projects yet.")}
        </TabsContent>
        <TabsContent value="delayed" className="mt-6">
          {renderProjectGrid(delayedProjects, "No delayed projects. Great work!")}
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          {renderProjectGrid(myProjects, "You have not been assigned any projects yet.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
