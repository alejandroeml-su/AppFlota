"use client";

import { useEffect, useState } from "react";
import { Users, Truck, LayoutDashboard, Database, ClipboardList, Map, Search, Plus, Tag, ShieldCheck, UserCircle, X, LayoutGrid, List, Clock, Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getPermissions } from "@/lib/permissions";

export default function AdminConductores() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [conductores, setConductores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreatingDriver, setIsCreatingDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', license_number: '', phone: '', status: 'Activo' });
  const [editDriver, setEditDriver] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const role = (typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]) || 'SUPERADMIN';
    setUser({ name: "E. Martinez", role });
    fetchDrivers();
  }, []);

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/conductores");
      if (res.ok) {
        const data = await res.json();
        setConductores(data);
      }
    } catch (error) {
      console.error("Failed to load drivers", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriver = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que deseas eliminar a este conductor?")) return;
    
    try {
        const res = await fetch(`/api/conductores/${id}`, { method: 'DELETE' });
        if (res.ok) fetchDrivers();
        else alert("Error al eliminar");
    } catch (error) {
        console.error("Error deleting driver", error);
    }
  };

  const permissions = getPermissions(user?.role || 'USER');

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:flex-row bg-background">
       <Navigation user={user} title="Conductores" />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 w-full mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Gestión de Conductores</h2>
            <p className="text-foreground/60">Administra al personal encargado de manejar los vehículos.</p>
          </div>
          {!permissions.isReadOnly && (
            <button 
               onClick={() => setIsCreatingDriver(true)}
               className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
            >
               <Plus size={18} className="mr-2" />
               Nuevo Conductor
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
             <input 
               type="text" 
               placeholder="Buscar por nombre, licencia..."
               className="w-full pl-10 pr-4 py-2 bg-foreground/5 border border-glass-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
             />
          </div>
          <div className="flex bg-black/40 p-1 rounded-lg border border-glass-border self-end md:self-auto">
             <button 
               onClick={() => setViewMode("list")}
               className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-foreground/40 hover:text-white'}`}
               title="Vista de Lista"
             >
               <List size={18} />
             </button>
             <button 
               onClick={() => setViewMode("grid")}
               className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-foreground/40 hover:text-white'}`}
               title="Vista de Cuadrícula"
             >
               <LayoutGrid size={18} />
             </button>
          </div>
        </div>

        {/* Drivers Grid / List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conductores.map((conductor) => (
               <div 
                 key={conductor.id} 
                 className="glass-panel p-0 rounded-xl overflow-hidden hover:border-primary/50 transition-colors group flex flex-col"
               >
                 <div className="p-5 border-b border-white/5 relative bg-white/5">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center space-x-2">
                       <span className="font-mono text-sm font-bold bg-white/10 px-2 py-0.5 rounded text-white">{conductor.id}</span>
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                         conductor.status === 'Activo' ? 'bg-success/20 text-success' : 
                         conductor.status === 'Vacaciones' ? 'bg-warning/20 text-warning' : 
                         'bg-danger/20 text-danger'
                       }`}>
                         {conductor.status}
                       </span>
                     </div>
                     {!permissions.isReadOnly && (
                        <div className="flex space-x-1">
                           <button 
                             onClick={() => setEditDriver(conductor)} 
                             className="text-foreground/50 hover:text-white transition-colors p-1"
                             title="Editar"
                           >
                             <Tag size={16} />
                           </button>
                           <button 
                             onClick={(e) => handleDeleteDriver(conductor.id, e)} 
                             className="text-danger-500 hover:text-danger-400 transition-colors p-1"
                             title="Eliminar"
                           >
                             <X size={16} />
                           </button>
                        </div>
                     )}
                   </div>
                   <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{conductor.name}</h3>
                   <p className="text-sm text-foreground/60 font-mono">
                     Lic. {conductor.license_number}
                   </p>
                 </div>
                 
                 {conductor.phone && (
                     <div className="p-5 bg-black/20 flex-1">
                        <p className="text-xs text-foreground/50 mb-1">Teléfono de Contacto</p>
                        <p className="text-sm font-medium text-white">{conductor.phone}</p>
                     </div>
                 )}
               </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel overflow-hidden rounded-xl">
             <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                <div className="col-span-1 pl-2">ID</div>
                <div className="col-span-4">Nombre Conductor</div>
                <div className="col-span-2">Licencia</div>
                <div className="col-span-2">Teléfono</div>
                <div className="col-span-2 text-center">Estado</div>
                <div className="col-span-1 text-right">Acciones</div>
             </div>
             <div className="divide-y divide-white/5">
                {conductores.map((conductor) => (
                  <div key={conductor.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                    <div className="md:col-span-1">
                      <span className="font-mono text-sm font-bold text-foreground/40">{conductor.id}</span>
                    </div>
                    <div className="md:col-span-4">
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{conductor.name}</p>
                    </div>
                    <div className="md:col-span-2">
                       <span className="text-xs text-foreground/60 font-mono">{conductor.license_number}</span>
                    </div>
                    <div className="md:col-span-2">
                       <span className="text-sm text-foreground/70">{conductor.phone || '—'}</span>
                    </div>
                    <div className="md:col-span-2 flex justify-center">
                       <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                         conductor.status === 'Activo' ? 'bg-success/20 text-success' : 
                         conductor.status === 'Vacaciones' ? 'bg-warning/20 text-warning' : 
                         'bg-danger/20 text-danger'
                       }`}>
                         {conductor.status}
                       </span>
                    </div>
                    <div className="md:col-span-1 flex justify-end space-x-2">
                       <button onClick={() => setEditDriver(conductor)} className="p-1.5 rounded-lg bg-black/40 text-foreground/50 hover:text-white hover:bg-white/10 transition-colors">
                          <Tag size={14} />
                       </button>
                       <button onClick={(e) => handleDeleteDriver(conductor.id, e)} className="p-1.5 rounded-lg bg-black/40 text-danger-500 hover:text-danger-400 hover:bg-white/10 transition-colors">
                          <X size={14} />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Modal for Creating Driver */}
        {isCreatingDriver && (
          <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5">
                <h3 className="text-xl font-bold text-foreground">Registrar Nuevo Conductor</h3>
                <button 
                  onClick={() => setIsCreatingDriver(false)}
                  className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Nombre Completo</label>
                   <input 
                     type="text" 
                     className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                     value={newDriver.name}
                     onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Número de Licencia</label>
                     <input 
                       type="text" 
                       className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                       value={newDriver.license_number}
                       onChange={(e) => setNewDriver({...newDriver, license_number: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Teléfono (Opcional)</label>
                      <input 
                        type="text" 
                        className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        value={newDriver.phone}
                        onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                      />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Estado Inicial</label>
                    <select 
                      className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      value={newDriver.status}
                      onChange={(e) => setNewDriver({...newDriver, status: e.target.value})}
                    >
                     <option value="Activo">Activo</option>
                     <option value="Inactivo">Inactivo</option>
                     <option value="Vacaciones">Vacaciones</option>
                   </select>
                </div>
              </div>

              <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex gap-3 justify-end">
                <button 
                  onClick={() => setIsCreatingDriver(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                     if (!newDriver.name || !newDriver.license_number) {
                        alert("Por favor completa el nombre y licencia.");
                        return;
                     }
                     try {
                       const res = await fetch("/api/conductores", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(newDriver)
                       });
                       if (res.ok) {
                         setIsCreatingDriver(false);
                         fetchDrivers();
                         setNewDriver({ name: '', license_number: '', phone: '', status: 'Activo' });
                       } else {
                         const errorD = await res.json();
                         alert("Error: " + (errorD.error || "No se pudo registrar"));
                       }
                     } catch (e) {
                       alert("Error de conexión");
                     }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center"
                >
                  Guardar Conductor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing Driver */}
        {editDriver && (
          <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
             {/* Edit Driver form reusing same structure as Create... */}
            <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5">
                <h3 className="text-xl font-bold text-foreground">Editar Conductor {editDriver.id}</h3>
                <button 
                  onClick={() => setEditDriver(null)}
                  className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Nombre Completo</label>
                   <input 
                     type="text" 
                     className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                     value={editDriver.name}
                     onChange={(e) => setEditDriver({...editDriver, name: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Número de Licencia</label>
                      <input 
                        type="text" 
                        className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        value={editDriver.license_number}
                        onChange={(e) => setEditDriver({...editDriver, license_number: e.target.value})}
                      />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Teléfono (Opcional)</label>
                      <input 
                        type="text" 
                        className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        value={editDriver.phone || ''}
                        onChange={(e) => setEditDriver({...editDriver, phone: e.target.value})}
                      />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Estado</label>
                    <select 
                      className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      value={editDriver.status}
                      onChange={(e) => setEditDriver({...editDriver, status: e.target.value})}
                    >
                     <option value="Activo">Activo</option>
                     <option value="Inactivo">Inactivo</option>
                     <option value="Vacaciones">Vacaciones</option>
                   </select>
                </div>
              </div>

              <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex gap-3 justify-end">
                <button 
                  onClick={() => setEditDriver(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                     try {
                       const res = await fetch(`/api/conductores/${editDriver.id}`, {
                         method: "PUT",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(editDriver)
                       });
                       if (res.ok) {
                         setEditDriver(null);
                         fetchDrivers();
                       } else {
                         const errorD = await res.json();
                         alert("Error: " + (errorD.error || "No se pudo actualizar"));
                       }
                     } catch (e) {
                       alert("Error de conexión");
                     }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
