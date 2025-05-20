import { FaBell } from 'react-icons/fa';

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-border shadow-sm">
      <h1 className="text-2xl font-bold text-black tracking-tight">JMD Tiffins - Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="rounded-full border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 shadow-sm placeholder-gray-400 text-black"
          />
        </div>
        <button className="relative p-2 rounded-full hover:bg-gray-100 text-black">
          <FaBell size={18} className="text-black" />
        </button>
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">
          A
        </div>
      </div>
    </header>
  );
} 