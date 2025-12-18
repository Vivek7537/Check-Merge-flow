
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project, Editor } from '@/lib/types';
import { initialProjects, initialEditors } from '@/lib/data';
import { calculateEditorRating } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DataContextType {
  projects: Project[];
  editors: Editor[];
  updateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id'>>) => void;
  addProject: (newProject: Omit<Project, 'id'>) => void;
  deleteProject: (projectId: string) => void;
  getProjectById: (projectId: string) => Project | undefined;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const PROJECTS_KEY = 'mergeflow_projects';
const IMAGES_KEY = 'mergeflow_images';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editors, setEditors] = useState<Editor[]>(initialEditors);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedProjectsJSON = localStorage.getItem(PROJECTS_KEY);
      const storedImagesJSON = sessionStorage.getItem(IMAGES_KEY);

      let projectsToLoad: Project[] = initialProjects;

      if (storedProjectsJSON) {
        const storedProjects = JSON.parse(storedProjectsJSON);
        const storedImages = storedImagesJSON ? JSON.parse(storedImagesJSON) : {};

        projectsToLoad = storedProjects.map((p: any) => ({
            ...p,
            imageUrl: storedImages[p.id] || p.imageUrl,
            deadline: new Date(p.deadline),
            creationDate: new Date(p.creationDate),
            assignDate: p.assignDate ? new Date(p.assignDate) : null,
            completionDate: p.completionDate ? new Date(p.completionDate) : null,
        }));
      }
      setProjects(projectsToLoad);
    } catch (error) {
        console.error("Failed to parse projects from storage, using initial data.", error);
        setProjects(initialProjects);
    }
  }, []);

  useEffect(() => {
    // Persist projects to localStorage, but without imageUrl
    if (projects.length > 0) {
      try {
        const projectsForStorage = projects.map(({ imageUrl, ...rest }) => rest);
        const imageCache = projects.reduce((acc, p) => {
          if (p.imageUrl && p.imageUrl.startsWith('data:')) {
            acc[p.id] = p.imageUrl;
          }
          return acc;
        }, {} as Record<string, string>);
        
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projectsForStorage));
        sessionStorage.setItem(IMAGES_KEY, JSON.stringify(imageCache));

      } catch (error) {
        console.error("Failed to save projects to storage", error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
             toast({
                variant: "destructive",
                title: "Storage Full",
                description: "Could not save all image data. Please clear some projects or upload smaller images.",
            });
        }
      }
    }
  }, [projects, toast]);


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


  const updateProject = (projectId: string, updatedData: Partial<Omit<Project, 'id'>>) => {
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
  
  const resetData = () => {
    localStorage.removeItem(PROJECTS_KEY);
    sessionStorage.removeItem(IMAGES_KEY);
    setProjects(initialProjects);
    toast({ title: "Data Reset", description: "All project data has been reset to the initial state." });
  };


  return (
    <DataContext.Provider value={{ projects, editors, updateProject, addProject, deleteProject, getProjectById, resetData }}>
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
