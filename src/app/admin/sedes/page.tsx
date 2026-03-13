"use client";

import { useEffect, useState } from "react";
import { 
  Users, Truck, LayoutDashboard, Database, ClipboardList, 
  Map, Search, Plus, X, Building2, MapPin, 
  Trash2, Edit2, Clock
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getPermissions } from "@/lib/permissions";

export default function AdminSedes() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSede, setIsAddingSede] = useState(false);
  const [editingSede, setEditingSede] = useState<any>(null);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const pathname = usePathname();

  const [newSede, setNewSede] = useState({
    name: '',
    address: ''
  });

  const fetchSedes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/sedes');
      if (res.ok) {
        const data = await res.json();
        setSedes(data);
      }
    } catch (error) {
      console.error("Error loading sedes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const role = (typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]) || 'SUPERADMIN';
    setUser({ name: "E. Martinez", role });
    fetchSedes();
  }, []);

  const handleSaveSede = async () => {
    if (!newSede.name) {
      alert("Por favor completa el nombre de la sede");
      return;
    }

    try {
      const res = await fetch('/api/sedes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSede)
      });

      if (res.ok) {
        setIsAddingSede(false);
        setNewSede({ name: '', address: '' });
        fetchSedes();
      } else {
        alert("Error al guardar la sede");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateSede = async () => {
    try {
      const res = await fetch('/api/sedes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSede)
      });

      if (res.ok) {
        setEditingSede(null);
        fetchSedes();
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSede = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta sede? Los turnos asociados quedarán sin sede.")) return;

    try {
      const res = await fetch(`/api/sedes?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchSedes();
    } catch (error) {
      console.error(error);
    }
  };

  const permissions = getPermissions(user?.role || 'USER');

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:flex-row bg-background">
       <Navigation user={user} title="Sedes" />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 w-full mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">Administración de Sedes</h2>
            <p className="text-sm md:text-base text-foreground/60">Gestiona las ubicaciones físicas del hospital y sus dependencias.</p>
          </div>
          {!permissions.isReadOnly && (
            <button 
              onClick={() => setIsAddingSede(true)}
              className="flex items-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Plus size={18} className="mr-2" />
              Nueva Sede
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sedes.map((sede) => (
              <div key={sede.id} className="glass-panel group hover:border-primary/50 transition-all p-6 relative">
                {!permissions.isReadOnly && (
                  <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingSede(sede)}
                      className="p-1.5 rounded-md hover:bg-white/10 text-foreground/60 hover:text-white"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSede(sede.id)}
                      className="p-1.5 rounded-md hover:bg-danger/20 text-danger-500 hover:text-danger-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{sede.name}</h3>
                    <p className="text-xs text-foreground/50">ID: SEDE-{sede.id.toString().padStart(3, '0')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-sm text-foreground/70 bg-foreground/5 rounded-lg p-4">
                  <MapPin size={16} className="mt-0.5 text-primary shrink-0" />
                  <p>{sede.address || "Dirección no registrada."}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: New/Edit Sede */}
        {(isAddingSede || editingSede) && (
          <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5">
                <h3 className="text-xl font-bold text-foreground">
                  {isAddingSede ? "Crear Nueva Sede" : "Editar Sede"}
                </h3>
                <button 
                  onClick={() => { setIsAddingSede(false); setEditingSede(null); }}
                  className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Nombre de la Sede</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Hospital General, Clínica Norte..."
                    className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary text-foreground"
                    value={isAddingSede ? newSede.name : editingSede.name}
                    onChange={(e) => isAddingSede 
                      ? setNewSede({...newSede, name: e.target.value})
                      : setEditingSede({...editingSede, name: e.target.value})
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Dirección</label>
                  <textarea 
                    rows={3}
                    placeholder="Calle, número, colonia..."
                    className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary text-foreground resize-none"
                    value={isAddingSede ? newSede.address : editingSede.address}
                    onChange={(e) => isAddingSede 
                      ? setNewSede({...newSede, address: e.target.value})
                      : setEditingSede({...editingSede, address: e.target.value})
                    }
                  ></textarea>
                </div>
              </div>

              <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex gap-3 justify-end">
                <button 
                  onClick={() => { setIsAddingSede(false); setEditingSede(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={isAddingSede ? handleSaveSede : handleUpdateSede}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {isAddingSede ? "Guardar Sede" : "Actualizar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
