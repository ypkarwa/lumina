import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/auth-context";
import { BottomNav } from "@/components/bottom-nav";
import { OnboardingTour } from "@/components/onboarding-tour";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TereStats",
  description: "Lighting up the blind spots we all share.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <BottomNav />
          <OnboardingTour />
        </AuthProvider>
      </body>
    </html>
  );
}
