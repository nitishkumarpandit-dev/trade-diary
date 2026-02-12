"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { User } from "next-auth";

export default function DashboardWrapper({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: User;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark transition-colors duration-300 pt-[70px] overflow-x-hidden">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
      <div className="flex w-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
        <main className="flex-1 w-screen md:ml-[250px] min-h-[calc(100vh-70px)]">
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
