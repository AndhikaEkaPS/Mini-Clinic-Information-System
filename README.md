# 🏥 Mini Clinic Information System

Aplikasi berbasis web untuk membantu proses administrasi dan pelayanan pasien klinik pratama secara terintegrasi.

---

## 📋 Fitur Utama

- **Authentication & Authorization** — Login/Logout dengan JWT, 3 role: Admin, Dokter, Petugas
- **Master Data Pasien** — CRUD pasien dengan auto-generate Nomor Rekam Medis
- **Pendaftaran Pasien** — Registrasi kunjungan dengan pilihan poli, dokter, dan pembayaran
- **Antrean** — Auto-generate nomor antrean, pemanggilan, dan manajemen status
- **Pemeriksaan SOAP** — Input pemeriksaan dokter, tindakan medis, dan resep obat
- **Dashboard** — Ringkasan statistik harian klinik

---

## 🛠 Teknologi

| Komponen    | Teknologi                  |
|-------------|----------------------------|
| Frontend    | React.js + Redux Toolkit   |
| Backend     | Node.js + Express.js       |
| Database    | MySQL                      |
| Auth        | JSON Web Token (JWT)       |
| Version Control | Git                    |

---

## 📁 Struktur Project

```
clinic-app/
├── backend/
│   ├── src/
│   │   ├── app.js               # Entry point Express
│   │   ├── config/
│   │   │   └── database.js      # Konfigurasi Sequelize
│   │   ├── controllers/         # Logic handler per modul
│   │   │   ├── authController.js
│   │   │   ├── patientController.js
│   │   │   ├── registrationController.js
│   │   │   ├── queueController.js
│   │   │   ├── medicalRecordController.js
│   │   │   └── dashboardController.js
│   │   ├── middlewares/
│   │   │   └── auth.js          # JWT authenticate & authorize
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Patient.js
│   │   │   └── index.js         # Semua model & asosiasi
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── authRoutes.js
│   │   │   ├── patientRoutes.js
│   │   │   ├── registrationRoutes.js
│   │   │   ├── queueRoutes.js
│   │   │   ├── medicalRecordRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   └── utils/
│   │       └── response.js      # Standard response helper
│   ├── migrations/
│   │   └── clinic_db.sql        # DDL + seed data
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Router utama
    │   ├── components/
    │   │   └── common/
    │   │       └── PrivateRoute.jsx
    │   ├── pages/
    │   │   ├── auth/LoginPage.jsx
    │   │   ├── dashboard/DashboardPage.jsx
    │   │   ├── patients/       (List, Form, Detail)
    │   │   ├── registrations/  (List, Form)
    │   │   ├── queues/QueuePage.jsx
    │   │   └── examination/    (Examination, MedicalHistory)
    │   ├── services/
    │   │   └── api.js          # Axios instance + service wrappers
    │   ├── store/
    │   │   ├── index.js
    │   │   └── slices/authSlice.js
    │   └── utils/
    ├── .env.example
    └── package.json
```

---

## ⚙️ Cara Instalasi & Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/username/clinic-app.git
cd clinic-app
```

### 2. Setup Database

1. Buka MySQL client (MySQL Workbench / DBeaver / CLI)
2. Jalankan file SQL berikut:

```bash
mysql -u root -p < backend/migrations/clinic_db.sql
```

### 3. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi database lokal Anda
npm install
npm run dev
```

Backend berjalan di: `http://localhost:5000`

### 4. Setup Frontend

```bash
cd frontend
cp .env.example .env
# Pastikan REACT_APP_API_URL sesuai alamat backend
npm install
npm start
```

Frontend berjalan di: `http://localhost:3000`

---

## 🔑 Konfigurasi File `.env` (Backend)

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=clinic_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=8h
```

## 🔑 Konfigurasi File `.env` (Frontend)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 👤 Akun Login (Default)

| Nama              | Username   | Password   | Role           |
|-------------------|------------|------------|----------------|
| Administrator     | admin      | password   | Administrator  |
| dr. Budi Santoso  | dokter1    | password   | Dokter         |
| Siti Rahayu       | petugas1   | password   | Petugas        |

> ⚠️ Ganti password default setelah pertama kali masuk.

---

## 🗄️ ERD (Entity Relationship)

```
users ──────────────┐
 │                  │
 │ (doctor_id)      │ (receptionist creates)
 ↓                  ↓
polyclinics ──→ registrations ←── patients
                    │
                    ↓
                  queues (1:1)
                    │
                    ↓
             medical_records (1:1)
                    │
                    ↓
              prescriptions (1:1)
```

---

## 📡 REST API Endpoints

### Auth
| Method | Endpoint       | Akses  |
|--------|----------------|--------|
| POST   | /api/auth/login  | Public |
| POST   | /api/auth/logout | Auth   |
| GET    | /api/auth/me     | Auth   |

### Patients
| Method | Endpoint             | Role             |
|--------|----------------------|------------------|
| GET    | /api/patients        | All              |
| GET    | /api/patients/:id    | All              |
| POST   | /api/patients        | Admin, Petugas   |
| PUT    | /api/patients/:id    | Admin, Petugas   |
| DELETE | /api/patients/:id    | Admin            |

### Registrations
| Method | Endpoint                 | Role              |
|--------|--------------------------|-------------------|
| GET    | /api/registrations       | All               |
| POST   | /api/registrations       | Admin, Petugas    |
| PUT    | /api/registrations/:id   | Admin, Petugas, Dokter |

### Queues
| Method | Endpoint                    | Role |
|--------|-----------------------------|------|
| GET    | /api/queues                 | All  |
| PUT    | /api/queues/:id/call        | All  |
| PUT    | /api/queues/:id/status      | All  |

### Medical Records
| Method | Endpoint                              | Role   |
|--------|---------------------------------------|--------|
| POST   | /api/medical-records                  | Dokter |
| GET    | /api/medical-records/:patientId       | All    |
| POST   | /api/medical-records/prescriptions    | Dokter |
| GET    | /api/medical-records/prescriptions/:id| All    |

### Dashboard
| Method | Endpoint        | Role |
|--------|-----------------|------|
| GET    | /api/dashboard  | All  |

---

## 🧪 Cara Migrasi Database

Jalankan file SQL secara langsung:

```bash
mysql -u root -p < backend/migrations/clinic_db.sql
```

File ini sudah mencakup:
- `CREATE DATABASE`
- DDL semua tabel
- Seed data awal (users & polyclinics)

---

## 📮 Postman Collection

Import file `postman_collection.json` (ada di root project) ke Postman.
Gunakan environment variable `{{base_url}} = http://localhost:5000/api` dan `{{token}}` yang diisi setelah login.

---

## 📝 Asumsi & Penyederhanaan

1. Satu registrasi hanya untuk satu dokter dan satu poli.
2. Nomor antrean di-reset setiap hari.
3. Password default menggunakan bcrypt hash dari kata `password`.
4. JWT bersifat stateless; logout hanya menghapus token di sisi client.
5. Field `medical_actions` disimpan sebagai JSON string di database.
