import Link from 'next/link';
import { FaTimes, FaHome, FaUserFriends, FaUtensils, FaCog, FaShareAlt } from 'react-icons/fa';

const navItems = [
  { label: 'Dashboard', icon: <FaHome className="text-black" />, href: '/' },
  { label: 'Customers', icon: <FaUserFriends className="text-black" />, href: '/customers' },
  { label: 'Menu', icon: <FaUtensils className="text-black" />, href: '/menu' },
  { label: 'Menu Share', icon: <FaShareAlt className="text-black" />, href: '/menu-share' },
  { label: 'Settings', icon: <FaCog className="text-black" />, href: '#' },
];

export default function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${open ? 'visible' : 'invisible'} pointer-events-${open ? 'auto' : 'none'}`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <nav
        className={`absolute left-0 top-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col gap-8 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="text-2xl font-bold text-black">🍲 JMD Tiffins</span>
          <button onClick={onClose} aria-label="Close menu" className="p-2 rounded-full hover:bg-gray-100">
            <FaTimes size={22} />
          </button>
        </div>
        <div className="flex flex-col gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 text-black text-lg font-medium hover:underline"
              onClick={onClose}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
} 