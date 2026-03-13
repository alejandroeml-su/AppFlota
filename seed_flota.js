const vehicles = [
  { id: "VEH-101", model: "Toyota Hiace 2023", type: "Ambulancia", status: "Activo", plate: "AMB-001", odometer: "15400" },
  { id: "VEH-102", model: "Ford Transit 2022", type: "Transporte", status: "Activo", plate: "TRN-042", odometer: "42000" },
  { id: "VEH-103", model: "Chevrolet Express 2021", type: "Carga", status: "En Taller", plate: "CRG-110", odometer: "89000" },
  { id: "VEH-104", model: "Mercedes Sprinter 2024", type: "Ambulancia", status: "Activo", plate: "AMB-002", odometer: "5000" },
  { id: "VEH-105", model: "Nissan Urvan 2020", type: "Transporte", status: "Activo", plate: "TRN-021", odometer: "125000" },
  { id: "VEH-106", model: "Toyota Hilux 2022", type: "Pick-up", status: "Activo", plate: "PKP-005", odometer: "34000" },
  { id: "VEH-107", model: "Ford F-150 2023", type: "Pick-up", status: "Inactivo", plate: "PKP-008", odometer: "15000" },
  { id: "VEH-108", model: "Renault Kangoo 2021", type: "Carga Ligera", status: "Activo", plate: "CRG-201", odometer: "67000" },
  { id: "VEH-109", model: "Volkswagen Transporter 2023", type: "Ambulancia", status: "Activo", plate: "AMB-003", odometer: "12000" },
  { id: "VEH-110", model: "Chevrolet Tahoe 2022", type: "Escolta", status: "Activo", plate: "ESC-001", odometer: "45000" }
];

async function seed() {
  console.log("Starting seed of 10 vehicles...");
  for (const v of vehicles) {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v)
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(`Error inserting ${v.id}:`, data);
      } else {
        console.log(`Inserted ${v.id} successfully.`);
      }
    } catch (e) {
      console.error(`Fetch error for ${v.id}:`, e);
    }
  }
  console.log("Done.");
}

seed();
