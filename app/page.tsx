"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Send, AlertCircle, Loader2, Contact, Mic, MicOff } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "./actions";
import { loadingQuotes, feedbackQuotes, spiritQuotes, getRandomQuote } from "@/lib/quotes";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isAware, setIsAware] = useState(false);
  const [messageType, setMessageType] = useState("praise");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Phone Inputs
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [hasContactPicker, setHasContactPicker] = useState(false);
  
  // Message & Speech-to-Text
  const [messageContent, setMessageContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  // Check if Contact Picker API is supported
  useEffect(() => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      setHasContactPicker(true);
    }
  }, []);

  // Check if Speech Recognition is supported
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setHasSpeechRecognition(true);
    }
  }, []);

  // Handle speech-to-text
  const handleSpeechToText = () => {
    // @ts-expect-error - Speech Recognition API types
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // English (India), supports Hindi words too

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      
      if (finalTranscript) {
        setMessageContent(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Store recognition instance to stop later
    // @ts-expect-error - attaching to window for access
    window.currentRecognition = recognition;
    recognition.start();
  };

  const stopListening = () => {
    // @ts-expect-error - accessing from window
    if (window.currentRecognition) {
      // @ts-expect-error - accessing from window
      window.currentRecognition.stop();
    }
    setIsListening(false);
  };

  // Handle contact selection
  const handlePickContact = async () => {
    try {
      // @ts-expect-error - Contact Picker API types not in standard lib
      const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        
        // Set name if available
        if (contact.name && contact.name.length > 0) {
          setRecipientName(contact.name[0]);
        }
        
        // Set phone if available
        if (contact.tel && contact.tel.length > 0) {
          let phone = contact.tel[0].replace(/[\s\-\(\)]/g, '');
          
          // Extract country code if present
          if (phone.startsWith('+')) {
            // Try to match common country codes
            if (phone.startsWith('+91') && phone.length > 12) {
              setCountryCode('+91');
              phone = phone.slice(3);
            } else if (phone.startsWith('+1') && phone.length > 11) {
              setCountryCode('+1');
              phone = phone.slice(2);
            } else if (phone.startsWith('+44') && phone.length > 12) {
              setCountryCode('+44');
              phone = phone.slice(3);
            } else {
              // Keep as is, strip the +
              phone = phone.slice(1);
            }
          }
          setPhoneNumber(phone);
        }
      }
    } catch (error) {
      console.log('Contact picker cancelled or error:', error);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSending(true);
    const formData = new FormData(e.currentTarget);
    
    // Combine phone
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const fullRecipientPhone = `${countryCode}${cleanPhone}`;

    try {
      await sendMessageAction({
        senderId: user.id,
        recipientPhone: fullRecipientPhone,
        content: formData.get("message") as string,
        actionPoint: formData.get("action") as string,
        type: messageType,
        isAnonymous: isAnonymous,
      });
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000);
      setPhoneNumber("");
      setRecipientName("");
      setMessageContent("");
      (e.target as HTMLFormElement).reset();
      setIsAware(false);
    } catch (error) {
      console.error("Failed to send:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Client-side only random quotes to avoid hydration mismatch
  const [loadingQuote, setLoadingQuote] = useState(loadingQuotes[0]);
  const [feedbackPlaceholder, setFeedbackPlaceholder] = useState(feedbackQuotes[0]);
  const [praisePlaceholder, setPraisePlaceholder] = useState(spiritQuotes[0]);
  const [advicePlaceholder, setAdvicePlaceholder] = useState(feedbackQuotes[0]);
  
  useEffect(() => {
    setLoadingQuote(getRandomQuote(loadingQuotes));
    setFeedbackPlaceholder(getRandomQuote(feedbackQuotes));
    setPraisePlaceholder(getRandomQuote(spiritQuotes));
    setAdvicePlaceholder(getRandomQuote(feedbackQuotes));
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-6" />
        <p className="text-lg text-slate-600 italic text-center max-w-md">
          "{loadingQuote.text}"
        </p>
        <p className="text-sm text-slate-400 mt-2">— {loadingQuote.author}</p>
      </main>
    );
  }

  if (!isAuthenticated) return null;

  if (isSent) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
         <Card className="w-full max-w-md shadow-xl border-green-200 bg-green-50">
           <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-4">
             <div className="bg-green-100 p-4 rounded-full">
               <Check className="w-12 h-12 text-green-600" />
             </div>
             <h2 className="text-2xl font-bold text-green-800">Sent to the Tank!</h2>
             <p className="text-green-700">
               Your message is cooling off. It will be delivered in 10 minutes if you don't retract it.
             </p>
             <Button onClick={() => setIsSent(false)} variant="outline" className="mt-4 border-green-600 text-green-700 hover:bg-green-100">
               Send Another
             </Button>
           </CardContent>
         </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 pb-24">
      
      {/* The Core Philosophy Quote - Hanlon's Razor */}
      <div className="max-w-4xl text-center mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          "Never attribute to malice what can be <br className="hidden md:block"/>
          adequately explained by <span className="text-indigo-600">stupidity</span>."
        </h1>
        
        <p className="text-muted-foreground text-lg italic">
          — Hanlon's Razor (and the spirit of TereStats)
        </p>
      </div>

      {/* The Interaction Form */}
      <Card className="w-full max-w-2xl shadow-xl border-slate-200">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send a Signal
          </CardTitle>
          <CardDescription className="text-slate-300">
            Shape someone's growth or brighten their day.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Who is this for? */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Recipient Name</Label>
                <Input 
                  name="name" 
                  id="name" 
                  placeholder="e.g. Alex" 
                  required 
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <select 
                    className="flex h-10 w-[80px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="flex-1"
                  />
                  {hasContactPicker && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={handlePickContact}
                      title="Pick from contacts"
                      className="shrink-0"
                    >
                      <Contact className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Type of Message */}
            <div className="space-y-2">
              <Label htmlFor="type">Message Type</Label>
              <select 
                id="type"
                name="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
              >
                <option value="praise">Praise (Gratitude)</option>
                <option value="feedback">Feedback (Constructive)</option>
                <option value="advice">Advice (Wisdom)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {messageType === 'praise' && "Boosts their Spirit Score (Heart)."}
                {messageType === 'feedback' && "Boosts their Value Score (Gold)."}
                {messageType === 'advice' && "Boosts their Value Score (Gold)."}
              </p>
            </div>

            {/* Row 3: The Message (Big Box) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">The Message</Label>
                {hasSpeechRecognition && (
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="sm"
                    onClick={isListening ? stopListening : handleSpeechToText}
                    className="gap-1.5"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Speak
                      </>
                    )}
                  </Button>
                )}
              </div>
              {messageType === 'feedback' && (
                <p className="text-xs text-slate-500 italic bg-amber-50 p-2 rounded-md border border-amber-100">
                  💡 "{feedbackPlaceholder.text}" — {feedbackPlaceholder.author}
                </p>
              )}
              {messageType === 'praise' && (
                <p className="text-xs text-slate-500 italic bg-rose-50 p-2 rounded-md border border-rose-100">
                  💫 "{praisePlaceholder.text}" — {praisePlaceholder.author}
                </p>
              )}
              {messageType === 'advice' && (
                <p className="text-xs text-slate-500 italic bg-indigo-50 p-2 rounded-md border border-indigo-100">
                  🧭 "{advicePlaceholder.text}" — {advicePlaceholder.author}
                </p>
              )}
              <div className="relative">
                <Textarea 
                  id="message" 
                  name="message"
                  placeholder={
                    messageType === 'feedback' 
                      ? "I noticed [Behavior]. I believe it affects [Impact]..." 
                      : messageType === 'advice'
                      ? "I think you might benefit from..."
                      : "I really appreciated when you..."
                  }
                  className={`min-h-[150px] resize-y text-base ${isListening ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
                {isListening && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 text-xs text-red-500 bg-white px-2 py-1 rounded-full shadow-sm border border-red-200">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Listening...
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Action Points (Smaller Box) */}
            <div className="space-y-2">
              <Label htmlFor="action" className="flex items-center gap-2">
                Suggested Next Step
                <span className="text-xs font-normal text-muted-foreground">(Make it actionable)</span>
              </Label>
              <Input 
                id="action" 
                name="action"
                placeholder={
                  messageType === 'feedback' 
                    ? "Try pausing for 3 seconds before responding..." 
                    : "Keep doing exactly this!"
                }
                className="bg-slate-50"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="anonymous" 
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="anonymous" className="text-sm font-medium text-slate-700 cursor-pointer">
                Send Anonymously
              </label>
            </div>

            {/* Awareness Prompt */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mt-6">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-amber-800 font-medium">
                  The Awareness Check
                </p>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="aware" 
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={isAware}
                    onChange={(e) => setIsAware(e.target.checked)}
                  />
                  <label htmlFor="aware" className="text-sm text-amber-900 cursor-pointer">
                    Is this message designed to help them grow, not just to let off steam?
                  </label>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full text-lg h-12" 
              disabled={!isAware || isSending}
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Intent to Send"}
            </Button>

          </form>
        </CardContent>
        <CardFooter className="bg-slate-50 text-xs text-center text-muted-foreground p-4 rounded-b-xl border-t">
          Messages are held for 10 minutes before delivery.
        </CardFooter>
      </Card>
    </main>
  );
}
