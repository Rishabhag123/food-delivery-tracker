"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaUserFriends, FaUtensils, FaShareAlt } from 'react-icons/fa';

const navItems = [
  { label: 'Dashboard', icon: <FaHome className="text-black" />, href: '/' },
  { label: 'Customers', icon: <FaUserFriends className="text-black" />, href: '/customers' },
  { label: 'Menu', icon: <FaUtensils className="text-black" />, href: '/menu' },
  { label: 'Menu Share', icon: <FaShareAlt className="text-black" />, href: '/menu-share' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-20 bg-white border-r border-border flex flex-col items-center py-8 shadow-sm hidden sm:flex">
      <div className="mb-10">
        <span className="text-2xl font-bold text-black">🍲</span>
      </div>
      <nav className="flex flex-col gap-8 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center transition-colors group text-black ${pathname === item.href ? 'font-bold underline' : ''}`}
            title={item.label}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium hidden xl:block">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
} 