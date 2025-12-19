"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Search, PlusCircle } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Hide nav on auth pages
  if (pathname === '/login' || pathname === '/onboarding') {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-4 z-50">
      <Link 
        href="/" 
        className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <PlusCircle className="w-6 h-6" />
        <span className="text-xs font-medium">Send</span>
      </Link>
      
      <Link 
        href="/search" 
        className={`flex flex-col items-center gap-1 ${isActive('/search') ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <Search className="w-6 h-6" />
        <span className="text-xs font-medium">Explore</span>
      </Link>
      
      <Link 
        href="/profile" 
        className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <User className="w-6 h-6" />
        <span className="text-xs font-medium">Profile</span>
      </Link>
    </div>
  );
}
