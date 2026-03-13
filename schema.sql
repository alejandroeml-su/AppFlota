-- CREATE DATABASE flota; -- This will be executed separately

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color_code VARCHAR(50) DEFAULT 'bg-primary'
);

CREATE TABLE IF NOT EXISTS vehicle_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Truck'
);

CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(50) PRIMARY KEY, -- e.g. DRV-001
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Activo',
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drop tables that depend on vehicles, then vehicles itself to replace its definition
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS vehicles;

CREATE TABLE vehicles (
    id VARCHAR(50) PRIMARY KEY, -- e.g. AMB-001
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year INTEGER,
    status_id INTEGER REFERENCES vehicle_statuses(id) ON DELETE SET NULL,
    type_id INTEGER REFERENCES vehicle_types(id) ON DELETE SET NULL,
    plate VARCHAR(50) NOT NULL,
    odometer VARCHAR(50) DEFAULT '0',
    last_maintenance VARCHAR(100),
    driver_id VARCHAR(50) REFERENCES drivers(id) ON DELETE SET NULL,
    shift_id INTEGER REFERENCES shifts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fuel_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id VARCHAR(50) REFERENCES drivers(id) ON DELETE SET NULL,
    recorded_odometer INTEGER NOT NULL,
    liters_filled DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_orders (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    expected_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    taller VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, En Proceso, Completado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generic_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo users
INSERT INTO users (name, email, role)
VALUES 
    ('Admin Master', 'admin@appflota.com', 'SUPERADMIN'),
    ('Operador Guardia', 'operador@appflota.com', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Insert demo drivers
INSERT INTO drivers (id, name, license_number, status, phone)
VALUES 
    ('DRV-001', 'Juan Pérez', 'LIC-192837', 'Activo', '555-0100'),
    ('DRV-002', 'María González', 'LIC-283746', 'Activo', '555-0101'),
    ('DRV-003', 'Roberto Gómez', 'LIC-374655', 'Vacaciones', '555-0102')
ON CONFLICT (id) DO NOTHING;

-- Insert demo vehicle types and statuses if they don't exist
INSERT INTO vehicle_statuses (name, color_code) VALUES 
    ('Activo', 'bg-green-500'),
    ('Mantenimiento', 'bg-yellow-500'),
    ('Inactivo', 'bg-red-500'),
    ('Fuera de Servicio', 'bg-gray-500')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vehicle_types (name, icon_name) VALUES 
    ('Ambulancia Tipo II', 'Truck'),
    ('Ambulancia Tipo III', 'Truck'),
    ('Transporte Personal', 'Users'),
    ('Logística', 'Package')
ON CONFLICT (name) DO NOTHING;

-- Insert demo shifts and sedes link
-- Assume sedes and shifts might already exist from previous runs, but let's make sure
INSERT INTO sedes (name, address, phone) VALUES 
    ('Hospital Central', 'Av. Principal 123', '555-0001'),
    ('Clínica Norte', 'Calle Norte 45', '555-0002')
ON CONFLICT (name) DO NOTHING;

-- Map shifts to sedes
INSERT INTO shifts (name, start_time, end_time, sede_id) VALUES 
    ('Turno Matutino', '06:00', '14:00', (SELECT id FROM sedes WHERE name = 'Hospital Central')),
    ('Turno Vespertino', '14:00', '22:00', (SELECT id FROM sedes WHERE name = 'Hospital Central')),
    ('Turno Nocturno', '22:00', '06:00', (SELECT id FROM sedes WHERE name = 'Hospital Central'))
ON CONFLICT DO NOTHING;

-- Insert demo vehicles with new schema
INSERT INTO vehicles (id, brand, model, year, status_id, type_id, plate, odometer, last_maintenance, driver_id, shift_id)
VALUES 
    ('AMB-001', 'Ford', 'Transit', 2021, 
     (SELECT id FROM vehicle_statuses WHERE name = 'Activo'), 
     (SELECT id FROM vehicle_types WHERE name = 'Ambulancia Tipo II'),
     'HOS-9128', '45,200 km', '12 Oct 2025', 'DRV-001', (SELECT id FROM shifts WHERE name = 'Turno Matutino')),
     
    ('AMB-002', 'Mercedes', 'Sprinter', 2022, 
     (SELECT id FROM vehicle_statuses WHERE name = 'Mantenimiento'), 
     (SELECT id FROM vehicle_types WHERE name = 'Ambulancia Tipo III'),
     'HOS-7341', '62,150 km', '05 Nov 2025', NULL, (SELECT id FROM shifts WHERE name = 'Turno Vespertino')),
     
    ('AMB-003', 'Ram', 'ProMaster', 2020, 
     (SELECT id FROM vehicle_statuses WHERE name = 'Activo'), 
     (SELECT id FROM vehicle_types WHERE name = 'Ambulancia Tipo II'),
     'HOS-4412', '89,300 km', '22 Ene 2026', 'DRV-002', (SELECT id FROM shifts WHERE name = 'Turno Nocturno')),
     
    ('TRANS-01', 'Toyota', 'Hiace', 2023, 
     (SELECT id FROM vehicle_statuses WHERE name = 'Activo'), 
     (SELECT id FROM vehicle_types WHERE name = 'Transporte Personal'),
     'PER-1122', '12,400 km', '01 Mar 2026', 'DRV-003', (SELECT id FROM shifts WHERE name = 'Turno Matutino')),
     
    ('TRANS-02', 'Nissan', 'Urvan', 2019, 
     (SELECT id FROM vehicle_statuses WHERE name = 'Inactivo'), 
     (SELECT id FROM vehicle_types WHERE name = 'Transporte Personal'),
     'PER-9988', '145,000 km', '15 Dic 2025', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
