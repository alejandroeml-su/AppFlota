"use client";

import { useEffect, useState } from "react";
import { User, Activity } from "lucide-react";

export default function ConductorDashboard() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    // En Next.js el token se maneja HTTP-Only protegido, pero para UI guardamos datos estáticos en el MVP desde localStorage o los pre-fetcheamos.
    // Para simplificar, asumimos que el usuario lee su nombre de la sesión
    const storedUser = localStorage.getItem("appflota_user");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    } else {
      setUser({ name: "Conductor Activo", role: "CONDUCTOR" });
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="glass-panel p-6 flex items-center space-x-4">
        <div className="bg-primary/20 p-3 rounded-full text-primary">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{user?.role}</span>
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center"><Activity size={18} className="mr-2 text-warning" /> Estado de Asignación</h3>
        <div className="p-4 bg-black/20 rounded-lg border border-glass-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground/60">Vehículo actual</span>
            <span className="font-mono bg-foreground/10 px-2 py-0.5 rounded text-sm">AMB-001</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-foreground/60">Último Odómetro</span>
            <span className="font-mono text-sm">15,200 km</span>
          </div>
        </div>
        <p className="text-xs text-foreground/60 text-center mt-2">
          Para iniciar tu turno, asegúrate de realizar el checklist pre-operativo.
        </p>
      </div>
      
    </div>
  );
}
