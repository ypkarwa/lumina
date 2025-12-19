"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string) => Promise<boolean>;
  updateName: (name: string) => void;
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
    const mockUser = {
      id: "user-" + phoneNumber.replace(/\D/g, ''),
      phoneNumber,
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setUser(mockUser);
    localStorage.setItem("lumina_user", JSON.stringify(mockUser));
    setIsLoading(false);
    return true; 
  };

  const updateName = (name: string) => {
    if (user) {
      const updatedUser = { ...user, name };
      setUser(updatedUser);
      localStorage.setItem("lumina_user", JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lumina_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, updateName, logout, isAuthenticated: !!user, isLoading }}>
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
