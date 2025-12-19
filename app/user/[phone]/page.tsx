"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, MessageSquare, Heart, Star, Send } from "lucide-react";

// Mock Data for Public Wall
const MOCK_PUBLIC_MESSAGES = [
  {
    id: '101',
    content: "I realized I was micromanaging the design team. I'm trying to step back and trust their process more.",
    type: 'feedback', // Self-reflection or feedback accepted
    date: "2h ago",
    agrees: 12,
    comments: [
      { id: 'c1', text: "Takes courage to admit that. Respect!", user: "Davide" }
    ]
  },
  {
    id: '102',
    content: "Your presentation today was incredibly clear. The way you simplified the tech stack for the clients was genius.",
    type: 'praise',
    date: "1d ago",
    agrees: 24,
    comments: []
  }
];

export default function UserWallPage() {
  const params = useParams();
  const phone = params.phone as string; // in real app, fetch user by this
  
  const [messages, setMessages] = useState(MOCK_PUBLIC_MESSAGES);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  const handleAgree = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, agrees: m.agrees + 1 } : m));
  };

  const handleComment = (id: string) => {
    const text = commentInputs[id];
    if (!text) return;

    setMessages(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          comments: [...m.comments, { id: `new-${Date.now()}`, text, user: "Me" }]
        };
      }
      return m;
    }));
    setCommentInputs(prev => ({ ...prev, [id]: "" }));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-20">
      {/* Profile Header */}
      <div className="max-w-3xl mx-auto mb-8 pt-8 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-indigo-700">
            {phone.slice(-2)}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">User {phone}</h1>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold">125 Value</span>
          </div>
          <div className="flex items-center gap-2 text-rose-700">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-bold">84 Love</span>
          </div>
        </div>
      </div>

      {/* Wall Feed */}
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Wall of Growth</h2>
        
        {messages.map((msg) => (
          <Card key={msg.id} className="overflow-hidden">
             <div className={`h-1 w-full ${msg.type === 'praise' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <CardContent className="pt-6">
              <p className="text-lg text-slate-800 mb-6 font-medium">"{msg.content}"</p>
              
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAgree(msg.id)}
                  className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Agree ({msg.agrees})
                </Button>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  {msg.date}
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                {msg.comments.map(comment => (
                  <div key={comment.id} className="text-sm">
                    <span className="font-semibold text-slate-700">{comment.user}: </span>
                    <span className="text-slate-600">{comment.text}</span>
                  </div>
                ))}
                
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

