
"use client";

import { useEffect, useState } from "react";
import { 
  Users, Truck, LayoutDashboard, Database, ClipboardList, 
  Map, Clock, Building2, UserCircle, LogOut, ChevronRight, Menu, X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role, getPermissions } from "@/lib/permissions";

interface NavigationProps {
  user: { name: string; role: string } | null;
  title?: string;
}

export default function Navigation({ user, title }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const permissions = getPermissions(user?.role || 'USER');

  const handleLogout = () => {
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} />, show: true },
    { name: "Flota", href: "/admin/flota", icon: <Truck size={20} />, show: true },
    { name: "Sedes", href: "/admin/sedes", icon: <Building2 size={20} />, show: true },
    { name: "Turnos", href: "/admin/turnos", icon: <Clock size={20} />, show: true },
    { name: "Conductores", href: "/admin/conductores", icon: <UserCircle size={20} />, show: true },
    { name: "Bitácoras", href: "/admin/bitacoras", icon: <ClipboardList size={20} />, show: true },
    { name: "Usuarios", href: "/admin/usuarios", icon: <Users size={20} />, show: permissions.canManageUsers },
    { name: "GPS", href: "/admin/mapa", icon: <Map size={20} />, show: true, disabled: true },
  ];

  const activeItems = navItems.filter(item => item.show);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-glass-border flex md:hidden justify-between items-center px-4 z-50">
        <div className="flex items-center space-x-3">
          <Database className="text-primary" size={24} />
          <h1 className="text-lg font-bold text-foreground truncate max-w-[150px]">{title || "AppFlota"}</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-foreground/60 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-y-0 border-l-0 rounded-none h-screen sticky top-0 z-40">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
            <Database className="mr-2 text-primary" size={24} />
            AppFlota
          </h1>
          <p className="text-[10px] text-foreground/40 mt-1 uppercase tracking-[0.3em] font-black">Sistema Integral</p>
        </div>
        
        <div className="px-6 py-4 flex items-center space-x-3 mb-4 bg-foreground/[0.02] border-y border-glass-border group cursor-default">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
            {user?.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-primary font-black uppercase tracking-tighter opacity-70">
              {user?.role === 'SUPERADMIN' ? 'Super Administrador' : 
               user?.role === 'ADMIN' ? 'Administrador' : 'Usuario (Lectura)'}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4 custom-scrollbar">
          {activeItems.map((item) => (
            <Link 
              key={item.href}
              href={item.disabled ? "#" : item.href} 
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                pathname === item.href 
                ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                : item.disabled ? 'opacity-30 cursor-not-allowed' : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${pathname === item.href ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-xs uppercase tracking-widest">{item.name}</span>
              </div>
              {pathname === item.href && <ChevronRight size={14} className="animate-pulse" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-glass-border">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background md:hidden animate-in fade-in duration-300">
          <div className="flex flex-col h-full pt-20 pb-8 px-6">
            <div className="flex items-center space-x-4 mb-8 p-4 glass-panel">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{user?.name}</p>
                <p className="text-xs text-primary font-bold uppercase">{user?.role}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto">
              {activeItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.disabled ? "#" : item.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${
                    pathname === item.href 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  <span className="font-bold text-sm uppercase tracking-widest">{item.name}</span>
                </Link>
              ))}
            </nav>

            <button 
              onClick={handleLogout} 
              className="mt-6 flex items-center justify-center space-x-3 px-5 py-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20"
            >
              <LogOut size={20} />
              <span className="font-bold text-sm uppercase tracking-widest">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Shortcut Bar) */}
      <nav className="fixed bottom-0 w-full bg-background/95 backdrop-blur-2xl border-t border-glass-border flex md:hidden justify-around items-center p-3 z-30 safe-area-pb">
         {activeItems.slice(0, 5).map((item) => (
            <Link 
              key={item.href}
              href={item.disabled ? "#" : item.href} 
              className={`flex flex-col items-center space-y-1 transition-all ${
                pathname === item.href ? 'text-primary scale-110' : 'text-foreground/40 hover:text-foreground/70'
              }`}
            >
               {item.icon}
               <span className="text-[9px] font-bold uppercase tracking-tighter">{item.name.split(' ')[0]}</span>
            </Link>
         ))}
      </nav>
    </>
  );
}
