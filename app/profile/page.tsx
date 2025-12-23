"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Star, Globe, LayoutGrid, HelpCircle, ThumbsUp, MessageSquare, LogOut, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMyMessagesAction, getUserStatsAction } from "@/app/actions";
import { loadingQuotes, spiritQuotes, brandingQuotes, getRandomQuote } from "@/lib/quotes";

type Message = {
  id: string;
  content: string;
  actionPoint: string | null;
  type: string;
  sender: {
    name: string | null;
    phoneNumber: string;
  };
  isAnonymous: boolean;
  createdAt: Date;
  isPublic: boolean;
  agrees: any[];
  comments: any[];
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({ valueScore: 0, spiritScore: 0 });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wall' | 'polls'>('wall');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchData() {
      if (user?.id) {
        setIsDataLoading(true);
        try {
          const [msgs, userStats] = await Promise.all([
            getMyMessagesAction(user.id),
            getUserStatsAction(user.id)
          ]);
          // Filter only public messages for the wall
          setMessages((msgs as any[]).filter(m => m.isPublic));
          if (userStats) {
            const stats = userStats as unknown as { valueScore: number; spiritScore: number };
            setStats({ valueScore: stats.valueScore, spiritScore: stats.spiritScore });
          }
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
        } finally {
          setIsDataLoading(false);
        }
      }
    }
    fetchData();
  }, [user?.id]);

  // Client-side only random quotes to avoid hydration mismatch
  const [loadingQuote, setLoadingQuote] = useState(loadingQuotes[0]);
  const [spiritQuote, setSpiritQuote] = useState(spiritQuotes[0]);
  const [brandingQuote, setBrandingQuote] = useState(brandingQuotes[0]);
  
  useEffect(() => {
    setLoadingQuote(getRandomQuote(loadingQuotes));
    setSpiritQuote(getRandomQuote(spiritQuotes));
    setBrandingQuote(getRandomQuote(brandingQuotes));
  }, []);

  if (isAuthLoading || (isAuthenticated && isDataLoading)) {
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

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-24">
      {/* Profile Header */}
      <div className="max-w-3xl mx-auto pt-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{user?.name || "Member"}</h1>
            <p className="text-slate-500">{user?.phoneNumber}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-red-500">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Star className="w-6 h-6 text-amber-500 mb-1 fill-current" />
              <div className="text-2xl font-bold text-amber-900">{stats.valueScore}</div>
              <div className="text-xs font-medium text-amber-700">Value Score</div>
            </CardContent>
          </Card>
          
          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Heart className="w-6 h-6 text-rose-500 mb-1 fill-current" />
              <div className="text-2xl font-bold text-rose-900">{stats.spiritScore}</div>
              <div className="text-xs font-medium text-rose-700">Spirit Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Spirit Quote */}
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 rounded-lg p-3 mb-8 text-center">
          <p className="text-sm text-slate-700 italic">
            💫 "{spiritQuote.text}"
          </p>
          <p className="text-xs text-slate-500 mt-1">— {spiritQuote.author}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-200 rounded-xl mb-6 relative z-20">
          <button
            onClick={() => setActiveTab('wall')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'wall' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            My Public Wall
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'polls' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-600'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Polls & Questions
          </button>
        </div>

        {/* PUBLIC WALL TAB */}
        {activeTab === 'wall' && (
          <div className="space-y-4 relative z-0">
            {messages.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Nothing on your wall yet.</p>
                <p className="text-sm mt-1">Go to Messages → Incoming to make feedback public.</p>
                <p className="text-indigo-500 text-sm mt-3 font-medium">{brandingQuote.text}</p>
              </div>
            )}

            {messages.map((msg) => {
              const senderName = msg.isAnonymous ? "Anonymous" : (msg.sender?.name || "Unknown");
              
              return (
                <Card key={msg.id} className="overflow-hidden border-slate-200 shadow-sm">
                  <div className={`h-1 w-full ${msg.type === 'praise' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  
                  <CardContent className="pt-5 pb-4">
                    {/* Meta Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          msg.type === 'praise' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {msg.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        <Globe className="w-3 h-3" />
                        PUBLIC
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-slate-800 text-base mb-3 leading-relaxed">"{msg.content}"</p>
                    
                    {msg.actionPoint && (
                      <div className="bg-slate-50 p-3 rounded-md border border-slate-100 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Action Step</span>
                        <p className="text-sm text-slate-700">{msg.actionPoint}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-end mt-4">
                      <p className="text-xs text-slate-400 italic">
                        From: {senderName}
                      </p>

                      {/* Social Stats */}
                      <div className="flex gap-3 text-slate-400">
                        <div className="flex items-center gap-1 text-xs">
                          <ThumbsUp className="w-3 h-3" /> {msg.agrees?.length || 0}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <MessageSquare className="w-3 h-3" /> {msg.comments?.length || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* POLLS & QUESTIONS TAB */}
        {activeTab === 'polls' && (
          <div className="space-y-4 relative z-0">
            <div className="text-center py-10 text-slate-400">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-600 mb-2">Polls & Questions</p>
              <p className="text-sm">
                Create polls or questions for the public to answer.<br />
                This feature is coming soon!
              </p>
              <Button className="mt-4" disabled>
                <Plus className="w-4 h-4 mr-2" />
                Create Poll (Coming Soon)
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
