// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import "./globals.css";
import UserNav from "@/components/UserNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Documentary Credit Generator",
  description: "Generate UCP 600 compliant documentary credit drafts from PDF documents",
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
        suppressHydrationWarning={true}
      >
        <header className="py-4 px-6 border-b sticky top-0 bg-black z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/">
              <h1 className="text-xl font-bold hover:text-blue-500 transition-colors">
                Documentary Credit Generator
              </h1>
            </Link>
            <UserNav />
          </div>
        </header>
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}