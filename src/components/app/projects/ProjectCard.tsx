"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { formatDistanceToNow } from 'date-fns';
import { Clock, Edit } from 'lucide-react';
import { ProjectSheet } from './ProjectSheet';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export default function ProjectCard({ project }: { project: Project }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuth();
  const { updateProject } = useData();

  const canEdit = user.role === 'Team Leader' || (user.role === 'Editor' && (project.editorId === user.name || project.status === 'New'));

  const handleTakeProject = () => {
    if (user.role === 'Editor' && project.status === 'New') {
      updateProject(project.id, { editorId: user.name, status: 'Assigned', assignDate: new Date() });
    }
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden h-full">
        <CardHeader className="p-0 relative">
          <Image
            src={project.imageUrl}
            alt={project.name}
            data-ai-hint={project.imageHint}
            width={600}
            height={400}
            className="w-full h-32 object-cover"
          />
           <div className="absolute top-2 right-2">
            <StatusBadge status={project.status} deadline={project.deadline} />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-base font-semibold mb-2 leading-tight truncate">{project.name}</CardTitle>
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Deadline: {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {project.status === 'New' && user.role === 'Editor' ? (
            <Button className="w-full" onClick={handleTakeProject}>Take Project</Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSheetOpen(true)}
              disabled={!canEdit}
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
