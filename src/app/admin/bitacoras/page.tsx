"use client";

import { useEffect, useState } from "react";
import { Users, Truck, LayoutDashboard, Database, ClipboardList, Map, Search, Plus, Filter, Fuel, Wrench, Calendar, FileText, ArrowRight, X, LayoutGrid, List, Clock, Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getPermissions } from "@/lib/permissions";

export default function AdminBitacoras() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [activeTab, setActiveTab] = useState<"todas" | "combustible" | "mantenimiento">("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isRegistrarCarga, setIsRegistrarCarga] = useState(false);
  const [isCrearOrden, setIsCrearOrden] = useState(false);
  const [selectedSedeFuel, setSelectedSedeFuel] = useState("");
  const [selectedSedeMaint, setSelectedSedeMaint] = useState("");
  const [newFuelLog, setNewFuelLog] = useState({ vehicleId: '', litersFilled: '', totalCost: '', recordedOdometer: '', observations: '' });
  const [newMaintOrder, setNewMaintOrder] = useState({ vehicleId: '', description: '', expectedCost: '', taller: '' });
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [availableSedes, setAvailableSedes] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const vehicleParam = params.get("vehicle");
      if (vehicleParam) {
        setSearchQuery(vehicleParam);
      }
    }
    const role = (typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]) || 'SUPERADMIN';
    setUser({ name: "E. Martinez", role });
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [vRes, sRes, bRes] = await Promise.all([
        fetch('/api/vehiculos'),
        fetch('/api/sedes'),
        fetch('/api/bitacoras')
      ]);
      if (vRes.ok) setAvailableVehicles(await vRes.json());
      if (sRes.ok) setAvailableSedes(await sRes.json());
      if (bRes.ok) setBitacoras(await bRes.json());
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const [bitacoras, setBitacoras] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const handleSaveFuelLog = async () => {
    try {
      const res = await fetch('/api/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFuelLog)
      });
      if (res.ok) {
        setIsRegistrarCarga(false);
        setNewFuelLog({ vehicleId: '', litersFilled: '', totalCost: '', recordedOdometer: '', observations: '' });
        fetchInitialData();
      } else {
        const data = await res.json();
        alert(data.message || "Error al registrar carga");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };
  const handleVehicleChangeFuel = (vId: string) => {
    const selected = availableVehicles.find(v => v.id === vId);
    setNewFuelLog({
      ...newFuelLog,
      vehicleId: vId,
      recordedOdometer: selected ? selected.odometer.replace(/[^0-9]/g, '') : ''
    });
  };

  const handleVehicleChangeMaint = (vId: string) => {
    setNewMaintOrder({ ...newMaintOrder, vehicleId: vId });
  };

  const handleSaveMaintOrder = async () => {
    try {
      const res = await fetch('/api/maintenance-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaintOrder)
      });
      if (res.ok) {
        setIsCrearOrden(false);
        setNewMaintOrder({ vehicleId: '', description: '', expectedCost: '', taller: '' });
        fetchInitialData();
      } else {
        alert("Error al crear orden");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const handleDeleteLog = async (id: number, type: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;
    
    try {
      const endpoint = type === 'combustible' ? '/api/fuel-logs' : '/api/maintenance-orders';
      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        fetchInitialData();
      } else {
        alert("Error al eliminar el registro");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const filteredLogs = bitacoras.filter(log => {
     const matchesTab = activeTab === "todas" || log.type === activeTab;
     const matchesSearch = searchQuery === "" || 
                           log.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           log.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.id.toLowerCase().includes(searchQuery.toLowerCase());
     return matchesTab && matchesSearch;
  });

  const getIconForType = (type: string) => {
    if (type === "combustible") return <Fuel size={18} className="text-primary" />;
    return <Wrench size={18} className="text-warning" />;
  };

  const getBadgeForType = (type: string) => {
    if (type === "combustible") return <span className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">Combustible</span>;
    return <span className="bg-warning/20 text-warning border border-warning/30 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">Mantenimiento</span>;
  };

  const permissions = getPermissions(user?.role || 'USER');

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:flex-row bg-background">
       <Navigation user={user} title="Bitácoras" />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 w-full mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Historial y Bitácoras</h2>
            <p className="text-foreground/60">Registros de recargas de combustible y mantenimientos preventivos/correctivos.</p>
          </div>
          {!permissions.isReadOnly && (
            <div className="flex gap-3 w-full md:w-auto">
               <button 
                 onClick={() => setIsRegistrarCarga(true)} 
                 className="flex-1 md:flex-none flex justify-center items-center px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg transition-all active:scale-95 whitespace-nowrap"
               >
                 <Fuel size={18} className="mr-2" />
                 <span className="text-sm font-bold">Registrar Carga</span>
               </button>
               <button 
                 onClick={() => setIsCrearOrden(true)} 
                 className="flex-1 md:flex-none flex justify-center items-center px-4 py-2 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30 rounded-lg transition-all active:scale-95 whitespace-nowrap"
               >
                 <Wrench size={18} className="mr-2" />
                 <span className="text-sm font-bold">Crear Orden</span>
               </button>
            </div>
          )}
        </div>

        {/* Toolbar & Tabs */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-start lg:items-center">
          
          {/* Tabs */}
          <div className="flex bg-foreground/5 p-1 rounded-lg border border-glass-border w-full lg:w-auto">
             <button 
                onClick={() => setActiveTab("todas")}
                className={`flex-1 lg:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'todas' ? 'bg-foreground/10 text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
             >
                Todas las Actividades
             </button>
             <button 
                onClick={() => setActiveTab("combustible")}
                className={`flex-1 lg:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'combustible' ? 'bg-primary/20 text-primary shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
             >
                Combustible
             </button>
             <button 
                onClick={() => setActiveTab("mantenimiento")}
                className={`flex-1 lg:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'mantenimiento' ? 'bg-warning/20 text-warning shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
             >
                Mantenimientos
             </button>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={16} />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Buscar vehículo, chofer o ID..."
                 className="w-full pl-9 pr-4 py-2 bg-black/20 border border-glass-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
               />
            </div>
            <button className="flex items-center px-3 py-2 bg-black/20 border border-glass-border rounded-lg text-sm hover:bg-white/5 transition-colors">
              <Filter size={16} className="md:mr-2 text-foreground/70" />
              <span className="hidden md:inline">Filtros Avanzados</span>
            </button>

            <div className="flex bg-black/40 p-1 rounded-lg border border-glass-border">
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
        </div>

        {/* Logs Timeline / View */}
        {viewMode === "list" ? (
          <div className="glass-panel overflow-hidden rounded-xl">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              <div className="col-span-2 pl-2">Fecha y Hora</div>
              <div className="col-span-2">Vehículo</div>
              <div className="col-span-2">Tipo / Categoría</div>
              <div className="col-span-3">Detalles y Chofer</div>
              <div className="col-span-2 text-right">Costo</div>
              <div className="col-span-1 text-center">Ticket</div>
            </div>
            
            <div className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:items-center hover:bg-white/5 transition-colors group">
                  
                  {/* Mobile View Header - only shows on small screens */}
                  <div className="flex justify-between items-start md:hidden mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${log.type === 'combustible' ? 'bg-primary/20' : 'bg-warning/20'}`}>
                        {getIconForType(log.type)}
                      </div>
                      <div>
                        <span className="font-bold text-white text-lg">{log.vehicle}</span>
                        <p className="text-xs text-foreground/50">{log.date}</p>
                      </div>
                    </div>
                    {getBadgeForType(log.type)}
                  </div>

                  {/* Desktop: Date */}
                  <div className="hidden md:flex flex-col col-span-2 pl-2">
                     <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{log.date.split(',')[0]}</span>
                     <span className="text-xs text-foreground/50">{log.date.split(',')[1]}</span>
                  </div>

                  {/* Desktop: Vehicle */}
                  <div className="hidden md:flex flex-col col-span-2">
                     <span className="inline-flex max-w-fit items-center px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-white mb-1">
                       {log.vehicle_name}
                     </span>
                     <span className="text-xs text-foreground/50 font-mono">Odóm: {log.odometer}</span>
                  </div>

                  {/* Desktop: Type Badge */}
                  <div className="hidden md:block col-span-2">
                     {getBadgeForType(log.type)}
                  </div>

                  {/* Details (Both Mobile and Desktop) */}
                  <div className="col-span-12 md:col-span-3 flex flex-col">
                     <span className="text-sm text-foreground/90 font-medium mb-0.5">{log.details}</span>
                     <span className="text-xs text-foreground/60 flex items-center">
                       <Users size={10} className="mr-1" /> {log.driver}
                     </span>
                     {/* Mobile Extra info */}
                     <span className="md:hidden text-xs text-foreground/50 font-mono mt-1">Odóm: {log.odometer}</span>
                  </div>

                  {/* Cost */}
                  <div className="col-span-12 md:col-span-2 flex md:justify-end items-center md:items-start mt-2 md:mt-0">
                     <span className="text-sm md:text-base font-bold text-white">{log.cost}</span>
                  </div>

                  {/* View Button */}
                  <div className="col-span-12 md:col-span-1 flex justify-end gap-2">
                     <button className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-foreground/60 hover:text-white hover:bg-white/10 transition-colors">
                       <FileText size={16} />
                     </button>
                     {!permissions.isReadOnly && (
                       <button 
                         onClick={() => handleDeleteLog(log.id, log.type)}
                         className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-danger-500 hover:text-danger-400 hover:bg-white/10 transition-colors"
                       >
                         <X size={16} />
                       </button>
                     )}
                     <button className="md:hidden w-full flex items-center justify-center space-x-2 py-2 mt-2 bg-black/40 rounded-lg text-sm font-medium text-foreground/80 hover:text-white transition-colors border border-glass-border">
                       <FileText size={16} />
                       <span>Ver Ticket Detallado</span>
                     </button>
                  </div>

                </div>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center">
                 <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center text-foreground/40 mb-4">
                   <Search size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-1">No hay registros</h3>
                 <p className="text-sm text-foreground/60">No se encontraron bitácoras para los filtros seleccionados.</p>
              </div>
            )}
          </div>
        ) : (
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="glass-panel overflow-hidden rounded-xl border border-white/5 hover:border-white/10 transition-all group flex flex-col">
                <div className="p-5 border-b border-white/5 bg-white/5 relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                       <div className={`p-2 rounded-lg ${log.type === 'combustible' ? 'bg-primary/20' : 'bg-warning/20'}`}>
                          {getIconForType(log.type)}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs text-foreground/50 font-medium tracking-wide uppercase">{log.type}</span>
                          <span className="text-xs text-foreground/40">{log.date}</span>
                       </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-foreground/10 px-2 py-0.5 rounded text-foreground/50">{log.id}</span>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-1">{log.vehicle_name}</h4>
                  <p className="text-sm text-foreground/70 line-clamp-2 min-h-[40px]">{log.details}</p>
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-foreground/40 uppercase font-bold tracking-tight">Chofer / Responsable</span>
                      <span className="text-sm font-medium text-foreground flex items-center">
                        <Users size={12} className="mr-1.5 text-primary" /> {log.driver}
                      </span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[10px] text-foreground/40 uppercase font-bold tracking-tight">Costo</span>
                      <span className="text-lg font-bold text-foreground">{log.cost.replace(' MXN', '')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-glass-border font-mono text-xs">
                    <span className="text-foreground/40">KMS: {log.odometer}</span>
                    <div className="flex gap-2">
                       {!permissions.isReadOnly && (
                        <button 
                          onClick={() => handleDeleteLog(log.id, log.type)}
                          className="text-danger-500 hover:text-danger-400 p-1"
                        >
                          <X size={14} />
                        </button>
                       )}
                      <button className="text-primary hover:underline flex items-center group-hover:translate-x-1 transition-transform">
                        Detall <ArrowRight size={12} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="col-span-full glass-panel p-12 text-center flex flex-col items-center">
                 <div className="h-16 w-16 bg-foreground/5 rounded-full flex items-center justify-center text-foreground/40 mb-4">
                   <Search size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-foreground mb-1">No hay registros</h3>
                 <p className="text-sm text-foreground/60">No se encontraron bitácoras para los filtros seleccionados.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Registrar Carga Modal */}
      {isRegistrarCarga && (
        <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5">
              <h3 className="text-xl font-bold text-foreground flex items-center">
                <Fuel className="mr-2 text-primary" size={20} />
                Registrar Carga de Combustible
              </h3>
              <button 
                onClick={() => setIsRegistrarCarga(false)}
                className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Filtrar por Sede</label>
                    <select 
                      className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none"
                      value={selectedSedeFuel}
                      onChange={(e) => setSelectedSedeFuel(e.target.value)}
                    >
                      <option value="">Todas las sedes</option>
                      {availableSedes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Vehículo</label>
                    <select 
                      className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none"
                      value={newFuelLog.vehicleId}
                      onChange={(e) => handleVehicleChangeFuel(e.target.value)}
                    >
                      <option value="">Selecciona vehículo</option>
                      {availableVehicles
                        .filter(v => !selectedSedeFuel || v.sede_name === selectedSedeFuel)
                        .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate ? `[${v.plate}] ` : ''}{v.brand || 'Vehículo'} {v.model || v.id} {v.year ? `(${v.year})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Litros Cargados</label>
                   <input 
                     type="number" step="0.01"
                     className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                     placeholder="0.00"
                     value={newFuelLog.litersFilled}
                     onChange={(e) => setNewFuelLog({...newFuelLog, litersFilled: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Costo Total ($)</label>
                   <input 
                     type="number" step="0.01"
                     className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                     placeholder="0.00"
                     value={newFuelLog.totalCost}
                     onChange={(e) => setNewFuelLog({...newFuelLog, totalCost: e.target.value})}
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground/80">Odómetro Actual (km)</label>
                 <input 
                   type="number" 
                   className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                   placeholder="Kilometraje al cargar"
                   value={newFuelLog.recordedOdometer}
                   onChange={(e) => setNewFuelLog({...newFuelLog, recordedOdometer: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground/80">Observaciones (Opcional)</label>
                 <textarea 
                   rows={2}
                   className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                   placeholder="Bomba #4, ticket no legible, etc."
                   value={newFuelLog.observations}
                   onChange={(e) => setNewFuelLog({...newFuelLog, observations: e.target.value})}
                 />
               </div>
            </div>

            <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex gap-3 justify-end mt-auto">
              <button 
                onClick={() => setIsRegistrarCarga(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveFuelLog}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Guardar Recarga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crear Orden de Mantenimiento Modal */}
      {isCrearOrden && (
        <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5">
              <h3 className="text-xl font-bold text-foreground flex items-center">
                <Wrench className="mr-2 text-warning" size={20} />
                Crear Orden de Mantenimiento
              </h3>
              <button 
                onClick={() => setIsCrearOrden(false)}
                className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Filtrar por Sede</label>
                     <select 
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-warning text-foreground appearance-none"
                       value={selectedSedeMaint}
                       onChange={(e) => setSelectedSedeMaint(e.target.value)}
                     >
                       <option value="">Todas las sedes</option>
                       {availableSedes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Vehículo</label>
                     <select 
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-warning text-foreground appearance-none"
                       value={newMaintOrder.vehicleId}
                       onChange={(e) => handleVehicleChangeMaint(e.target.value)}
                     >
                       <option value="">Selecciona vehículo</option>
                       {availableVehicles
                         .filter(v => !selectedSedeMaint || v.sede_name === selectedSedeMaint)
                         .map((v) => (
                          <option key={v.id} value={v.id}>
                             {v.plate ? `[${v.plate}] ` : ''}{v.brand || 'Vehículo'} {v.model || v.id} {v.year ? `(${v.year})` : ''}
                          </option>
                       ))}
                     </select>
                   </div>
                </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground/80">Descripción del Trabajo</label>
                 <textarea 
                   rows={3}
                   className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-warning text-foreground resize-none"
                   placeholder="Detalla qué se va a revisar/arreglar..."
                   value={newMaintOrder.description}
                   onChange={(e) => setNewMaintOrder({...newMaintOrder, description: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Costo Estimado ($)</label>
                   <input 
                     type="number" step="0.01"
                     className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-warning text-foreground"
                     placeholder="0.00"
                     value={newMaintOrder.expectedCost}
                     onChange={(e) => setNewMaintOrder({...newMaintOrder, expectedCost: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/80">Taller Asignado</label>
                   <select 
                     className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-warning text-foreground appearance-none"
                     value={newMaintOrder.taller}
                     onChange={(e) => setNewMaintOrder({...newMaintOrder, taller: e.target.value})}
                   >
                     <option value="">Selecciona Taller</option>
                     <option value="Taller Interno">Taller Interno Hospital</option>
                     <option value="Agencia Autorizada">Agencia Autorizada</option>
                     <option value="Taller Externo B">Taller Externo B</option>
                   </select>
                 </div>
               </div>
            </div>

            <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex gap-3 justify-end mt-auto">
              <button 
                onClick={() => setIsCrearOrden(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveMaintOrder}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-warning hover:bg-warning/80 text-black shadow-lg shadow-warning/20 transition-all active:scale-95"
              >
                Guardar Orden
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
