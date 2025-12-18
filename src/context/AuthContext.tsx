
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { initialEditors } from '@/lib/data';
import { Editor } from '@/lib/types';

const USER_PASS = "password123";

interface AuthContextType {
  user: User;
  editors: Editor[];
  login: (name: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ isAuthenticated: false, role: null, name: null });

  useEffect(() => {
    // Attempt to retrieve user from sessionStorage
    try {
      const storedUser = sessionStorage.getItem('mergeflow_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('mergeflow_user');
    }
  }, []);

  const login = (name: string, password: string): boolean => {
    // This is a simplified login. In a real app, you'd check against a database.
    if (password === USER_PASS && name) {
      const newUser = { isAuthenticated: true, role: 'Editor' as UserRole, name };
      setUser(newUser);
      sessionStorage.setItem('mergeflow_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    const loggedOutUser = { isAuthenticated: false, role: null, name: null };
    setUser(loggedOutUser);
    sessionStorage.removeItem('mergeflow_user');
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
