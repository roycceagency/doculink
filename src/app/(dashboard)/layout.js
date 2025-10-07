// src/app/(dashboard)/layout.js

import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* 'children' representa a página inteira, que agora inclui seu próprio Header */}
        {children}
      </main>
    </div>
  );
}