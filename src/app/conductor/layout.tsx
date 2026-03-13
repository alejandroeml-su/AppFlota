"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Fuel } from "lucide-react";

export default function ConductorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    // In MVP, we just clear the cookie on the client side or call a logout API
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-10 glass-panel border-x-0 border-t-0 rounded-none px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold">Panel Conductor</h1>
        <button onClick={handleLogout} className="text-danger flex items-center space-x-2 text-sm">
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 w-full max-w-md mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full glass-panel border-x-0 border-b-0 rounded-none flex justify-around items-center p-3 z-10 safe-area-pb">
        <Link 
          href="/conductor/dashboard"
          className={`flex flex-col items-center space-y-1 ${pathname === "/conductor/dashboard" ? "text-primary" : "text-foreground/60"}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium">Resumen</span>
        </Link>
        <div className="relative -top-6">
          <Link 
            href="/conductor/recargar-combustible"
            className={`flex items-center justify-center rounded-full p-4 shadow-lg transition-transform hover:scale-105 active:scale-95 ${pathname === "/conductor/recargar-combustible" ? "bg-primary text-white" : "bg-primary/90 text-white"}`}
          >
            <Fuel size={28} />
          </Link>
        </div>
      </nav>
    </div>
  );
}
