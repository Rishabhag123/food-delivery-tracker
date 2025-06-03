"use client";

import { FaBell } from 'react-icons/fa';
import { FaBars } from 'react-icons/fa';
import { useState } from 'react';
import MobileSidebar from './MobileSidebar';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const hideMobileNav = pathname === '/login' || pathname === '/order/today';

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-border shadow-sm">
      <div className="flex items-center gap-3">
        {!hideMobileNav && (
          <button
            className="sm:hidden p-2 rounded-full hover:bg-gray-100 text-black"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Open menu"
          >
            <FaBars size={22} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-black tracking-tight">JMD Tiffins - Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 text-black">
          <FaBell size={18} className="text-black" />
        </button>
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">
          A
        </div>
      </div>
      {!hideMobileNav && <MobileSidebar open={showMobileMenu} onClose={() => setShowMobileMenu(false)} />}
    </header>
  );
} 