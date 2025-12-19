"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Globe, Lock, LayoutGrid, Inbox, ThumbsUp, MessageSquare, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock Data
type Message = {
  id: string;
  content: string;
  actionPoint?: string;
  type: 'praise' | 'feedback' | 'advice';
  senderName: string;
  isAnonymous: boolean;
  date: string;
  rating?: number;
  isPublic: boolean;
  status: 'COOLING_OFF' | 'DELIVERED';
  agrees: number;
  comments: number;
};

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    content: "You really stepped up during the crisis yesterday. Your calm demeanor helped everyone else stay focused.",
    type: 'praise',
    senderName: "Anonymous",
    isAnonymous: true,
    date: "2024-04-12",
    status: 'DELIVERED',
    isPublic: true,
    agrees: 12,
    comments: 2,
    rating: 5
  },
  {
    id: '2',
    content: "I noticed you interrupt people when you get excited about an idea. It makes quiet team members shut down.",
    actionPoint: "Count to 3 before speaking when you have a new idea.",
    type: 'feedback',
    senderName: "Anonymous",
    isAnonymous: true,
    date: "2024-04-10",
    status: 'DELIVERED',
    rating: 5,
    isPublic: false,
    agrees: 0,
    comments: 0
  },
  {
    id: '3',
    content: "Great job on the new design!",
    type: 'praise',
    senderName: "Sarah",
    isAnonymous: false,
    date: "Just now",
    status: 'COOLING_OFF',
    isPublic: false,
    agrees: 0,
    comments: 0
  }
];

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [activeTab, setActiveTab] = useState<'wall' | 'inbox'>('wall');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  const handleRate = (id: string, score: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, rating: score } : m));
  };

  const togglePublic = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isPublic: !m.isPublic } : m));
  };

  const filteredMessages = activeTab === 'wall' 
    ? messages.filter(m => m.isPublic) 
    : messages;

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-24">
      {/* Profile Header */}
      <div className="max-w-3xl mx-auto pt-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{user?.name}</h1>
            <p className="text-slate-500">{user?.phoneNumber}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-red-500">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Star className="w-6 h-6 text-amber-500 mb-1 fill-current" />
              <div className="text-2xl font-bold text-amber-900">125</div>
              <div className="text-xs font-medium text-amber-700">Value Score</div>
            </CardContent>
          </Card>
          
          <Card className="bg-rose-50 border-rose-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Heart className="w-6 h-6 text-rose-500 mb-1 fill-current" />
              <div className="text-2xl font-bold text-rose-900">84</div>
              <div className="text-xs font-medium text-rose-700">Love Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs - Added relative positioning and z-index */}
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
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'inbox' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-600'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Private Inbox
            {messages.filter(m => m.status === 'COOLING_OFF').length > 0 && (
              <span className="ml-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {messages.filter(m => m.status === 'COOLING_OFF').length}
              </span>
            )}
          </button>
        </div>

        {/* Messages List - Added z-index to ensure it stays below tabs */}
        <div className="space-y-4 relative z-0">
          {filteredMessages.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              {activeTab === 'wall' ? "Nothing on your wall yet." : "No messages found."}
            </div>
          )}

          {filteredMessages.map((msg) => (
            <Card key={msg.id} className="overflow-hidden border-slate-200 shadow-sm">
              <div className={`h-1 w-full ${msg.type === 'praise' ? 'bg-rose-500' : 'bg-amber-500'}`} />
              
              <CardContent className="pt-5 pb-4 relative">
                {/* Meta Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      msg.type === 'praise' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {msg.type}
                    </span>
                    <span className="text-xs text-slate-400">{msg.date}</span>
                    {msg.status === 'COOLING_OFF' && (
                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                         Cooling Off
                       </span>
                    )}
                  </div>
                  
                  {/* Controls only in Inbox */}
                  {activeTab === 'inbox' && msg.status === 'DELIVERED' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePublic(msg.id); }}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${
                        msg.isPublic 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      {msg.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {msg.isPublic ? "ON WALL" : "PRIVATE"}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className={`${msg.status === 'COOLING_OFF' ? 'blur-sm select-none' : ''} transition-all`}>
                  <p className="text-slate-800 text-base mb-3 leading-relaxed">"{msg.content}"</p>
                  
                  {msg.actionPoint && (
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Action Step</span>
                      <p className="text-sm text-slate-700">{msg.actionPoint}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end mt-4">
                    <p className="text-xs text-slate-400 italic">
                      From: {msg.isAnonymous ? "Anonymous" : msg.senderName}
                    </p>

                    {/* Wall Stats (Only visible on Wall Tab or if Public) */}
                    {(activeTab === 'wall' || msg.isPublic) && (
                      <div className="flex gap-3 text-slate-400">
                        <div className="flex items-center gap-1 text-xs">
                          <ThumbsUp className="w-3 h-3" /> {msg.agrees}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <MessageSquare className="w-3 h-3" /> {msg.comments}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cooling Off Message overlay - Ensures it covers content but not buttons if possible, though it is absolute to card */}
                {msg.status === 'COOLING_OFF' && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border text-xs font-medium text-slate-600">
                      Arriving in 45 mins
                    </div>
                  </div>
                )}

                {/* Rating Section (Only in Inbox and Delivered) */}
                {activeTab === 'inbox' && msg.status === 'DELIVERED' && (
                  <div className="border-t pt-3 mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Rate to boost their score:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(msg.id, star)}
                          disabled={!!msg.rating}
                          className={`transition-all ${
                            (msg.rating || 0) >= star 
                              ? msg.type === 'praise' ? "text-rose-500 fill-current" : "text-amber-500 fill-current"
                              : "text-slate-300 hover:text-slate-400"
                          }`}
                        >
                          {msg.type === 'praise' ? <Heart className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
