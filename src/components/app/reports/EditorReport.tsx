"use client";

import { useData } from '@/context/DataContext';
import { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { isDelayed } from '@/lib/utils';
import StatusBadge from '../projects/StatusBadge';
import { CheckCircle, Clock, Image as ImageIcon, Briefcase } from 'lucide-react';
import { useMemo } from 'react';

type EditorReportProps = {
  editorId: string;
  month: number;
  year: number;
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EditorReport({ editorId, month, year }: EditorReportProps) {
  const { projects, editors } = useData();
  const editor = editors.find(e => e.id === editorId);

  const relevantProjects = useMemo(() => {
    return projects.filter(p => {
      const projectDate = p.completionDate || p.assignDate;
      return p.editorId === editorId &&
             projectDate &&
             projectDate.getMonth() === month &&
             projectDate.getFullYear() === year;
    });
  }, [projects, editorId, month, year]);

  if (!editor) {
    return <Card><CardContent><p className="p-4">Editor not found.</p></CardContent></Card>;
  }
  
  const completedProjects = relevantProjects.filter(p => p.status === 'Done');
  const delayedProjects = completedProjects.filter(isDelayed).length;
  const onTimeProjects = completedProjects.length - delayedProjects;
  const totalPicturesEdited = completedProjects.reduce((acc, p) => acc + (p.picturesEdited || 0), 0);

  const stats = [
    { title: "Total Pictures Edited", value: totalPicturesEdited.toLocaleString(), icon: ImageIcon },
    { title: "Total Completed Projects", value: completedProjects.length, icon: Briefcase },
    { title: "Projects Completed On Time", value: onTimeProjects, icon: CheckCircle },
    { title: "Delayed Projects", value: delayedProjects, icon: Clock },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editor.name}'s Report</CardTitle>
        <CardDescription>Performance for {months[month]} {year}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Projects in this period</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Completed On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relevantProjects.length > 0 ? relevantProjects.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><StatusBadge status={p.status} deadline={p.deadline}/></TableCell>
                    <TableCell>{format(new Date(p.deadline), 'PP')}</TableCell>
                    <TableCell>{p.completionDate ? format(new Date(p.completionDate), 'PP') : 'N/A'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No projects found for this period.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
