-- YH38 Repair Management System Database Schema
-- ================================================
-- This file contains the complete database schema for the YH38 repair management system
-- Created: 27 April 2026
-- Compatible with: PostgreSQL 14+

-- Create database (if not using Docker, uncomment the line below)
-- CREATE DATABASE yh38_repair_db;
-- \c yh38_repair_db;

-- Enable UUID extension (optional, for future use)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- CLIENTS TABLE
-- ================================================
-- Stores client information for repair management
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- ================================================
-- REPAIRS TABLE
-- ================================================
-- Stores repair ticket information
CREATE TABLE IF NOT EXISTS repairs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    device_type VARCHAR(100) NOT NULL CHECK (device_type IN ('phone', 'pc')),
    device_model VARCHAR(255) NOT NULL,
    issue_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'fixed', 'ready_for_pickup')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    estimated_cost DECIMAL(10,2) CHECK (estimated_cost >= 0),
    actual_cost DECIMAL(10,2) CHECK (actual_cost >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for repairs table
CREATE INDEX IF NOT EXISTS idx_repairs_client_id ON repairs(client_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_priority ON repairs(priority);
CREATE INDEX IF NOT EXISTS idx_repairs_created_at ON repairs(created_at);
CREATE INDEX IF NOT EXISTS idx_repairs_updated_at ON repairs(updated_at);

-- ================================================
-- APPOINTMENTS TABLE
-- ================================================
-- Stores appointment scheduling information
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER REFERENCES repairs(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60 CHECK (duration_minutes >= 15 AND duration_minutes <= 480),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure no overlapping appointments (optional constraint)
    -- Note: This is a simplified constraint. In production, you might want more sophisticated scheduling logic
    UNIQUE(appointment_date, appointment_time)
);

-- Add indexes for appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_repair_id ON appointments(repair_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);

-- ================================================
-- ADMINS TABLE
-- ================================================
-- Stores admin/worker user information
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'technician')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ================================================
-- VIEWS (Optional)
-- ================================================

-- View for complete repair information with client details
CREATE OR REPLACE VIEW repair_details AS
SELECT
    r.id,
    r.client_id,
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    r.device_type,
    r.device_model,
    r.issue_description,
    r.status,
    CASE
        WHEN r.status = 'pending' THEN 'En attente'
        WHEN r.status = 'in_progress' THEN 'En cours'
        WHEN r.status = 'fixed' THEN 'Réparé'
        WHEN r.status = 'ready_for_pickup' THEN 'Prêt pour récupération'
        ELSE r.status
    END as status_french,
    r.priority,
    CASE
        WHEN r.priority = 'low' THEN 'Faible'
        WHEN r.priority = 'normal' THEN 'Normal'
        WHEN r.priority = 'high' THEN 'Élevé'
        WHEN r.priority = 'urgent' THEN 'Urgent'
        ELSE r.priority
    END as priority_french,
    r.estimated_cost,
    r.actual_cost,
    r.created_at,
    r.updated_at,
    CONCAT('YH38-', LPAD(r.id::text, 6, '0')) as tracking_code
FROM repairs r
JOIN clients c ON r.client_id = c.id;

-- View for appointment details with repair and client information
CREATE OR REPLACE VIEW appointment_details AS
SELECT
    a.id,
    a.repair_id,
    a.client_id,
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    r.device_type,
    r.device_model,
    a.appointment_date,
    a.appointment_time,
    a.duration_minutes,
    a.status,
    CASE
        WHEN a.status = 'scheduled' THEN 'Programmé'
        WHEN a.status = 'confirmed' THEN 'Confirmé'
        WHEN a.status = 'completed' THEN 'Terminé'
        WHEN a.status = 'cancelled' THEN 'Annulé'
        ELSE a.status
    END as status_french,
    a.notes,
    a.created_at,
    CONCAT('YH38-', LPAD(r.id::text, 6, '0')) as tracking_code
FROM appointments a
JOIN repairs r ON a.repair_id = r.id
JOIN clients c ON a.client_id = c.id;

-- ================================================
-- FUNCTIONS (Optional)
-- ================================================

-- Function to get repair status in French
CREATE OR REPLACE FUNCTION get_repair_status_french(status_text VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN CASE
        WHEN status_text = 'pending' THEN 'En attente'
        WHEN status_text = 'in_progress' THEN 'En cours'
        WHEN status_text = 'fixed' THEN 'Réparé'
        WHEN status_text = 'ready_for_pickup' THEN 'Prêt pour récupération'
        ELSE status_text
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to get priority in French
CREATE OR REPLACE FUNCTION get_priority_french(priority_text VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN CASE
        WHEN priority_text = 'low' THEN 'Faible'
        WHEN priority_text = 'normal' THEN 'Normal'
        WHEN priority_text = 'high' THEN 'Élevé'
        WHEN priority_text = 'urgent' THEN 'Urgent'
        ELSE priority_text
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to generate tracking code
CREATE OR REPLACE FUNCTION generate_tracking_code(repair_id INTEGER)
RETURNS VARCHAR AS $$
BEGIN
    RETURN CONCAT('YH38-', LPAD(repair_id::text, 6, '0'));
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS (Optional)
-- ================================================

-- Trigger to update the updated_at timestamp on repairs
CREATE OR REPLACE FUNCTION update_repair_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_repair_updated_at
    BEFORE UPDATE ON repairs
    FOR EACH ROW
    EXECUTE FUNCTION update_repair_updated_at();

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================

-- Insert sample client
-- INSERT INTO clients (name, email, phone) VALUES
-- ('Jean Dupont', 'jean.dupont@email.com', '+33123456789'),
-- ('Marie Martin', 'marie.martin@email.com', '+33987654321');

-- Insert sample repair
-- INSERT INTO repairs (client_id, device_type, device_model, issue_description, status, priority, estimated_cost)
-- VALUES (1, 'phone', 'iPhone 12', 'Écran cassé et batterie faible', 'pending', 'high', 150.00);

-- Insert sample appointment
-- INSERT INTO appointments (repair_id, client_id, appointment_date, appointment_time, notes)
-- VALUES (1, 1, CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'Apporter le chargeur original');

-- ================================================
-- PERMISSIONS (Optional)
-- ================================================

-- Grant permissions for the application user (if using a specific user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yh38_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO yh38_user;

-- ================================================
-- END OF SCHEMA
-- ================================================

-- To run this file:
-- psql -U postgres -d yh38_repair_db -f schema.sql
-- or within Docker:
-- docker exec -i yh38-db psql -U postgres -d yh38 -f /path/to/schema.sql