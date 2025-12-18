"use client";

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project, ProjectStatus, ProjectStatuses } from "@/lib/types";
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit } from 'lucide-react';
import { ProjectSheet } from './ProjectSheet';
import { useData } from '@/context/DataContext';

export default function ProjectsTable({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project | 'editorName'; direction: 'ascending' | 'descending' } | null>({ key: 'deadline', direction: 'ascending' });
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { editors } = useData();

  const handleSort = (key: keyof Project | 'editorName') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getEditorName = (editorId: string | null) => {
    if (!editorId) return 'N/A';
    return editors.find(e => e.id === editorId)?.name || 'Unknown';
  }

  const sortedAndFilteredProjects = useMemo(() => {
    // Remove duplicates
    const uniqueProjects = projects.filter((project, index, self) =>
        index === self.findIndex((p) => (
            p.id === project.id
        ))
    );

    let filtered = uniqueProjects.filter(project =>
      project.name.toLowerCase().includes(filter.toLowerCase()) ||
      project.id.toLowerCase().includes(filter.toLowerCase()) ||
      getEditorName(project.editorId).toLowerCase().includes(filter.toLowerCase())
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = sortConfig.key === 'editorName' ? getEditorName(a.editorId) : a[sortConfig.key];
        const bValue = sortConfig.key === 'editorName' ? getEditorName(b.editorId) : b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [projects, filter, statusFilter, sortConfig, editors]);

  const renderSortArrow = (key: keyof Project | 'editorName') => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="h-4 w-4 opacity-30" />;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search by ID, name, editor..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select onValueChange={(value) => setStatusFilter(value as any)} defaultValue="all">
          <SelectTrigger className='w-full sm:w-[180px]'>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ProjectStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('id')} className="cursor-pointer">
                ID {renderSortArrow('id')}
              </TableHead>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                Project Name {renderSortArrow('name')}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead onClick={() => handleSort('editorName')} className="cursor-pointer">
                Editor {renderSortArrow('editorName')}
              </TableHead>
              <TableHead onClick={() => handleSort('deadline')} className="cursor-pointer">
                Deadline {renderSortArrow('deadline')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredProjects.map(project => (
              <TableRow key={project.id}>
                <TableCell className="font-mono text-xs">{project.id}</TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <StatusBadge status={project.status} deadline={project.deadline} />
                </TableCell>
                <TableCell>{getEditorName(project.editorId)}</TableCell>
                <TableCell>{format(new Date(project.deadline), 'PP')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditingProject(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editingProject && (
        <ProjectSheet open={!!editingProject} onOpenChange={(isOpen) => !isOpen && setEditingProject(null)} project={editingProject} />
      )}
    </div>
  );
}
