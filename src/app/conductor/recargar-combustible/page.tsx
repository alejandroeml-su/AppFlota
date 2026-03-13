"use client";

import { useState } from "react";
import { Fuel, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RecargarCombustiblePage() {
  const router = useRouter();
  const [odometro, setOdometro] = useState("");
  const [litros, setLitros] = useState("");
  const [costo, setCosto] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorSQL, setErrorSQL] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorSQL("");
    setSuccess(false);

    try {
      const res = await fetch("/api/fuel-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: "00000000-0000-0000-0000-000000000001", // MOCK MVP GUID VEHICULO
          recordedOdometer: parseInt(odometro),
          litersFilled: parseFloat(litros),
          totalCost: parseFloat(costo),
          observations: ""
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrar la recarga.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/conductor/dashboard");
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorSQL(err.message);
      } else {
        setErrorSQL("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold inline-flex items-center">
          <Fuel className="mr-2 text-primary" size={28} />
          Registrar Recarga
        </h2>
        <p className="text-sm text-foreground/60 mt-1">Ingresa los datos exactos del ticket</p>
      </div>

      <div className="glass-panel p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-success-600 animate-in zoom-in duration-300">
            <CheckCircle size={64} className="text-success mb-4" />
            <h3 className="text-xl font-bold">¡Recarga Registrada!</h3>
            <p className="text-sm text-center mt-2 opacity-80">El registro ha sido almacenado de forma segura en la base de datos.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorSQL && (
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger-600 text-sm flex items-start">
                <AlertCircle size={18} className="mr-2 mt-0.5 shrink-0" />
                <span>{errorSQL}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Odómetro Actual (km)</label>
              <input
                type="number"
                required
                min="0"
                value={odometro}
                onChange={e => setOdometro(e.target.value)}
                placeholder="Ej. 15350"
                className="w-full rounded-md border border-glass-border bg-black/20 px-3 py-3 text-lg backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-center"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Litros</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.1"
                  value={litros}
                  onChange={e => setLitros(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-glass-border bg-black/20 px-3 py-3 text-lg backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-center"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Costo Total ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.1"
                  value={costo}
                  onChange={e => setCosto(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-glass-border bg-black/20 px-3 py-3 text-lg backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-center text-success-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 h-12 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? "Procesando..." : "Guardar Operación"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
