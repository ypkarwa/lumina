 "use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, Star, Globe, Lock, Inbox, Send, 
  ThumbsUp, MessageSquare, LogOut, Loader2,
  Clock, Edit3, Trash2, X, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  getIncomingMessagesAction, 
  getOutgoingMessagesAction,
  toggleMessagePublicAction, 
  rateMessageAction,
  updateMessageAction,
  deleteMessageAction
} from "@/app/actions";
import { loadingQuotes, inboxQuotes, getRandomQuote } from "@/lib/quotes";

type IncomingMessage = {
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
  availableAt: Date;
  status: string;
  isPublic: boolean;
  ratings: { score: number }[];
};

type OutgoingMessage = {
  id: string;
  content: string;
  actionPoint: string | null;
  type: string;
  recipientPhone: string;
  createdAt: Date;
  availableAt: Date;
  status: string;
  isAnonymous: boolean;
};

export default function MessagesPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [outgoingMessages, setOutgoingMessages] = useState<OutgoingMessage[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editActionPoint, setEditActionPoint] = useState("");

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
          const [incoming, outgoing] = await Promise.all([
            getIncomingMessagesAction(user.id),
            getOutgoingMessagesAction(user.id)
          ]);
          setIncomingMessages(incoming as any);
          setOutgoingMessages(outgoing as any);
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        } finally {
          setIsDataLoading(false);
        }
      }
    }
    fetchData();
  }, [user?.id]);

  // Client-side only random quotes to avoid hydration mismatch
  const [loadingQuote, setLoadingQuote] = useState(loadingQuotes[0]);
  const [inboxQuote, setInboxQuote] = useState(inboxQuotes[0]);
  
  useEffect(() => {
    setLoadingQuote(getRandomQuote(loadingQuotes));
    setInboxQuote(getRandomQuote(inboxQuotes));
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

  // --- Incoming Message Handlers ---
  const handleRate = async (id: string, score: number, type: string) => {
    setIncomingMessages(prev => prev.map(m => m.id === id ? { ...m, ratings: [{ score }] } : m));
    await rateMessageAction(id, score, type === 'praise' ? 'SPIRIT' : 'VALUE');
  };

  const togglePublic = async (id: string) => {
    const msg = incomingMessages.find(m => m.id === id);
    if (!msg) return;
    
    const newStatus = !msg.isPublic;
    setIncomingMessages(prev => prev.map(m => m.id === id ? { ...m, isPublic: newStatus } : m));
    await toggleMessagePublicAction(id, newStatus);
  };

  // --- Outgoing Message Handlers ---
  const startEditing = (msg: OutgoingMessage) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
    setEditActionPoint(msg.actionPoint || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
    setEditActionPoint("");
  };

  const saveEdit = async (id: string) => {
    await updateMessageAction(id, editContent, editActionPoint || undefined);
    setOutgoingMessages(prev => prev.map(m => 
      m.id === id ? { ...m, content: editContent, actionPoint: editActionPoint || null } : m
    ));
    cancelEditing();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to retract this message?")) {
      await deleteMessageAction(id);
      setOutgoingMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  // Separate outgoing into cooling and sent
  const coolingMessages = outgoingMessages.filter(m => new Date(m.availableAt) > new Date());
  const sentMessages = outgoingMessages.filter(m => new Date(m.availableAt) <= new Date());

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-24">
      <div className="max-w-3xl mx-auto pt-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Messages</h1>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-200 rounded-xl mb-6 relative z-20">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'incoming' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-600'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Incoming
            {incomingMessages.filter(m => new Date(m.availableAt) <= new Date()).length > 0 && (
              <span className="ml-1 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {incomingMessages.filter(m => new Date(m.availableAt) <= new Date()).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'outgoing' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-600'
            }`}
          >
            <Send className="w-4 h-4" />
            Outgoing
            {coolingMessages.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {coolingMessages.length} cooling
              </span>
            )}
          </button>
        </div>

        {/* INCOMING TAB */}
        {activeTab === 'incoming' && (
          <div className="space-y-4 relative z-0">
            {/* Inbox Quote */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
              <p className="text-sm text-indigo-800 italic">
                "{inboxQuote.text}"
              </p>
              <p className="text-xs text-indigo-600 mt-1">— {inboxQuote.author}</p>
            </div>

            {incomingMessages.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                No messages received yet.
              </div>
            )}

            {incomingMessages.map((msg) => {
              const isCoolingOff = new Date(msg.availableAt) > new Date();
              const currentRating = msg.ratings && msg.ratings.length > 0 ? msg.ratings[0].score : 0;
              const senderName = msg.isAnonymous ? "Anonymous" : (msg.sender?.name || "Unknown");
              
              return (
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
                        <span className="text-xs text-slate-400">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                        {isCoolingOff && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                            Cooling Off
                          </span>
                        )}
                      </div>
                      
                      {/* Public/Private Toggle */}
                      {!isCoolingOff && (
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
                    <div className={`${isCoolingOff ? 'blur-sm select-none' : ''} transition-all`}>
                      <p className="text-slate-800 text-base mb-3 leading-relaxed">"{msg.content}"</p>
                      
                      {msg.actionPoint && (
                        <div className="bg-slate-50 p-3 rounded-md border border-slate-100 mb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Action Step</span>
                          <p className="text-sm text-slate-700">{msg.actionPoint}</p>
                        </div>
                      )}
                      
                      <p className="text-xs text-slate-400 italic mt-4">
                        From: {senderName}
                      </p>
                    </div>

                    {/* Cooling Off Overlay */}
                    {isCoolingOff && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border text-xs font-medium text-slate-600">
                          Arriving at {new Date(msg.availableAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    )}

                    {/* Rating Section - EDITABLE */}
                    {!isCoolingOff && (
                      <div className="border-t pt-3 mt-4 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {currentRating > 0 ? "Your rating (click to change):" : "Rate to boost their score:"}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRate(msg.id, star, msg.type)}
                              className={`transition-all hover:scale-110 ${
                                currentRating >= star 
                                  ? msg.type === 'praise' ? "text-rose-500" : "text-amber-500"
                                  : "text-slate-300 hover:text-slate-400"
                              }`}
                            >
                              {msg.type === 'praise' 
                                ? <Heart className={`w-5 h-5 ${currentRating >= star ? 'fill-current' : ''}`} /> 
                                : <Star className={`w-5 h-5 ${currentRating >= star ? 'fill-current' : ''}`} />
                              }
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* OUTGOING TAB */}
        {activeTab === 'outgoing' && (
          <div className="space-y-6 relative z-0">
            {/* Cooling Tank Section */}
            {coolingMessages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  In Cooling Tank (Editable)
                </h3>
                <div className="space-y-4">
                  {coolingMessages.map((msg) => (
                    <Card key={msg.id} className="overflow-hidden border-amber-200 bg-amber-50/50 shadow-sm">
                      <div className={`h-1 w-full ${msg.type === 'praise' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      
                      <CardContent className="pt-5 pb-4">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              msg.type === 'praise' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {msg.type}
                            </span>
                            <span className="text-xs text-slate-400">
                              To: {msg.recipientPhone}
                            </span>
                            {msg.isAnonymous && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                Anonymous
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-amber-700 text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Sends at {new Date(msg.availableAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>

                        {/* Content - Editable or Static */}
                        {editingId === msg.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[100px] bg-white"
                            />
                            <Input
                              value={editActionPoint}
                              onChange={(e) => setEditActionPoint(e.target.value)}
                              placeholder="Action point (optional)"
                              className="bg-white"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEdit(msg.id)} className="gap-1">
                                <Check className="w-3 h-3" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEditing} className="gap-1">
                                <X className="w-3 h-3" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-slate-800 text-base mb-3 leading-relaxed">"{msg.content}"</p>
                            
                            {msg.actionPoint && (
                              <div className="bg-white/70 p-3 rounded-md border border-amber-100 mb-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Action Step</span>
                                <p className="text-sm text-slate-700">{msg.actionPoint}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => startEditing(msg)}
                                className="gap-1 text-slate-600"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleDelete(msg.id)}
                                className="gap-1 text-red-600 hover:bg-red-50 hover:border-red-200"
                              >
                                <Trash2 className="w-3 h-3" /> Retract
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Section */}
            {sentMessages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Sent & Delivered
                </h3>
                <div className="space-y-4">
                  {sentMessages.map((msg) => (
                    <Card key={msg.id} className="overflow-hidden border-slate-200 shadow-sm">
                      <div className={`h-1 w-full ${msg.type === 'praise' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      
                      <CardContent className="pt-5 pb-4">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              msg.type === 'praise' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {msg.type}
                            </span>
                            <span className="text-xs text-slate-400">
                              To: {msg.recipientPhone}
                            </span>
                            {msg.isAnonymous && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                Anonymous
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">
                            Delivered
                          </span>
                        </div>

                        <p className="text-slate-800 text-base mb-3 leading-relaxed">"{msg.content}"</p>
                        
                        {msg.actionPoint && (
                          <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Action Step</span>
                            <p className="text-sm text-slate-700">{msg.actionPoint}</p>
                          </div>
                        )}

                        <p className="text-xs text-slate-400 mt-3">
                          Sent on {new Date(msg.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {outgoingMessages.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                You haven't sent any messages yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

