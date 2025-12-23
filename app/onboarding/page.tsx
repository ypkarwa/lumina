"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const { updateName, user } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateName(name);
      router.push("/"); // Redirect to main dashboard
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto bg-green-100 p-4 rounded-full w-fit">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Just one thing.</CardTitle>
          <CardDescription className="text-lg">
            What should we call you?
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Your Name (or Nickname)</Label>
              <Input 
                id="name" 
                placeholder="e.g. Jordan" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg h-12"
                required
                autoFocus
              />
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 text-sm text-slate-600 space-y-3">
              <p className="font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Our Privacy Promise
              </p>
              <p>
                We do not sell your data. We do not track your activity for ads. 
                Everything here is transparent and built solely for the purpose of personal growth and connection.
              </p>
              <p>
                TereStats is a tool, not a trap.
              </p>
            </div>

            <Button type="submit" className="w-full h-12 text-lg">
              Start Growing <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

