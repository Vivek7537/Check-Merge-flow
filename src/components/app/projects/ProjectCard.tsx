"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { formatDistanceToNow } from 'date-fns';
import { Clock, Edit, Folder, Tag, User as UserIcon } from 'lucide-react';
import { ProjectSheet } from './ProjectSheet';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

export default function ProjectCard({ project }: { project: Project }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuth();
  const { updateProject, editors } = useData();

  const canEdit = user.role === 'Team Leader' || (user.role === 'Editor' && (project.editorId === user.name || project.status === 'New'));
  const editor = editors.find(e => e.id === project.editorId);
  const isMyProject = project.editorId === user.name;

  const handleTakeProject = () => {
    if (user.role === 'Editor' && project.status === 'New') {
      updateProject(project.id, { editorId: user.name, status: 'Assigned', assignDate: new Date() });
    }
  }

  return (
    <>
      <Card className={cn(
        "flex flex-col overflow-hidden h-full group transition-all hover:shadow-lg hover:-translate-y-1 duration-200",
        isMyProject && user.role === 'Editor' && "border-primary"
      )}>
        <CardHeader className="p-0 relative">
          <Image
            src={project.imageUrl}
            alt={project.name}
            data-ai-hint={project.imageHint}
            width={600}
            height={400}
            className="w-full h-40 object-cover"
          />
           <div className="absolute top-3 right-3">
            <StatusBadge status={project.status} deadline={project.deadline} />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow space-y-2">
          <CardTitle className="text-base font-semibold mb-1 leading-tight truncate" title={project.name}>{project.name}</CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5" title={`Deadline: ${new Date(project.deadline).toLocaleDateString()}`}>
            <Clock className="h-3 w-3" />
            <span>Deadline in {formatDistanceToNow(new Date(project.deadline), { addSuffix: false })}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Folder className="h-3 w-3" />
            <span>{project.category}</span>
          </div>
           {editor && (
             <div className="text-xs text-muted-foreground flex items-center gap-1.5">
               <UserIcon className="h-3 w-3" />
               <span>{editor.name}</span>
             </div>
           )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {project.status === 'New' && user.role === 'Editor' ? (
            <Button className="w-full" onClick={handleTakeProject}>Take Project</Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSheetOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {canEdit ? 'Open Project' : 'View Details'}
            </Button>
          )}
        </CardFooter>
      </Card>
      {isSheetOpen && (
        <ProjectSheet
          open={isSheetOpen}
          onOpenChange={setSheetOpen}
          project={project}
        />
      )}
    </>
  );
}
