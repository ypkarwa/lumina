"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Loader2 } from "lucide-react";

export default function WelcomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Auto-redirect to Send tab after 2.5 seconds
    if (!isLoading && isAuthenticated) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          Welcome, <span className="text-indigo-600">{user?.name || "Friend"}</span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-slate-400 mt-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Taking you to your dashboard...</span>
        </div>
      </div>
    </main>
  );
}

