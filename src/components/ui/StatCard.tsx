'use client';

import React from 'react'; // Assuming React is needed for JSX

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow p-5 min-w-[180px] border border-border">
      <div className="p-3 rounded-full text-black bg-white border border-border text-xl">{icon}</div>
      <div>
        <div className="text-xs text-black font-medium mb-1">{title}</div>
        <div className="text-lg font-bold text-black">{value}</div>
      </div>
    </div>
  );
} 