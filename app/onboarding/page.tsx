"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState<"INTENT" | "NAME">("INTENT");
  const [name, setName] = useState("");
  const { updateName } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateName(name);
      router.push("/");
    }
  };

  // Step 1: Show TereStats Intent/Purpose
  if (step === "INTENT") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Logo/Brand */}
          <div className="flex justify-center mb-6">
            <div className="bg-amber-500/20 p-4 rounded-full">
              <Sparkles className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          {/* Main Heading - Hindi Quote */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white leading-tight">
            "Duniya chunotiyo se nahi,<br />
            <span className="text-amber-400">chutiyo</span> se pareshaan hai."
          </h1>

          {/* Translation */}
          <p className="text-lg md:text-xl text-slate-400 text-center italic">
            Translation: The world isn't troubled by its problems as much as by the people who unknowingly cause them.
          </p>

          {/* Body Content */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 md:p-8 space-y-6 text-slate-300">
            <p className="text-base md:text-lg leading-relaxed">
              The truth is, half of the "chutiyagiri" we encounter daily isn't born from malice—it's born from a <span className="text-white font-medium">lack of awareness</span>. As Johann Wolfgang von Goethe famously said:
            </p>
            
            <blockquote className="border-l-4 border-amber-500 pl-4 py-2 text-white italic text-lg">
              "Misunderstandings occasion more mischief in the world than malice."
            </blockquote>

            <p className="text-base md:text-lg leading-relaxed">
              At <span className="text-amber-400 font-semibold">TereStats</span>, we believe that people don't do wrong because they want to; they do it because they don't know any better. <span className="text-white font-medium">We are here to clear the fog.</span>
            </p>

            <div className="bg-slate-900/50 rounded-lg p-5 space-y-3">
              <p className="text-white font-semibold">
                Our founder, Yash Karwa, defines our core human responsibility in two steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-base md:text-lg">
                <li className="text-amber-300">Send clear messages.</li>
                <li className="text-amber-300">Give clear acknowledgement.</li>
              </ol>
            </div>

            <p className="text-base md:text-lg leading-relaxed">
              By being here, you are choosing to help others see their blind spots and to be <span className="text-white font-medium">brave enough to look at your own</span>.
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => setStep("NAME")}
            className="w-full h-14 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
          >
            I understand the intent of TereStats. Let's begin.
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>
    );
  }

  // Step 2: Ask for Name
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
