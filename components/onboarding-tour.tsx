"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowDown, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/auth-context";

interface TourStep {
  target: string; // CSS selector or position description
  title: string;
  description: string;
  position: "bottom-left" | "bottom-center" | "bottom-right" | "top-center";
}

const tourSteps: TourStep[] = [
  {
    target: "send",
    title: "📤 Send",
    description: "This is where you send feedback, praise, or advice to anyone using their phone number.",
    position: "top-center",
  },
  {
    target: "messages",
    title: "💬 Messages",
    description: "Check your incoming messages from others, and see the messages you've sent (including ones still cooling off).",
    position: "top-center",
  },
  {
    target: "profile",
    title: "👤 Profile",
    description: "Your public wall! Make feedback public, create polls, and see how others perceive you.",
    position: "top-center",
  },
  {
    target: "explore",
    title: "🔍 Explore",
    description: "Search for someone by their phone number to view their public wall and interact with their posts.",
    position: "top-center",
  },
];

export function OnboardingTour() {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const pathname = usePathname();
  const { user, completeTour: markTourComplete, isAuthenticated } = useAuth();

  // Don't show on auth/onboarding pages
  const hiddenPaths = ['/login', '/onboarding', '/welcome'];
  const shouldHide = hiddenPaths.includes(pathname);

  useEffect(() => {
    if (shouldHide || !isAuthenticated) {
      setShowTour(false);
      return;
    }

    // Check if user has completed the tour (from database)
    if (user && !user.tourCompleted) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldHide, user, isAuthenticated]);

  const completeTour = async () => {
    await markTourComplete();
    setShowTour(false);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  if (!showTour || shouldHide) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  // Calculate position based on which nav item we're highlighting
  const getHighlightPosition = () => {
    const positions = {
      send: "left-[12.5%]",
      messages: "left-[37.5%]",
      profile: "left-[62.5%]",
      explore: "left-[87.5%]",
    };
    return positions[step.target as keyof typeof positions] || "left-1/2";
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in duration-300" />

      {/* Highlight circle on nav item */}
      <div 
        className={`fixed bottom-8 ${getHighlightPosition()} -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white bg-transparent z-[101] animate-pulse`}
        style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" }}
      />

      {/* Tooltip */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[102] animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{step.title}</h3>
            <button 
              onClick={skipTour}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-slate-700 text-base leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Arrow pointing down */}
          <div className="flex justify-center -mb-3">
            <ArrowDown className="w-8 h-8 text-indigo-600 animate-bounce" />
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-2">
              {tourSteps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={prevStep}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={nextStep}
                className="gap-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {isLastStep ? "Got it!" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Skip link */}
      <button 
        onClick={skipTour}
        className="fixed top-4 right-4 z-[102] text-white/70 hover:text-white text-sm underline"
      >
        Skip tour
      </button>
    </>
  );
}

