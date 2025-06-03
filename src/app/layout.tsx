"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/login' || pathname === '/order/today';

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-background min-h-screen`}>
        <div className="flex min-h-screen">
          {!hideSidebar && <Sidebar />}
          <div className="flex-1">
            <Topbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
