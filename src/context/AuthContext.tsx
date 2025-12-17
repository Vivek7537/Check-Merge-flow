"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { initialEditors } from '@/lib/data';
import { Editor } from '@/lib/types';

const TEAM_LEADER_PASS = "MERGE999";
const EDITOR_PASS = "MERGE925";

interface AuthContextType {
  user: User;
  editors: Editor[];
  login: (role: UserRole, password: string, name?: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ isAuthenticated: false, role: null, name: null });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mergeflow_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('mergeflow_user');
    }
  }, []);

  const login = (role: UserRole, password: string, name?: string): boolean => {
    if (role === 'Team Leader' && password === TEAM_LEADER_PASS) {
      const newUser = { isAuthenticated: true, role: 'Team Leader', name: 'Team Leader' };
      setUser(newUser);
      localStorage.setItem('mergeflow_user', JSON.stringify(newUser));
      return true;
    }
    if (role === 'Editor' && password === EDITOR_PASS && name) {
      const editorExists = initialEditors.some(editor => editor.name === name);
      if (editorExists) {
        const newUser = { isAuthenticated: true, role: 'Editor', name };
        setUser(newUser);
        localStorage.setItem('mergeflow_user', JSON.stringify(newUser));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    const loggedOutUser = { isAuthenticated: false, role: null, name: null };
    setUser(loggedOutUser);
    localStorage.removeItem('mergeflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, editors: initialEditors, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
