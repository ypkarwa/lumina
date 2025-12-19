"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { auth, setupRecaptcha } from "@/lib/firebase";
import { signInWithPhoneNumber } from "firebase/auth";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Initialize Recaptcha on mount
  useEffect(() => {
    // Only set up if we are on the phone step
    if (step === 'PHONE') {
      try {
        setupRecaptcha('recaptcha-container');
      } catch (e) {
        console.error("Recaptcha setup error:", e);
      }
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const verifier = window.recaptchaVerifier;
      // Format phone number to E.164 (e.g., +15555555555)
      // Assuming user types "+1 (555)..." or just "555..."
      // Basic cleanup:
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber}`; // Default to US/Canada if no code provided (adjust as needed)

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      window.confirmationResult = confirmationResult;
      
      setStep("OTP");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please check the number and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Verify with Firebase
      const result = await window.confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      
      console.log("Firebase Auth Success:", firebaseUser.phoneNumber);

      // 2. Sync/Login with our Backend (Postgres)
      // This calls our Server Action via AuthContext
      const success = await login(firebaseUser.phoneNumber!);
      
      if (success) {
        router.push("/onboarding");
      } else {
        alert("Login failed on server. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Invalid Code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      <div className="max-w-md text-center mb-10 space-y-6">
        <div className="flex justify-center mb-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-serif italic text-slate-800 leading-tight">
          "It's morally wrong to let a praise go unheard."
        </h1>
      </div>

      <Card className="w-full max-w-md shadow-lg border-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === "PHONE" ? "Welcome to Lumina" : "Verify Identity"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "PHONE" 
              ? "Enter your mobile number to begin." 
              : `Enter the code sent to ${phoneNumber}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "PHONE" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg py-6"
                />
              </div>
              
              {/* Invisible Recaptcha Container */}
              <div id="recaptcha-container"></div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Code"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="123456" 
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-lg py-6 tracking-widest text-center"
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Login"}
              </Button>
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setStep("PHONE")}
                  className="text-sm text-muted-foreground hover:text-indigo-600 underline"
                >
                  Wrong number? Go back
                </button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t p-6 bg-slate-50/50">
          <p className="text-xs text-center text-muted-foreground max-w-[280px]">
            By continuing, you agree to join a community dedicated to transparent growth and kindness.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
