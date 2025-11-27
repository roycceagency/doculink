// src/app/(dashboard)/layout.js
"use client";

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen"> 
        <div key={pathname} className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}