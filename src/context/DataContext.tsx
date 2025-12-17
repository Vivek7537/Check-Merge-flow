"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project, Editor, ProjectStatus, ProjectCategory } from '@/lib/types';
import { initialProjects, initialEditors } from '@/lib/data';
import { calculateEditorRating } from '@/lib/utils';

interface DataContextType {
  projects: Project[];
  editors: Editor[];
  updateProject: (projectId: string, updatedData: Partial<Project>) => void;
  addProject: (newProject: Omit<Project, 'id'>) => void;
  getProjectById: (projectId: string) => Project | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);

  useEffect(() => {
    // Simulate loading data from localStorage to persist changes
    try {
      const storedProjects = localStorage.getItem('mergeflow_projects');
      const storedEditors = localStorage.getItem('mergeflow_editors');
      
      const projectsData = storedProjects ? JSON.parse(storedProjects).map((p: any) => ({
        ...p,
        deadline: new Date(p.deadline),
        assignDate: p.assignDate ? new Date(p.assignDate) : null,
        completionDate: p.completionDate ? new Date(p.completionDate) : null,
      })) : initialProjects;
      
      const editorsData = storedEditors ? JSON.parse(storedEditors) : initialEditors;

      setProjects(projectsData);
      setEditors(editorsData);
    } catch (e) {
      console.error("Could not load data from localStorage", e);
      setProjects(initialProjects);
      setEditors(initialEditors);
    }
  }, []);

  useEffect(() => {
    // Persist projects to localStorage
    if (projects.length > 0) {
      localStorage.setItem('mergeflow_projects', JSON.stringify(projects));
    }
  }, [projects]);


  useEffect(() => {
    // Recalculate editor ratings whenever projects change
    if (projects.length === 0 || editors.length === 0) return;
    
    const updatedEditors = editors.map(editor => {
      const editorProjects = projects.filter(p => p.editorId === editor.id);
      const newRating = calculateEditorRating(editorProjects);
      return { ...editor, rating: newRating };
    });
    setEditors(updatedEditors);
    localStorage.setItem('mergeflow_editors', JSON.stringify(updatedEditors));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);


  const updateProject = (projectId: string, updatedData: Partial<Project>) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? { ...project, ...updatedData } : project
      )
    );
  };

  const addProject = (newProjectData: Omit<Project, 'id'>) => {
    const newIdNumber = (projects[0] ? parseInt(projects[0].id.split('-')[1]) : 0) + 1;
    const newProject: Project = {
      ...newProjectData,
      id: `PROJ-${String(newIdNumber).padStart(3, '0')}`,
    };
    setProjects(prevProjects => [newProject, ...prevProjects].sort((a,b) => b.id.localeCompare(a.id)));
  };

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };


  return (
    <DataContext.Provider value={{ projects, editors, updateProject, addProject, getProjectById }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
