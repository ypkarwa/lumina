"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, we would validate and maybe search by name too
    // For now, assume query is phone and go to profile
    if (query.length > 3) {
      // Clean query
      const phone = query.trim();
      router.push(`/user/${phone}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto pt-20 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Find a Wall of Growth</h1>
          <p className="text-slate-500">
            See how others are evolving and support their journey.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search by Phone Number..." 
              className="pl-10 h-12 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-12 px-6">Go</Button>
        </form>

        {/* Recent/Featured Walls (Mock) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recently Active</h3>
          
          <Card 
            className="cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => router.push('/user/555-0123')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Alex M.</p>
                <p className="text-sm text-slate-500">Last active 2m ago • 12 Public Signals</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => router.push('/user/555-0987')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Sarah J.</p>
                <p className="text-sm text-slate-500">Last active 1h ago • 5 Public Signals</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

