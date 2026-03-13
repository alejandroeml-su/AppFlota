"use client";

import { useEffect, useState } from "react";
import { Users, Truck, LayoutDashboard, Database, ClipboardList, Map, Search, Plus, MoreVertical, Filter, Tag, Navigation as NavIcon, ShieldCheck, UserCircle, X, LayoutGrid, List, Clock, Building2, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getPermissions } from "@/lib/permissions";

export default function AdminFlota() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const pathname = usePathname();

  useEffect(() => {
    const role = (typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]) || 'SUPERADMIN';
    setUser({ name: "E. Martinez", role });
  }, []);

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [conductores, setConductores] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [vehicleStatuses, setVehicleStatuses] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newVehicle, setNewVehicle] = useState({ id: '', brand: '', model: '', year: '', plate: '', type_id: '', odometer: '', status_id: '', driver_id: '', shift_id: '' });
  const [editVehicle, setEditVehicle] = useState<any>(null); // State for editing

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchShifts();
    fetchStatuses();
    fetchTypes();
  }, []);

  const fetchStatuses = async () => {
    const res = await fetch("/api/vehicle-statuses");
    if (res.ok) setVehicleStatuses(await res.json());
  };

  const fetchTypes = async () => {
    const res = await fetch("/api/vehicle-types");
    if (res.ok) setVehicleTypes(await res.json());
  };

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/vehiculos");
      if (res.ok) {
        const data = await res.json();
        setVehiculos(data);
      }
    } catch (error) {
      console.error("Failed to load vehicles", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch("/api/conductores");
      if (res.ok) {
        const data = await res.json();
        setConductores(data);
      }
    } catch (error) {
      console.error("Failed to load drivers", error);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/shifts");
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (error) {
      console.error("Failed to load shifts", error);
    }
  };

  const handleDeleteVehicle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que deseas eliminar este vehículo?")) return;
    
    try {
      const res = await fetch(`/api/vehiculos/${id}`, { method: 'DELETE' });
      if (res.ok) fetchVehicles();
      else alert("Error al eliminar");
    } catch (error) {
       console.error("Error deleting vehicle", error);
    }
  };

  const permissions = getPermissions(user?.role || 'USER');

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:flex-row bg-background">
       <Navigation user={user} title="Flota y Vehículos" />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 w-full mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Gestión de Flota</h2>
            <p className="text-foreground/60">Administra el inventario de vehículos, ambulancias y transportes del hospital.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-foreground/5 border border-glass-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-md flex items-center justify-center transition-all ${
                  viewMode === "cards" 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                }`}
                title="Vista de Tarjetas"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md flex items-center justify-center transition-all ${
                  viewMode === "table" 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                }`}
                title="Vista de Tabla"
              >
                <List size={18} />
              </button>
            </div>
            
             {!permissions.isReadOnly && (
               <>
                <Link 
                  href="/admin/flota/config"
                  className="p-2 bg-black/40 border border-glass-border rounded-lg text-foreground/50 hover:text-white hover:bg-white/5 transition-all"
                  title="Configurar Estados y Tipos"
                >
                  <Settings size={18} />
                </Link>
                
                <button 
                  onClick={() => setIsCreatingVehicle(true)}
                  className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus size={18} className="mr-2" />
                  Nuevo Vehículo
                </button>
               </>
             )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
             <input 
               type="text" 
               placeholder="Buscar por placa, modelo o ID..."
               className="w-full pl-10 pr-4 py-2 bg-black/20 border border-glass-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
             />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center px-3 py-2 bg-black/20 border border-glass-border rounded-lg text-sm hover:bg-white/5 transition-colors">
              <Filter size={16} className="mr-2 text-foreground/70" />
              Filtrar
            </button>
            <button className="flex items-center px-3 py-2 bg-black/20 border border-glass-border rounded-lg text-sm hover:bg-white/5 transition-colors">
              <ShieldCheck size={16} className="mr-2 text-foreground/70" />
              Verificar
            </button>
          </div>
        </div>

        {/* Vehicle Grid MVP */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiculos.map((vehiculo) => (
              <div 
                key={vehiculo.id} 
                onClick={() => setSelectedVehicle(vehiculo.id)}
                className="glass-panel p-0 rounded-xl overflow-hidden hover:border-primary/50 transition-colors group flex flex-col cursor-pointer"
              >
                <div className="p-5 border-b border-white/5 relative bg-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold bg-white/10 px-2 py-0.5 rounded text-white">{vehiculo.id}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${vehiculo.status_color || 'bg-primary/20 text-primary'}`}>
                        {vehiculo.status}
                      </span>
                    </div>
                    {!permissions.isReadOnly && (
                      <div className="flex space-x-1">
                         <button 
                           onClick={(e) => { e.stopPropagation(); setEditVehicle(vehiculo); }} 
                           className="text-foreground/50 hover:text-white transition-colors p-1"
                           title="Editar"
                         >
                           <Tag size={16} />
                         </button>
                         <button 
                           onClick={(e) => handleDeleteVehicle(vehiculo.id, e)} 
                           className="text-danger-500 hover:text-danger-400 transition-colors p-1"
                           title="Eliminar"
                         >
                           <X size={16} />
                         </button>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{vehiculo.brand} {vehiculo.model} {vehiculo.year}</h3>
                  <p className="text-sm text-foreground/60 flex items-center">
                    <Tag size={12} className="mr-1" /> {vehiculo.type}
                  </p>
                </div>

                <div className="p-5 bg-black/20 flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-foreground/50 mb-1">Conductor Asignado</p>
                    <p className="text-sm font-medium text-white flex items-center">
                      <UserCircle size={14} className="mr-1 text-primary" />
                      {vehiculo.driver || "Sin Asignar"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/50 mb-1">Turno</p>
                    <p className="text-sm font-medium text-white flex items-center">
                       <Clock size={14} className="mr-1 text-warning" />
                       {vehiculo.shift_name || "Sin Turno"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/50 mb-1">Placas</p>
                    <p className="text-sm font-medium text-white">{vehiculo.plate}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs text-foreground/50 mb-1">Sede / Ubicación</p>
                    <p className="text-sm font-medium text-white flex items-center">
                       <Building2 size={14} className="mr-1 text-primary" />
                       {vehiculo.sede_name || "Sin Sede"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs text-foreground/50 mb-1">Último Mantenimiento</p>
                    <p className="text-sm font-medium flex items-center text-white">
                       {vehiculo.lastMaintenance}
                    </p>
                  </div>
                </div>

                <div className="p-3 border-t border-white/5 bg-black/40 flex justify-between">
                   <Link 
                     href={`/admin/bitacoras?vehicle=${vehiculo.id}`} 
                     onClick={(e) => e.stopPropagation()}
                     className="text-xs font-medium text-primary hover:text-primary-hover transition-colors px-2 py-1"
                   >
                     Ver Historial
                   </Link>
                   <button 
                     onClick={(e) => e.stopPropagation()}
                     className="text-xs font-medium text-foreground/70 hover:text-white transition-colors px-2 py-1 flex items-center"
                   >
                     <NavIcon size={12} className="mr-1" />
                     Rastrear (Próximamente)
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-glass-border bg-white/5 text-xs uppercase tracking-wider text-foreground/60 font-semibold">
                    <th className="p-4 rounded-tl-xl whitespace-nowrap">Vehículo</th>
                    <th className="p-4 whitespace-nowrap">Estado</th>
                    <th className="p-4 whitespace-nowrap">Tipo</th>
                    <th className="p-4 whitespace-nowrap">Conductor</th>
                    <th className="p-4 whitespace-nowrap">Placas</th>
                    <th className="p-4 rounded-tr-xl whitespace-nowrap">Odómetro / Últ. Mantenimiento</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {vehiculos.map((vehiculo) => (
                    <tr 
                      key={vehiculo.id} 
                      onClick={() => setSelectedVehicle(vehiculo.id)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-primary transition-colors">{vehiculo.brand} {vehiculo.model} {vehiculo.year}</span>
                          <span className="font-mono text-xs text-foreground/50 mt-1">{vehiculo.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full whitespace-nowrap ${vehiculo.status_color || 'bg-primary/20 text-primary'}`}>
                          {vehiculo.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground/80 flex items-center whitespace-nowrap">
                          <Tag size={12} className="mr-1.5 text-foreground/50" /> {vehiculo.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground/80 flex items-center whitespace-nowrap">
                          <UserCircle size={14} className="mr-1.5 text-primary" />
                          {vehiculo.driver || "Sin Asignar"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-white">{vehiculo.plate}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col text-sm">
                          <span className="text-foreground/80">{vehiculo.odometer}</span>
                          <span className="text-xs text-foreground/50 mt-0.5">{vehiculo.lastMaintenance}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {!permissions.isReadOnly && (
                          <div className="flex justify-end space-x-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); setEditVehicle(vehiculo); }} 
                               className="text-foreground/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                               title="Editar"
                             >
                               <Tag size={16} />
                             </button>
                             <button 
                               onClick={(e) => handleDeleteVehicle(vehiculo.id, e)} 
                               className="text-danger-500 hover:text-danger-400 p-2 rounded-lg hover:bg-danger/10 transition-colors"
                               title="Eliminar"
                             >
                               <X size={16} />
                             </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Assigning Driver */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#121214] border border-glass-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white">Asignar Vehículo</h3>
                  <p className="text-sm text-foreground/60 font-mono mt-1">{selectedVehicle}</p>
                </div>
                <button 
                  onClick={() => setSelectedVehicle(null)}
                  className="h-8 w-8 rounded-lg bg-black/40 flex items-center justify-center text-foreground/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Seleccionar Conductor</label>
                   <div className="relative">
                      <select 
                        id="assign-driver-select"
                        className="w-full appearance-none bg-black/40 border border-glass-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white font-medium"
                        defaultValue={vehiculos.find(v => v.id === selectedVehicle)?.driver_id || ""}
                      >
                        <option value="" disabled>Elige un conductor...</option>
                        <option value="">Sin conductor asignado</option>
                        {conductores.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                        ))}
                      </select>
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
                   </div>
                   <p className="text-xs text-foreground/50 mt-1">Solo se muestran los conductores disponibles con licencia vigente.</p>
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Notas de Asignación (Opcional)</label>
                   <textarea 
                     rows={3}
                     placeholder="Ej. Cambio de turno temporal..."
                     className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white resize-none"
                   ></textarea>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3 justify-end">
                <button 
                  onClick={() => setSelectedVehicle(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                     const selectElement = document.getElementById('assign-driver-select') as HTMLSelectElement;
                     const newDriverId = selectElement?.value;
                     if (!newDriverId) return;
                     
                     try {
                         const res = await fetch(`/api/vehiculos/${selectedVehicle}`, {
                             method: "PUT",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ driver_id: newDriverId })
                         });
                         if (res.ok) {
                             fetchVehicles();
                             setSelectedVehicle(null);
                         } else {
                             alert("Error al asignar conductor");
                         }
                     } catch (err) {
                         alert("Error de conexión");
                     }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Guardar Asignación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Creating Vehicle */}
        {isCreatingVehicle && (
          <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5">
                <h3 className="text-xl font-bold text-foreground">Registrar Nuevo Vehículo</h3>
                <button 
                  onClick={() => setIsCreatingVehicle(false)}
                  className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Marca</label>
                     <input 
                       type="text" 
                       placeholder="Ej. Ford"
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newVehicle.brand}
                       onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Modelo</label>
                     <input 
                       type="text" 
                       placeholder="Ej. Transit"
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newVehicle.model}
                       onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Año</label>
                     <input 
                       type="number" 
                       placeholder="2023"
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newVehicle.year}
                       onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                     />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Placas</label>
                     <input 
                       type="text" 
                       placeholder="Ej. HOS-1234"
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newVehicle.plate}
                       onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Tipo de Vehículo</label>
                    <select 
                      className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      value={newVehicle.type_id}
                      onChange={(e) => setNewVehicle({...newVehicle, type_id: e.target.value})}
                    >
                      <option value="">Selecciona tipo...</option>
                      {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Odómetro Inicial (km)</label>
                     <input 
                       type="text" 
                       placeholder="0 km"
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newVehicle.odometer}
                       onChange={(e) => setNewVehicle({...newVehicle, odometer: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Estado Inicial</label>
                     <select 
                       className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newVehicle.status_id}
                       onChange={(e) => setNewVehicle({...newVehicle, status_id: e.target.value})}
                     >
                       <option value="">Selecciona estado...</option>
                       {vehicleStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Turno de Trabajo</label>
                     <select 
                       className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newVehicle.shift_id}
                       onChange={(e) => setNewVehicle({...newVehicle, shift_id: e.target.value})}
                     >
                       <option value="">Sin turno asignado</option>
                       {shifts.map(s => (
                         <option key={s.id} value={s.id}>{s.name} ({s.start_time.substring(0,5)} - {s.end_time.substring(0,5)})</option>
                       ))}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Conductor</label>
                     <select 
                       className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newVehicle.driver_id}
                       onChange={(e) => setNewVehicle({...newVehicle, driver_id: e.target.value})}
                     >
                       <option value="">Sin conductor asignado</option>
                       {conductores.map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                     </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex gap-3 justify-end">
                <button 
                  onClick={() => setIsCreatingVehicle(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                     if (!newVehicle.brand || !newVehicle.model || !newVehicle.plate || !newVehicle.type_id) {
                        alert("Por favor completa los campos principales (Marca, Modelo, Placas, Tipo)");
                        return;
                     }
                     const id = vehicleTypes.find(t => t.id == newVehicle.type_id)?.name.includes("Ambulancia") 
                         ? `AMB-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
                         : `TRANS-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
                     
                     try {
                       const res = await fetch("/api/vehiculos", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ ...newVehicle, id })
                       });
                       if (res.ok) {
                         alert("Vehículo registrado exitosamente.");
                         setIsCreatingVehicle(false);
                         fetchVehicles(); // Refresh list
                          setNewVehicle({ id: '', brand: '', model: '', year: '', plate: '', type_id: '', odometer: '', status_id: '', driver_id: '', shift_id: '' });
                       } else {
                         const errorD = await res.json();
                         alert("Error: " + (errorD.error || "No se pudo registrar"));
                       }
                     } catch (e) {
                       alert("Error de conexión al servidor");
                     }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Agregar Vehículo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing Vehicle */}
        {editVehicle && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#121214] border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-bold text-white">Editar Vehículo {editVehicle.id}</h3>
                <button 
                  onClick={() => setEditVehicle(null)}
                  className="h-8 w-8 rounded-lg bg-black/40 flex items-center justify-center text-foreground/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Marca</label>
                     <input 
                       type="text" 
                       className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                       value={editVehicle.brand}
                       onChange={(e) => setEditVehicle({...editVehicle, brand: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Modelo</label>
                     <input 
                       type="text" 
                       className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                       value={editVehicle.model}
                       onChange={(e) => setEditVehicle({...editVehicle, model: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Año</label>
                     <input 
                       type="number" 
                       className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                       value={editVehicle.year}
                       onChange={(e) => setEditVehicle({...editVehicle, year: e.target.value})}
                     />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Placas</label>
                     <input 
                       type="text" 
                       className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                       value={editVehicle.plate}
                       onChange={(e) => setEditVehicle({...editVehicle, plate: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Tipo de Vehículo</label>
                    <select 
                      className="w-full appearance-none bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                      value={editVehicle.type_id}
                      onChange={(e) => setEditVehicle({...editVehicle, type_id: e.target.value})}
                    >
                      {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Odómetro (km)</label>
                     <input 
                       type="text" 
                       className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                       value={editVehicle.odometer || ''}
                       onChange={(e) => setEditVehicle({...editVehicle, odometer: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Estado</label>
                     <select 
                       className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={editVehicle.status_id}
                       onChange={(e) => setEditVehicle({...editVehicle, status_id: e.target.value})}
                     >
                       {vehicleStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Turno de Trabajo</label>
                     <select 
                       className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={editVehicle.shift_id || ""}
                       onChange={(e) => setEditVehicle({...editVehicle, shift_id: e.target.value})}
                     >
                       <option value="">Sin turno asignado</option>
                       {shifts.map(s => (
                         <option key={s.id} value={s.id}>{s.name}</option>
                       ))}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Conductor</label>
                     <select 
                       className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={editVehicle.driver_id || ""}
                       onChange={(e) => setEditVehicle({...editVehicle, driver_id: e.target.value})}
                     >
                       <option value="">Sin conductor asignado</option>
                       {conductores.map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                     </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3 justify-end">
                <button 
                  onClick={() => setEditVehicle(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                     try {
                       const res = await fetch(`/api/vehiculos/${editVehicle.id}`, {
                         method: "PUT",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                              brand: editVehicle.brand,
                              model: editVehicle.model,
                              year: editVehicle.year,
                              plate: editVehicle.plate,
                              type_id: editVehicle.type_id,
                              status_id: editVehicle.status_id,
                              odometer: editVehicle.odometer,
                              driver_id: editVehicle.driver_id,
                              shift_id: editVehicle.shift_id
                         })
                       });
                       if (res.ok) {
                         alert("Vehículo actualizado exitosamente.");
                         setEditVehicle(null);
                         fetchVehicles();
                       } else {
                         const errorD = await res.json();
                         alert("Error: " + (errorD.error || "No se pudo actualizar"));
                       }
                     } catch (e) {
                       alert("Error de conexión al servidor");
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
