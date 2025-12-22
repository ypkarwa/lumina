"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function LoginPage() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Initialize Recaptcha on mount
  useEffect(() => {
    if (step === 'PHONE' && typeof window !== 'undefined') {
      try {
        if (!recaptchaVerifierRef.current) {
            // Clear any existing instance to be safe
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
            
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                   console.log("Recaptcha resolved");
                }
            });
            window.recaptchaVerifier = recaptchaVerifierRef.current;
        }
      } catch (e) {
        console.error("Recaptcha setup error:", e);
      }
    }
    
    return () => {
        if (recaptchaVerifierRef.current) {
            try {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            } catch (e) {
                console.error("Failed to clear recaptcha", e);
            }
        }
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error("Recaptcha not initialized");
      }

      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const fullPhoneNumber = `${countryCode}${cleanPhone}`;

      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifierRef.current);
      window.confirmationResult = confirmationResult;
      
      setStep("OTP");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      // Detailed error alert
      alert(`Failed to send OTP: ${error.message || "Check console"}`);
      
      if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
          window.location.reload(); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await window.confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      
      // Login and check if user has name
      const user = await login(firebaseUser.phoneNumber!);
      
      if (user) {
        if (user.name) {
            router.push("/"); // Go to Dashboard if name exists
        } else {
            router.push("/onboarding"); // Go to Onboarding if new user
        }
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
              : `Enter the code sent to ${countryCode} ${phoneNumber}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "PHONE" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex gap-2">
                  <select 
                    className="flex h-12 w-[80px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    {/* Add others */}
                  </select>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="9876543210" 
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 text-lg h-12"
                  />
                </div>
              </div>
              
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
