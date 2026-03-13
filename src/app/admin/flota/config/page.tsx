"use client";

import { useEffect, useState } from "react";
import { Truck, LayoutDashboard, Database, ClipboardList, Users, Clock, Building2, Plus, X, Tag, Settings, Save, Palette, Type } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function VehicleConfig() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // State for new items
  const [newStatus, setNewStatus] = useState({ name: '', color_code: 'bg-primary/20 text-primary' });
  const [newType, setNewType] = useState({ name: '', icon_name: 'Truck' });

  useEffect(() => {
    setUser({ name: "E. Martinez", role: "SUPERADMIN" });
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, typeRes] = await Promise.all([
        fetch("/api/vehicle-statuses"),
        fetch("/api/vehicle-types")
      ]);
      if (statusRes.ok) setStatuses(await statusRes.json());
      if (typeRes.ok) setTypes(await typeRes.json());
    } catch (error) {
      console.error("Error loading config data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const deleteStatus = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este estado?")) return;
    try {
      const res = await fetch(`/api/vehicle-statuses?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteType = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este tipo?")) return;
    try {
      const res = await fetch(`/api/vehicle-types?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const createStatus = async () => {
    if (!newStatus.name) return;
    try {
      const res = await fetch("/api/vehicle-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus)
      });
      if (res.ok) {
        setNewStatus({ name: '', color_code: 'bg-primary/20 text-primary' });
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const createType = async () => {
    if (!newType.name) return;
    try {
      const res = await fetch("/api/vehicle-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newType)
      });
      if (res.ok) {
        setNewType({ name: '', icon_name: 'Truck' });
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:flex-row bg-background">
       <Navigation user={user} title="Configuración" />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Configuración de Flota</h2>
            <p className="text-foreground/60">Administra los estados y tipos de vehículos disponibles en el sistema.</p>
          </div>
          <Link href="/admin/flota" className="px-4 py-2 bg-foreground/5 border border-glass-border rounded-lg text-sm text-foreground/70 hover:text-foreground transition-colors">
            Volver a Flota
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Statuses Section */}
          <section className="glass-panel p-6 rounded-2xl flex flex-col h-full border-t-4 border-t-primary">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground flex items-center">
                <Palette className="mr-2 text-primary" size={20} />
                Estados de Vehículo
              </h3>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-foreground/50 font-bold uppercase">Nombre del Estado</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Activo, Taller..." 
                    className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    value={newStatus.name}
                    onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-foreground/50 font-bold uppercase">Clase CSS (Colores)</label>
                  <select 
                    className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    value={newStatus.color_code}
                    onChange={(e) => setNewStatus({...newStatus, color_code: e.target.value})}
                  >
                    <option value="bg-primary/20 text-primary">Azul (Primary)</option>
                    <option value="bg-success/20 text-success">Verde (Success)</option>
                    <option value="bg-warning/20 text-warning">Amarillo (Warning)</option>
                    <option value="bg-danger/20 text-danger-500">Rojo (Danger)</option>
                    <option value="bg-foreground/10 text-foreground">Tema (Foreground)</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={createStatus}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all"
              >
                <Plus size={16} />
                <span>Agregar Estado</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-2">
              {statuses.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-3 bg-foreground/5 border border-glass-border rounded-xl group transition-all hover:border-primary/30">
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${status.color_code}`}>
                      {status.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteStatus(status.id)}
                    className="p-1.5 rounded-lg text-foreground/30 hover:text-danger-500 hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Types Section */}
          <section className="glass-panel p-6 rounded-2xl flex flex-col h-full border-t-4 border-t-warning">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground flex items-center">
                <Type className="mr-2 text-warning" size={20} />
                Tipos de Vehículo
              </h3>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-foreground/50 font-bold uppercase">Nombre del Tipo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Ambulancia, Camión..." 
                    className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-warning text-foreground"
                    value={newType.name}
                    onChange={(e) => setNewType({...newType, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-foreground/50 font-bold uppercase">Icono (Lucide)</label>
                  <select 
                    className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-warning text-foreground"
                    value={newType.icon_name}
                    onChange={(e) => setNewType({...newType, icon_name: e.target.value})}
                  >
                    <option value="Truck">Truck (Camión)</option>
                    <option value="Ambulance">Ambulance (Ambulancia)</option>
                    <option value="Car">Car (Auto)</option>
                    <option value="Bus">Bus (Microbús)</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={createType}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-warning hover:opacity-90 text-black font-bold rounded-lg transition-all"
              >
                <Plus size={16} />
                <span>Agregar Tipo</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-2">
              {types.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group transition-all hover:border-warning/30">
                  <div className="flex items-center space-x-3 text-white">
                    <Tag size={16} className="text-warning/50" />
                    <span className="text-sm font-medium">{type.name}</span>
                    <span className="text-[10px] text-foreground/40 italic">({type.icon_name})</span>
                  </div>
                  <button 
                    onClick={() => deleteType(type.id)}
                    className="p-1.5 rounded-lg text-foreground/30 hover:text-danger-500 hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
