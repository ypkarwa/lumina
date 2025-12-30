"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      const fullPhone = `${countryCode}${cleanPhone}`;
      router.push(`/user/${encodeURIComponent(fullPhone)}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-24">
      <div className="max-w-md mx-auto pt-20 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto bg-indigo-100 p-4 rounded-full w-fit mb-4">
            <Globe className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Explore</h1>
          <p className="text-slate-500">
            Find someone's public wall and see how they're growing.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
            <div className="flex gap-2">
              <select 
                className="flex h-12 w-[80px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <Input 
                placeholder="Enter phone number..." 
                className="flex-1 h-12 text-lg"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 text-lg">
            <Search className="w-5 h-5 mr-2" />
            View Their Wall
          </Button>
        </form>

        <div className="text-center text-sm text-slate-400">
          <p>You can only see what people choose to make public.</p>
          <p className="mt-1">Privacy is respected.</p>
        </div>
      </div>
    </main>
  );
}
