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
  deleteProject: (projectId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editors, setEditors] = useState<Editor[]>(initialEditors);

  useEffect(() => {
    // Recalculate editor ratings whenever projects change
    if (projects.length === 0) {
        setEditors(initialEditors.map(e => ({...e, rating: 1})));
        return;
    };
    
    const updatedEditors = initialEditors.map(editor => {
      const editorProjects = projects.filter(p => p.editorId === editor.id);
      const newRating = calculateEditorRating(editorProjects);
      return { ...editor, rating: newRating };
    });
    setEditors(updatedEditors);
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

  const deleteProject = (projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
  }

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };


  return (
    <DataContext.Provider value={{ projects, editors, updateProject, addProject, deleteProject, getProjectById }}>
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
