"use client";

import { useEffect, useState } from "react";
import { Users, Truck, AlertCircle, LayoutDashboard, Database, Activity, Map, ClipboardList, Clock, Building2, Download, FileJson, FileText, Filter } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Navigation from "@/components/Navigation";
import { getPermissions } from "@/lib/permissions";

export default function AdminDashboard() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    // Basic session simulation
    const role = (typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]) || 'SUPERADMIN';
    setUser({ name: "E. Martinez", role });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, vehiclesRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/vehiculos")
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setVehiculos(vehiclesData);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(vehiculos.map(v => ({
      ID: v.id,
      Vehículo: `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim(),
      Tipo: v.type,
      Placas: v.plate,
      Estado: v.status,
      Conductor: v.driver || 'N/A',
      Turno: v.shift_name || 'N/A',
      Sede: v.sede_name || 'N/A'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Flota");
    XLSX.writeFile(workbook, "Estado_Actual_Flota.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Vehículo", "Tipo", "Placas", "Estado", "Sede"];
    const tableRows = vehiculos.map(v => [
      v.id, `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim(), v.type, v.plate, v.status, v.sede_name || 'N/A'
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Estado Actual de la Flota - AppFlota", 14, 15);
    doc.save("Estado_Actual_Flota.pdf");
  };

  const filteredVehicles = vehiculos.filter(v => 
    v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.brand && v.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const permissions = getPermissions(user?.role || 'USER');

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:flex-row bg-background">
      <Navigation user={user} title="Visión General" />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
        
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">Visión General</h2>
          <p className="text-sm md:text-base text-foreground/60">Monitoreo del sistema y métricas clave de la flota del Hospital.</p>
        </div>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/flota" className="glass-panel p-5 rounded-xl border-l-4 border-l-primary hover:bg-foreground/5 transition-colors cursor-pointer group block">
            <div className="flex justify-between items-start mb-4">
               <div className="bg-primary/20 p-2 rounded-lg text-primary transform group-hover:scale-110 transition-transform">
                 <Truck size={24} />
               </div>
               <span className="text-2xl font-bold text-foreground">{stats?.genericStats?.total_vehicles || 0}</span>
            </div>
            <p className="text-sm text-foreground/60 font-medium">Vehículos Registrados</p>
          </Link>

          <Link href="/admin/conductores" className="glass-panel p-5 rounded-xl border-l-4 border-l-success hover:bg-foreground/5 transition-colors cursor-pointer group block">
            <div className="flex justify-between items-start mb-4">
               <div className="bg-success/20 p-2 rounded-lg text-success transform group-hover:scale-110 transition-transform">
                 <Users size={24} />
               </div>
               <span className="text-2xl font-bold text-foreground">{stats?.genericStats?.total_drivers || 0}</span>
            </div>
            <p className="text-sm text-foreground/60 font-medium">Conductores Activos</p>
          </Link>

          <Link href="/admin/flota" className="glass-panel p-5 rounded-xl border-l-4 border-l-warning hover:bg-foreground/5 transition-colors cursor-pointer group block">
            <div className="flex justify-between items-start mb-4">
               <div className="bg-warning/20 p-2 rounded-lg text-warning transform group-hover:scale-110 transition-transform">
                 <Activity size={24} />
               </div>
               <span className="text-2xl font-bold text-foreground">{vehiculos.filter(v => v.status === 'Mantenimiento').length}</span>
            </div>
            <p className="text-sm text-foreground/60 font-medium">En Mantenimiento</p>
          </Link>

          <Link href="/admin/sedes" className="glass-panel p-5 rounded-xl border-l-4 border-l-danger hover:bg-foreground/5 transition-colors cursor-pointer group block">
            <div className="flex justify-between items-start mb-4">
               <div className="bg-danger/20 p-2 rounded-lg text-danger transform group-hover:scale-110 transition-transform">
                 <Building2 size={24} />
               </div>
               <span className="text-2xl font-bold text-foreground">{stats?.genericStats?.total_sedes || 0}</span>
            </div>
            <p className="text-sm text-foreground/60 font-medium">Sedes Operativas</p>
          </Link>
        </div>

        {/* Visualizations Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Building2 className="mr-2 text-primary" size={18} />
                  Turnos por Sede
                </h3>
             </div>
             <div className="space-y-4">
                {stats?.shiftsBySede?.map((item: any) => (
                  <div key={item.id} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-foreground/80 font-medium">{item.name}</span>
                      <span className="text-xs text-primary font-bold">{item.count} turnos</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2">
                       <div 
                         className="bg-primary h-2 rounded-full transition-all duration-1000 shadow-sm shadow-primary/30" 
                         style={{ width: `${Math.min((item.count / 10) * 100, 100)}%` }}
                       ></div>
                    </div>
                  </div>
                )) || <p className="text-xs text-foreground/40 text-center py-4 italic">No hay datos suficientes</p>}
             </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Clock className="mr-2 text-warning" size={18} />
                  Vehículos por Turno
                </h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {stats?.vehiclesByShift?.map((item: any) => (
                  <div key={item.id} className="bg-white/5 border border-white/5 rounded-lg p-3 hover:border-warning/30 transition-colors group">
                    <p className="text-xs text-foreground/50 mb-1 group-hover:text-warning transition-colors">{item.name}</p>
                    <div className="flex items-end justify-between">
                       <span className="text-xl font-bold text-white">{item.count}</span>
                       <Truck size={14} className="text-warning/40 mb-1" />
                    </div>
                  </div>
                )) || <p className="text-xs text-foreground/40 text-center py-4 italic">Cargando datos...</p>}
             </div>
          </div>
        </div>

        {/* Vehicle Status Table (Exportable) */}
        <div className="glass-panel p-0 rounded-xl overflow-hidden mb-8 border border-glass-border">
           <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5">
              <div>
                <h3 className="text-lg font-bold text-white">Estado Actual de la Flota</h3>
                <p className="text-xs text-foreground/50">Listado detallado para control operativo y reportes.</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                   <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={14} />
                   <input 
                     type="text" 
                     placeholder="Buscar vehículo..." 
                     className="w-full pl-9 pr-4 py-1.5 bg-black/20 border border-glass-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-white"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <button 
                  onClick={exportToExcel}
                  className="flex items-center px-3 py-1.5 bg-success/10 border border-success/30 text-success rounded-lg text-xs font-bold hover:bg-success/20 transition-all active:scale-95 shadow-lg shadow-success/10"
                >
                  <FileJson size={14} className="mr-2" />
                  Excel
                </button>
                <button 
                  onClick={exportToPDF}
                  className="flex items-center px-3 py-1.5 bg-danger/10 border border-danger/30 text-danger-500 rounded-lg text-xs font-bold hover:bg-danger/20 transition-all active:scale-95 shadow-lg shadow-danger/10"
                >
                  <FileText size={14} className="mr-2" />
                  PDF
                </button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-glass-border bg-black/40 text-[10px] uppercase tracking-wider text-foreground/60 font-bold">
                   <th className="p-4 px-6">ID / Modelo</th>
                   <th className="p-4">Tipo</th>
                   <th className="p-4">Estado</th>
                   <th className="p-4">Sede / Turno</th>
                   <th className="p-4">Odómetro</th>
                   <th className="p-4">Conductor</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-glass-border">
                 {filteredVehicles.length > 0 ? filteredVehicles.map((v) => (
                   <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                     <td className="p-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">{v.brand} {v.model} {v.year}</span>
                          <span className="font-mono text-[10px] text-foreground/40">{v.id} - {v.plate}</span>
                        </div>
                     </td>
                     <td className="p-4">
                       <span className="text-xs text-foreground/70">{v.type}</span>
                     </td>
                     <td className="p-4">
                       <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${v.status_color || 'bg-primary/20 text-primary'}`}>
                          {v.status}
                        </span>
                     </td>
                     <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-white flex items-center">
                             <Building2 size={10} className="mr-1 text-primary" /> {v.sede_name || 'N/A'}
                          </span>
                          <span className="text-[10px] text-foreground/50 flex items-center mt-0.5">
                             <Clock size={10} className="mr-1 text-warning" /> {v.shift_name || 'Sin Turno'}
                          </span>
                        </div>
                     </td>
                     <td className="p-4">
                       <span className="text-xs font-mono text-foreground/80">{v.odometer} km</span>
                     </td>
                     <td className="p-4">
                        <span className="text-xs font-medium text-white flex items-center">
                          <Users size={12} className="mr-1.5 text-success" />
                          {v.driver || 'No Asignado'}
                        </span>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-sm text-foreground/40 italic">No se encontraron vehículos que coincidan con la búsqueda.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </main>
      
    </div>
  );
}
