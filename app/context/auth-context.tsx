"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUserAction, updateUserNameAction, completeTourAction } from "@/app/actions";

interface User {
  id: string;
  phoneNumber: string;
  name?: string | null;
  tourCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string) => Promise<User | null>;
  updateName: (name: string) => Promise<void>;
  completeTour: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user from local storage on mount
    const storedUser = localStorage.getItem("lumina_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phoneNumber: string) => {
    setIsLoading(true);
    
    try {
      // Call Server Action
      const dbUser = await loginUserAction(phoneNumber);
      
      if (dbUser) {
        setUser(dbUser);
        localStorage.setItem("lumina_user", JSON.stringify(dbUser));
        setIsLoading(false);
        return dbUser;
      }
      return null;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return null;
    }
  };

  const updateName = async (name: string) => {
    if (user) {
      try {
        const updatedUser = await updateUserNameAction(user.id, name);
        setUser(updatedUser);
        localStorage.setItem("lumina_user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Failed to update name:", error);
      }
    }
  };

  const completeTour = async () => {
    if (user) {
      try {
        await completeTourAction(user.id);
        const updatedUser = { ...user, tourCompleted: true };
        setUser(updatedUser);
        localStorage.setItem("lumina_user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Failed to complete tour:", error);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lumina_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, updateName, completeTour, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
