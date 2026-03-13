"use client";

import { useEffect, useState } from "react";
import { 
  Users, Truck, LayoutDashboard, Database, ClipboardList, 
  Map, Search, Plus, X, Clock, Calendar, FileText, 
  Trash2, Edit2, CheckCircle2, Building2, ChevronLeft, ChevronRight, LayoutList, Columns, Layers
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getPermissions } from "@/lib/permissions";

export default function AdminTurnos() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "visualization">("manage");
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    sedeId: '',
    driverId: '',
    shiftId: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bitacoras, setBitacoras] = useState<any[]>([]);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const pathname = usePathname();

  const [newShift, setNewShift] = useState({
    name: '',
    start_time: '',
    end_time: '',
    description: '',
    sede_id: ''
  });

  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/shifts');
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (error) {
      console.error("Error loading shifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSedes = async () => {
    try {
      const res = await fetch('/api/sedes');
      if (res.ok) {
        const data = await res.json();
        setSedes(data);
      }
    } catch (error) {
      console.error("Error loading sedes:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/conductores');
      if (res.ok) setDrivers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehiculos');
      if (res.ok) setVehicles(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchBitacoras = async () => {
    try {
      const res = await fetch('/api/bitacoras');
      if (res.ok) setBitacoras(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const role = (typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]) || 'SUPERADMIN';
    setUser({ name: "E. Martinez", role });
    fetchShifts();
    fetchSedes();
    fetchDrivers();
    fetchVehicles();
    fetchBitacoras();
  }, []);

  const handleSaveShift = async () => {
    if (!newShift.name || !newShift.start_time || !newShift.end_time) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift)
      });

      if (res.ok) {
        setIsAddingShift(false);
        setNewShift({ name: '', start_time: '', end_time: '', description: '', sede_id: '' });
        fetchShifts();
      } else {
        alert("Error al guardar el turno");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateShift = async () => {
    try {
      const res = await fetch('/api/shifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingShift)
      });

      if (res.ok) {
        setEditingShift(null);
        fetchShifts();
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteShift = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este turno? Los vehículos asociados quedarán sin turno.")) return;

    try {
      const res = await fetch(`/api/shifts?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchShifts();
    } catch (error) {
      console.error(error);
    }
  };

  const getFilteredData = () => {
    return vehicles.filter(v => {
      const shift = shifts.find(s => s.id === v.shift_id);
      const matchesSede = !filters.sedeId || (shift && shift.sede_id == filters.sedeId);
      const matchesDriver = !filters.driverId || v.driver_id === filters.driverId;
      const matchesShift = !filters.shiftId || v.shift_id == filters.shiftId;
      return matchesSede && matchesDriver && matchesShift;
    });
  };

  const renderDailyView = () => {
    const activeVehicles = getFilteredData();
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h4 className="text-xl font-bold text-white capitalize">{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
          <div className="flex items-center space-x-2">
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d);
            }} className="p-2 bg-white/5 border border-glass-border rounded-lg text-foreground/50 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all">HOY</button>
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d);
            }} className="p-2 bg-white/5 border border-glass-border rounded-lg text-foreground/50 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {shifts.filter(s => !filters.shiftId || s.id == filters.shiftId).length === 0 ? (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-dashed border-glass-border">
              <p className="text-sm text-foreground/40 italic">No se encontraron turnos configurados.</p>
            </div>
          ) : shifts.filter(s => !filters.shiftId || s.id == filters.shiftId).map(shift => {
            const shiftVehicles = activeVehicles.filter(v => v.shift_id === shift.id);
            return (
              <div key={shift.id} className="bg-white/5 border border-glass-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-4 group-hover:scale-110 transition-transform">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{shift.name}</p>
                      <p className="text-xs text-foreground/40 font-mono">{shift.start_time.substring(0,5)} — {shift.end_time.substring(0,5)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-1">{shiftVehicles.length} Activos</span>
                    {shift.sede_name && <span className="text-[9px] text-foreground/30 flex items-center"><Building2 size={10} className="mr-1" /> {shift.sede_name}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {shiftVehicles.map(v => (
                    <div key={v.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center space-x-4 hover:border-primary/20 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground/20 shadow-inner group-hover:text-primary transition-colors">
                        <Truck size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{v.id}</p>
                        <p className="text-[10px] text-foreground/40 truncate">{v.brand} {v.model}</p>
                        <p className="text-[10px] text-primary/70 font-medium flex items-center mt-1 truncate">
                          <Users size={10} className="mr-1.5" /> {v.driver || 'S/C'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {shiftVehicles.length === 0 && (
                    <div className="col-span-full py-4 px-6 bg-black/20 rounded-xl border border-dashed border-white/5">
                      <p className="text-xs text-foreground/30 italic">Sin asignaciones en este periodo.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const activeVehicles = getFilteredData();
    
    // Calculate Monday of current week
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500">
         <div className="flex items-center justify-between mb-8">
          <h4 className="text-xl font-bold text-white">Semana del {startOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al {weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</h4>
          <div className="flex space-x-2">
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 7);
              setSelectedDate(d);
            }} className="p-2 bg-white/5 border border-glass-border rounded-lg text-foreground/50 hover:text-white transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all">ESTA SEMANA</button>
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 7);
              setSelectedDate(d);
            }} className="p-2 bg-white/5 border border-glass-border rounded-lg text-foreground/50 hover:text-white transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3 flex-1 overflow-x-auto">
          {weekDays.map((date, idx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dateStr = date.toISOString().split('T')[0];
            const itemsInDay = bitacoras.filter(b => b.date && b.date.startsWith(dateStr));
            
            return (
              <div key={idx} className="flex flex-col h-full min-w-[120px]">
                <div className={`text-center py-3 rounded-t-2xl border-x border-t transition-all ${isToday ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary border-primary/20'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{dayLabels[idx]}</p>
                  <p className="text-lg font-black leading-none">{date.getDate()}</p>
                </div>
                <div className={`flex-1 border border-glass-border border-t-0 rounded-b-2xl p-2 space-y-2 min-h-[350px] transition-all ${isToday ? 'bg-primary/5 border-primary/20' : 'bg-white/5'}`}>
                  {shifts.map(s => {
                     const shiftVehicles = activeVehicles.filter(v => v.shift_id === s.id);
                     if (shiftVehicles.length === 0) return null;
                     return (
                       <div key={s.id} className="p-2 bg-black/40 border border-white/5 rounded-xl hover:border-primary/40 transition-all group cursor-pointer">
                         <div className="flex items-center justify-between mb-1.5">
                           <p className="text-[9px] font-bold text-white truncate">{s.name}</p>
                           <span className="text-[8px] bg-primary/20 text-primary px-1 rounded font-bold">{shiftVehicles.length}</span>
                         </div>
                         <div className="flex -space-x-2">
                           {shiftVehicles.slice(0, 3).map(v => (
                             <div key={v.id} className="h-5 w-5 rounded-full bg-white/10 border border-black/50 flex items-center justify-center text-[7px] text-white font-bold" title={v.id}>
                               {v.id.substring(0, 2)}
                             </div>
                           ))}
                           {shiftVehicles.length > 3 && (
                             <div className="h-5 w-5 rounded-full bg-primary/20 border border-black/50 flex items-center justify-center text-[7px] text-primary font-bold">
                               +{shiftVehicles.length - 3}
                             </div>
                           )}
                         </div>
                       </div>
                     );
                  })}
                  
                  {itemsInDay.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest mb-2">Registros de Carga</p>
                      <div className="space-y-1">
                        {itemsInDay.slice(0, 3).map((b, i) => (
                          <div key={i} className="flex items-center space-x-1.5 text-[8px] text-foreground/50">
                            <CheckCircle2 size={8} className="text-green-500/50" />
                            <span className="truncate">{b.vehicle_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    // Get calendar days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Align to Monday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, current: false, date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i) });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, current: true, date: new Date(currentYear, currentMonth, i) });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false, date: new Date(currentYear, currentMonth + 1, i) });
    }

    const activeVehicles = getFilteredData();

    return (
      <div className="flex flex-col h-full animate-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-2xl font-black text-foreground capitalize leading-none">{selectedDate.toLocaleDateString('es-ES', { month: 'long' })}</h4>
            <p className="text-primary font-bold text-xs mt-1 uppercase tracking-widest">{currentYear}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setMonth(d.getMonth() - 1);
              setSelectedDate(d);
            }} className="p-2.5 bg-foreground/5 border border-glass-border rounded-xl text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-all active:scale-95 shadow-lg">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setSelectedDate(new Date())} className="px-5 py-2.5 bg-primary text-white text-[10px] font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest">HOY</button>
            <button onClick={() => {
               const d = new Date(selectedDate);
               d.setMonth(d.getMonth() + 1);
               setSelectedDate(d);
            }} className="p-2.5 bg-foreground/5 border border-glass-border rounded-xl text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-all active:scale-95 shadow-lg">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-glass-border border border-glass-border rounded-2xl overflow-hidden shadow-2xl">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="bg-foreground/5 text-center py-4 text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">{d}</div>
          ))}
          {days.map((dayObj, idx) => {
            const isToday = dayObj.date.toDateString() === today.toDateString();
            const dateStr = dayObj.date.toISOString().split('T')[0];
            const hasLogs = bitacoras.some(b => b.date && b.date.startsWith(dateStr));
            
            return (
              <div 
                key={idx} 
                className={`min-h-[100px] p-3 flex flex-col transition-all cursor-pointer relative group ${
                  !dayObj.current ? 'bg-background/20 opacity-30 shadow-inner' : 
                  isToday ? 'bg-primary/5' : 'bg-background hover:bg-primary/[0.02]'
                }`}
                onClick={() => {
                  setSelectedDate(dayObj.date);
                  setViewType("daily");
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-black ${
                    !dayObj.current ? 'text-foreground/30' : 
                    isToday ? 'text-primary bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center -mt-1 -ml-1' : 'text-foreground/40'
                  }`}>
                    {dayObj.day}
                  </span>
                  {hasLogs && (
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  )}
                </div>
                
                <div className="mt-auto space-y-1">
                  {dayObj.current && shifts.slice(0, 3).map(s => {
                     const count = activeVehicles.filter(v => v.shift_id === s.id).length;
                     if (count === 0) return null;
                     return (
                        <div key={s.id} className="flex items-center space-x-1">
                           <div className="h-1 w-full rounded-full bg-primary/30 group-hover:bg-primary transition-all duration-500"></div>
                           <span className="text-[8px] font-bold text-white/30 hidden group-hover:block">{count}</span>
                        </div>
                     );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearlyView = () => {
    const year = selectedDate.getFullYear();
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const activeVehicles = getFilteredData();

    return (
      <div className="flex flex-col h-full animate-in fade-in duration-700">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-2xl font-bold text-foreground tracking-tight">{year}</h4>
          <div className="flex space-x-2">
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setFullYear(d.getFullYear() - 1);
              setSelectedDate(d);
            }} className="p-2 bg-foreground/5 border border-glass-border rounded-lg text-foreground/50 hover:text-foreground transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setFullYear(d.getFullYear() + 1);
              setSelectedDate(d);
            }} className="p-2 bg-white/5 border border-glass-border rounded-lg text-foreground/50 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((monthName, monthIdx) => {
            const firstDay = new Date(year, monthIdx, 1).getDay();
            const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
            const days = [];
            for (let i = 0; i < firstDay; i++) days.push(null);
            for (let i = 1; i <= daysInMonth; i++) days.push(i);

            return (
              <div key={monthName} className="bg-foreground/5 border border-glass-border rounded-2xl p-4 hover:border-primary/20 transition-all">
                <p className="text-xs font-bold text-foreground mb-3 text-center uppercase tracking-widest text-primary/70">{monthName}</p>
                <div className="grid grid-cols-7 gap-1">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} className="text-[7px] font-bold text-foreground/20 text-center">{d}</div>
                  ))}
                  {days.map((day, dIdx) => {
                    const hasAssignment = day !== null && activeVehicles.some(v => v.shift_id);
                    return (
                      <div 
                        key={dIdx} 
                        className={`aspect-square rounded-sm flex items-center justify-center text-[8px] ${
                          day === null ? 'invisible' : 
                          hasAssignment ? 'bg-primary/20 text-primary font-bold' : 'text-foreground/30'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Resumen de Cobertura Anual</p>
              <p className="text-xs text-foreground/50">Visualización de días operacionales programados.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg shadow-lg shadow-primary/20">DESCARGAR PLAN ANUAL</button>
        </div>
      </div>
    );
  };

  const permissions = getPermissions(user?.role || 'USER');

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:flex-row bg-background">
       <Navigation user={user} title="Turnos" />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 w-full mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Gestión de Turnos</h2>
            <p className="text-foreground/60">Administra y visualiza la programación operativa de la flota.</p>
          </div>
          <div className="flex bg-foreground/5 p-1 rounded-xl border border-glass-border">
            <button 
              onClick={() => setActiveTab("manage")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'manage' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/50 hover:text-foreground'}`}
            >
              Configuración
            </button>
            <button 
              onClick={() => setActiveTab("visualization")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'visualization' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/50 hover:text-foreground'}`}
            >
              Visualización
            </button>
          </div>
          {activeTab === "manage" && !permissions.isReadOnly && (
            <button 
              onClick={() => setIsAddingShift(true)}
              className="flex items-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Turno
            </button>
          )}
        </div>

        {activeTab === "visualization" && (
          <div className="mb-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Viz Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-foreground/5 p-6 rounded-2xl border border-glass-border">
              <div className="space-y-1.5">
                <label className="text-[10px] items-center text-foreground/40 font-bold uppercase tracking-wider flex">
                  <Building2 size={12} className="mr-1" /> Sede
                </label>
                <select 
                  className="w-full bg-foreground/5 border border-glass-border rounded-lg px-3 py-2 text-xs text-foreground"
                  value={filters.sedeId}
                  onChange={(e) => setFilters({...filters, sedeId: e.target.value})}
                >
                  <option value="">Todas las sedes</option>
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] items-center text-foreground/40 font-bold uppercase tracking-wider flex">
                  <Users size={12} className="mr-1" /> Conductor
                </label>
                <select 
                  className="w-full bg-foreground/5 border border-glass-border rounded-lg px-3 py-2 text-xs text-foreground"
                  value={filters.driverId}
                  onChange={(e) => setFilters({...filters, driverId: e.target.value})}
                >
                  <option value="">Cualquier conductor</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] items-center text-foreground/40 font-bold uppercase tracking-wider flex">
                  <Clock size={12} className="mr-1" /> Turno
                </label>
                <select 
                  className="w-full bg-foreground/5 border border-glass-border rounded-lg px-3 py-2 text-xs text-foreground"
                  value={filters.shiftId}
                  onChange={(e) => setFilters({...filters, shiftId: e.target.value})}
                >
                  <option value="">Todo el día</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1 space-y-1.5">
                   <label className="text-[10px] items-center text-foreground/40 font-bold uppercase tracking-wider flex">
                    Rango / Periodo
                  </label>
                  <div className="flex bg-foreground/5 p-1 rounded-lg border border-glass-border">
                    <button onClick={() => setViewType("daily")} className={`flex-1 py-1 px-2 rounded-md text-[10px] font-bold transition-all ${viewType === 'daily' ? 'bg-primary/10 text-primary' : 'text-foreground/40'}`}>D</button>
                    <button onClick={() => setViewType("weekly")} className={`flex-1 py-1 px-2 rounded-md text-[10px] font-bold transition-all ${viewType === 'weekly' ? 'bg-primary/10 text-primary' : 'text-foreground/40'}`}>S</button>
                    <button onClick={() => setViewType("monthly")} className={`flex-1 py-1 px-2 rounded-md text-[10px] font-bold transition-all ${viewType === 'monthly' ? 'bg-primary/10 text-primary' : 'text-foreground/40'}`}>M</button>
                    <button onClick={() => setViewType("yearly")} className={`flex-1 py-1 px-2 rounded-md text-[10px] font-bold transition-all ${viewType === 'yearly' ? 'bg-primary/10 text-primary' : 'text-foreground/40'}`}>A</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Viz Canvas */}
            <div className="glass-panel p-8 rounded-2xl min-h-[400px]">
              {viewType === 'daily' && renderDailyView()}
              {viewType === 'weekly' && renderWeeklyView()}
              {viewType === 'monthly' && renderMonthlyView()}
              {viewType === 'yearly' && renderYearlyView()}
            </div>
          </div>
        )}

        {activeTab === "manage" && (
          <>
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {shifts.map((shift) => (
                  <div key={shift.id} className="glass-panel group hover:border-primary/50 transition-all p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>
                    
                    {!permissions.isReadOnly && (
                      <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => setEditingShift(shift)}
                          className="p-2 rounded-lg bg-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/20 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteShift(shift.id)}
                          className="p-2 rounded-lg bg-foreground/10 text-danger-500 hover:text-danger-400 hover:bg-danger/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 mb-6 relative">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                        <Clock size={24} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">{shift.name}</h3>
                        <p className="text-xs text-foreground/40 flex items-center font-medium mt-0.5">
                          <Building2 size={12} className="mr-1.5 text-primary/60" /> {shift.sede_name || "Sede no asignada"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                       <div className="bg-foreground/5 border border-glass-border rounded-xl p-3 flex flex-col items-center">
                         <span className="text-[10px] text-foreground/30 uppercase font-black tracking-tighter mb-1">Inicio</span>
                         <span className="text-sm font-bold text-foreground font-mono">{shift.start_time.substring(0, 5)}</span>
                       </div>
                       <div className="bg-foreground/5 border border-glass-border rounded-xl p-3 flex flex-col items-center">
                         <span className="text-[10px] text-foreground/30 uppercase font-black tracking-tighter mb-1">Fin</span>
                         <span className="text-sm font-bold text-foreground font-mono">{shift.end_time.substring(0, 5)}</span>
                       </div>
                    </div>

                    <p className="text-sm text-foreground/60 line-clamp-2 italic h-[40px]">
                      {shift.description || "Sin descripción proporcionada."}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-glass-border flex items-center justify-between">
                       <p className="text-[10px] text-foreground/30 flex items-center">
                         <Calendar size={12} className="mr-1.5" /> {new Date(shift.created_at).toLocaleDateString()}
                       </p>
                       <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">ID: {shift.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(isAddingShift || editingShift) && (
              <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5 shadow-lg">
                    <h3 className="text-xl font-bold text-foreground flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary mr-3">
                        {isAddingShift ? <Plus size={18} /> : <Edit2 size={16} />}
                      </div>
                      {isAddingShift ? "Crear Nuevo Turno" : "Editar Turno"}
                    </h3>
                    <button 
                      onClick={() => { setIsAddingShift(false); setEditingShift(null); }}
                      className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Nombre del Turno</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Matutino, Nocturno A..."
                        className="w-full bg-foreground/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                        value={isAddingShift ? newShift.name : editingShift?.name || ""}
                        onChange={(e) => isAddingShift 
                          ? setNewShift({...newShift, name: e.target.value})
                          : setEditingShift({...editingShift, name: e.target.value})
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest leading-none">Hora Inicio</label>
                        <input 
                          type="time" 
                          className="w-full bg-foreground/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                          value={isAddingShift ? newShift.start_time : editingShift?.start_time || ""}
                          onChange={(e) => isAddingShift 
                            ? setNewShift({...newShift, start_time: e.target.value})
                            : setEditingShift({...editingShift, start_time: e.target.value})
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest leading-none">Hora Fin</label>
                        <input 
                          type="time" 
                          className="w-full bg-foreground/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                          value={isAddingShift ? newShift.end_time : editingShift?.end_time || ""}
                          onChange={(e) => isAddingShift 
                            ? setNewShift({...newShift, end_time: e.target.value})
                            : setEditingShift({...editingShift, end_time: e.target.value})
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest leading-none">Asignar Sede</label>
                      <select 
                        className="w-full bg-foreground/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary text-foreground transition-all outline-none appearance-none"
                        value={isAddingShift ? newShift.sede_id : editingShift?.sede_id || ""}
                        onChange={(e) => isAddingShift 
                          ? setNewShift({...newShift, sede_id: e.target.value})
                          : setEditingShift({...editingShift, sede_id: e.target.value})
                        }
                      >
                        <option value="">Sin sede asignada</option>
                        {sedes.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest leading-none">Descripción</label>
                      <textarea 
                        rows={3}
                        placeholder="Descripción breve de los objetivos del turno..."
                        className="w-full bg-foreground/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary text-foreground resize-none transition-all outline-none"
                        value={isAddingShift ? newShift.description : editingShift?.description || ""}
                        onChange={(e) => isAddingShift 
                          ? setNewShift({...newShift, description: e.target.value})
                          : setEditingShift({...editingShift, description: e.target.value})
                        }
                      ></textarea>
                    </div>
                  </div>

                  <div className="p-4 border-t border-glass-border bg-foreground/5 flex gap-3 justify-end items-center">
                    <button 
                      onClick={() => { setIsAddingShift(false); setEditingShift(null); }}
                      className="px-6 py-2 rounded-xl text-xs font-bold text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all"
                    >
                      CANCELAR
                    </button>
                    <button 
                      onClick={isAddingShift ? handleSaveShift : handleUpdateShift}
                      className="px-8 py-2.5 rounded-xl text-xs font-black bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      {isAddingShift ? "Guardar Turno" : "Actualizar Cambios"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
