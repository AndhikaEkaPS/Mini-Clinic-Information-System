-- ============================================================
-- Mini Clinic Information System - Database Migration
-- ============================================================

CREATE DATABASE IF NOT EXISTS clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinic_db;

-- Users (Admin, Dokter, Petugas Pendaftaran)
CREATE TABLE users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','doctor','receptionist') NOT NULL,
  is_active   TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Polyclinics
CREATE TABLE polyclinics (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  is_active   TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE patients (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  medical_record_number VARCHAR(30) NOT NULL UNIQUE,
  nik                   VARCHAR(16) NOT NULL UNIQUE,
  name                  VARCHAR(100) NOT NULL,
  gender                ENUM('male','female') NOT NULL,
  date_of_birth         DATE NOT NULL,
  phone                 VARCHAR(20),
  address               TEXT,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Registrations
CREATE TABLE registrations (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  patient_id      INT NOT NULL,
  doctor_id       INT NOT NULL,
  polyclinic_id   INT NOT NULL,
  visit_date      DATE NOT NULL,
  payment_type    ENUM('umum','bpjs','asuransi') NOT NULL,
  chief_complaint TEXT,
  status          ENUM('waiting','checkin','examination','done') DEFAULT 'waiting',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id)    REFERENCES patients(id),
  FOREIGN KEY (doctor_id)     REFERENCES users(id),
  FOREIGN KEY (polyclinic_id) REFERENCES polyclinics(id)
);

-- Queues
CREATE TABLE queues (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  registration_id INT NOT NULL,
  queue_number    VARCHAR(10) NOT NULL,
  status          ENUM('waiting','called','done','skip') DEFAULT 'waiting',
  called_at       DATETIME,
  queue_date      DATE NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id)
);

-- Medical Records (SOAP)
CREATE TABLE medical_records (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  registration_id  INT NOT NULL,
  patient_id       INT NOT NULL,
  doctor_id        INT NOT NULL,
  subjective       TEXT,
  blood_pressure   VARCHAR(20),
  temperature      DECIMAL(4,1),
  weight           DECIMAL(5,2),
  height           DECIMAL(5,2),
  diagnosis        TEXT,
  therapy_plan     TEXT,
  medical_actions  TEXT,
  examination_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id),
  FOREIGN KEY (patient_id)      REFERENCES patients(id),
  FOREIGN KEY (doctor_id)       REFERENCES users(id)
);

-- Prescriptions
CREATE TABLE prescriptions (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  medical_record_id INT NOT NULL,
  patient_id        INT NOT NULL,
  medicines         JSON NOT NULL,
  notes             TEXT,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
  FOREIGN KEY (patient_id)        REFERENCES patients(id)
);

-- ============================================================
-- Seed Data
-- ============================================================

-- Password: Admin@123 (bcrypt)
INSERT INTO users (name, username, password, role) VALUES
('Administrator', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('dr. Budi Santoso', 'dokter1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor'),
('Siti Rahayu', 'petugas1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'receptionist');

INSERT INTO polyclinics (name, description) VALUES
('Poli Umum', 'Pelayanan kesehatan umum'),
('Poli Gigi', 'Pelayanan kesehatan gigi dan mulut'),
('Poli Anak', 'Pelayanan kesehatan anak');
