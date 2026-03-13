"use client";

import { useEffect, useState } from "react";
import { Users, Truck, LayoutDashboard, Database, ClipboardList, Map, Search, Plus, Tag, ShieldCheck, UserCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getPermissions } from "@/lib/permissions";

export default function AdminUsuarios() {
  const [sessionUser, setSessionUser] = useState<{name: string, role: string} | null>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'USER', password: '' });
  const [editUser, setEditUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const role = (typeof document !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]) || 'SUPERADMIN';
    setSessionUser({ name: "E. Martinez", role });
    fetchUsers();
  }, []);

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que deseas eliminar a este usuario del sistema?")) return;
    
    try {
        const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        if (res.ok) fetchUsers();
        else alert("Error al eliminar");
    } catch (error) {
        console.error("Error deleting user", error);
    }
  };

  const permissions = getPermissions(sessionUser?.role || 'USER');

  if (isLoading && !sessionUser) return <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  if (sessionUser && !permissions.canManageUsers) {
    return (
      <div className="flex flex-col min-h-screen md:flex-row bg-[#0c0c0e]">
        <Navigation user={sessionUser} />
        <main className="flex-1 flex items-center justify-center p-8">
           <div className="glass-panel p-12 text-center max-w-md">
              <ShieldCheck size={64} className="mx-auto text-danger-500 mb-6 opacity-20" />
              <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
              <p className="text-foreground/50 mb-8 text-sm">No tienes los permisos suficientes para gestionar usuarios y roles del sistema.</p>
              <Link href="/admin/dashboard" className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 block">Volver al Inicio</Link>
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:flex-row bg-background">
       <Navigation user={sessionUser} title="Usuarios" />

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 md:pt-8 md:p-8 w-full mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Gestión de Usuarios</h2>
            <p className="text-foreground/60">Administra los usuarios con acceso al sistema y sus roles.</p>
          </div>
          <button 
             onClick={() => setIsCreatingUser(true)}
             className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
          >
             <Plus size={18} className="mr-2" />
             Nuevo Usuario
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
             <input 
               type="text" 
               placeholder="Buscar por nombre, email..."
               className="w-full pl-10 pr-4 py-2 bg-foreground/5 border border-glass-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
             />
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-glass-border bg-white/5 text-xs uppercase tracking-wider text-foreground/60 font-semibold">
                    <th className="p-4 rounded-tl-xl whitespace-nowrap">Nombre</th>
                    <th className="p-4 whitespace-nowrap">Email</th>
                    <th className="p-4 whitespace-nowrap">Rol</th>
                    <th className="p-4 rounded-tr-xl whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {usuarios.map((usuario) => (
                    <tr 
                      key={usuario.id} 
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white transition-colors">{usuario.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-foreground/80">{usuario.email}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                          usuario.role === 'SUPERADMIN' ? 'bg-primary/20 text-primary' : 
                          usuario.role === 'ADMIN' ? 'bg-warning/20 text-warning' : 
                          'bg-success/20 text-success'
                        }`}>
                          {usuario.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex space-x-2">
                           <button 
                             onClick={() => setEditUser(usuario)} 
                             className="text-foreground/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                             title="Editar"
                           >
                             <Tag size={16} />
                           </button>
                           <button 
                             onClick={(e) => handleDeleteUser(usuario.id, e)} 
                             className="text-danger-500 hover:text-danger-400 p-2 rounded-lg hover:bg-danger/10 transition-colors"
                             title="Eliminar"
                           >
                             <X size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>

        {/* Modal for Creating User */}
        {isCreatingUser && (
          <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5">
                <h3 className="text-xl font-bold text-foreground">Crear Acceso de Usuario</h3>
                <button 
                  onClick={() => setIsCreatingUser(false)}
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
                     value={newUser.name}
                     onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Correo Electrónico</label>
                     <input 
                       type="email" 
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newUser.email}
                       onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                     />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Contraseña</label>
                     <input 
                       type="password" 
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newUser.password}
                       onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Rol de Sistema</label>
                     <select 
                       className="w-full appearance-none bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={newUser.role}
                       onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                     >
                       <option value="USER">Usuario (Lectura)</option>
                       <option value="ADMIN">Administrador</option>
                       <option value="SUPERADMIN">Super Administrador</option>
                     </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-glass-border bg-foreground/[0.02] flex gap-3 justify-end">
                <button 
                  onClick={() => setIsCreatingUser(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                     if (!newUser.name || !newUser.email || !newUser.password) {
                        alert("Por favor completa nombre, correo y contraseña.");
                        return;
                     }
                     try {
                       const res = await fetch("/api/usuarios", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(newUser)
                       });
                       if (res.ok) {
                         setIsCreatingUser(false);
                         fetchUsers();
                         setNewUser({ name: '', email: '', role: 'USER', password: '' });
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
                  Crear Usuario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing User */}
        {editUser && (
          <div className="fixed inset-0 bg-modal-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-modal-bg border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-glass-border flex justify-between items-center bg-foreground/5">
                <h3 className="text-xl font-bold text-foreground">Editar Usuario</h3>
                <button 
                  onClick={() => setEditUser(null)}
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
                     value={editUser.name}
                     onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Correo Electrónico</label>
                     <input 
                       type="email" 
                       className="w-full bg-foreground/5 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                       value={editUser.email}
                       onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                     />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Nueva Contraseña (Dejar en blanco para no cambiar)</label>
                     <input 
                       type="password" 
                       placeholder="••••••••"
                       className="w-full bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                       value={editUser.password || ''}
                       onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground/80">Rol de Sistema</label>
                     <select 
                       className="w-full appearance-none bg-black/40 border border-glass-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                       value={editUser.role}
                       onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                     >
                       <option value="USER">Usuario (Lectura)</option>
                       <option value="ADMIN">Administrador</option>
                       <option value="SUPERADMIN">Super Administrador</option>
                     </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3 justify-end">
                <button 
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                     try {
                       const { password, ...userData } = editUser;
                       const bodyData = password ? { ...userData, password } : userData;
                     
                       const res = await fetch(`/api/usuarios/${editUser.id}`, {
                         method: "PUT",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(bodyData)
                       });
                       if (res.ok) {
                         setEditUser(null);
                         fetchUsers();
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
