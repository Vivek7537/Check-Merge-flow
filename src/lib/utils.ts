import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Project, ProjectStatus } from "./types";
import { differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateEditorRating(projects: Project[]): number {
  if (!projects || projects.length === 0) {
    return 1;
  }

  const completedProjects = projects.filter(p => p.status === 'Done');
  if (completedProjects.length === 0) {
    return 1;
  }

  let rating = 5.0;

  const delayedProjects = completedProjects.filter(p => p.completionDate && p.deadline && p.completionDate > p.deadline).length;
  const onTimeProjects = completedProjects.length - delayedProjects;

  // Penalty for delayed projects
  rating -= delayedProjects * 0.5;

  // Bonus for on-time projects
  rating += Math.floor(onTimeProjects / 10) * 0.25;

  if (rating < 1) return 1;
  if (rating > 5) return 5;
  
  return parseFloat(rating.toFixed(2));
}

export function getDisplayStatus(project: Project): ProjectStatus | 'Delayed' {
  if (project.status !== 'Done' && isDelayed(project)) {
    return 'Delayed';
  }
  return project.status;
}

export function getStatusColor(status: ProjectStatus, deadline?: Date | string): string {
  const now = new Date();
  
  if (status !== 'Done' && deadline && differenceInDays(now, new Date(deadline)) > 0) {
      return 'text-red-500 bg-red-500/10 border-red-500/20';
  }

  switch (status) {
    case 'New':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'Assigned':
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    case 'In Progress':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'Done':
      return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'Pending by Customer':
      return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
}

export function isDelayed(project: Project): boolean {
  const now = new Date();
  if (project.status === 'Done') {
    // A completed project is considered 'delayed' if it was finished after its deadline
    return project.completionDate! > project.deadline;
  }
  // An active project is delayed if the current date is past its deadline
  return now > project.deadline;
}
