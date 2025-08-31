import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import Navigation from "@/components/Navigation";
import ClubSelectionWrapper from "@/components/ClubSelectionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestionnaire de Clubs de Handball",
  description: "Gérez vos clubs de handball et vos adhésions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <WebSocketProvider>
            <Navigation />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
            <ClubSelectionWrapper />
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
