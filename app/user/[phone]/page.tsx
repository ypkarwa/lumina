"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, MessageSquare, Heart, Star, Send, Loader2, User, Globe } from "lucide-react";
import { searchUserAction, getPublicWallAction } from "@/app/actions";

type PublicMessage = {
  id: string;
  content: string;
  actionPoint: string | null;
  type: string;
  createdAt: Date;
  agrees: { id: string }[];
  comments: { id: string; content: string; user: { name: string | null } }[];
};

type UserData = {
  id: string;
  name: string | null;
  phoneNumber: string;
  valueScore: number;
  spiritScore: number;
};

export default function UserWallPage() {
  const params = useParams();
  const phone = decodeURIComponent(params.phone as string);
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const user = await searchUserAction(phone);
        if (user) {
          setUserData(user as unknown as UserData);
          const publicMsgs = await getPublicWallAction(user.id);
          setMessages(publicMsgs as any);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [phone]);

  const handleAgree = (id: string) => {
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, agrees: [...m.agrees, { id: `temp-${Date.now()}` }] } : m
    ));
  };

  const handleComment = (id: string) => {
    const text = commentInputs[id];
    if (!text) return;

    setMessages(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          comments: [...m.comments, { id: `new-${Date.now()}`, content: text, user: { name: "Me" } }]
        };
      }
      return m;
    }));
    setCommentInputs(prev => ({ ...prev, [id]: "" }));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 pb-20">
        <div className="max-w-3xl mx-auto pt-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h1>
          <p className="text-slate-500">
            No user found with this phone number, or they haven't joined TereStats yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-20">
      {/* Profile Header */}
      <div className="max-w-3xl mx-auto mb-8 pt-8 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-indigo-700">
            {userData.name ? userData.name.charAt(0).toUpperCase() : "?"}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{userData.name || "Anonymous User"}</h1>
        <p className="text-slate-500 text-sm">{userData.phoneNumber}</p>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold">{userData.valueScore} Value</span>
          </div>
          <div className="flex items-center gap-2 text-rose-700">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-bold">{userData.spiritScore} Spirit</span>
          </div>
        </div>
      </div>

      {/* Wall Feed */}
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Wall of Growth
        </h2>
        
        {messages.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>This user hasn't made anything public yet.</p>
          </div>
        )}

        {messages.map((msg) => (
          <Card key={msg.id} className="overflow-hidden">
            <div className={`h-1 w-full ${msg.type === 'praise' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  msg.type === 'praise' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {msg.type}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-lg text-slate-800 mb-4 font-medium">"{msg.content}"</p>
              
              {msg.actionPoint && (
                <div className="bg-slate-50 p-3 rounded-md border border-slate-100 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Action Step</span>
                  <p className="text-sm text-slate-700">{msg.actionPoint}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAgree(msg.id)}
                  className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Agree ({msg.agrees?.length || 0})
                </Button>
              </div>

              {/* Comments Section */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                {msg.comments && msg.comments.length > 0 && (
                  <div className="space-y-2">
                    {msg.comments.map(comment => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-semibold text-slate-700">{comment.user?.name || "Someone"}: </span>
                        <span className="text-slate-600">{comment.content}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Input 
                    placeholder="Add a comment..." 
                    className="h-9 text-sm bg-white"
                    value={commentInputs[msg.id] || ""}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [msg.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(msg.id)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleComment(msg.id)}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
