import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import store from './store';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import LoginPage            from './pages/auth/LoginPage';
import DashboardPage        from './pages/dashboard/DashboardPage';
import PatientListPage      from './pages/patients/PatientListPage';
import PatientFormPage      from './pages/patients/PatientFormPage';
import PatientDetailPage    from './pages/patients/PatientDetailPage';
import RegistrationListPage from './pages/registrations/RegistrationListPage';
import RegistrationFormPage from './pages/registrations/RegistrationFormPage';
import QueuePage            from './pages/queues/QueuePage';
import ExaminationPage      from './pages/examination/ExaminationPage';
import MedicalHistoryPage   from './pages/examination/MedicalHistoryPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>

          {/* ── Public ── */}
          <Route path="/login" element={<LoginPage />} />

          {/* ── Semua role yang sudah login ── */}
          <Route element={<PrivateRoute />}>
            <Route path="/"          element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/queues"    element={<QueuePage />} />
          </Route>

          {/* ── Admin & Petugas ── */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'receptionist']} />}>
            <Route path="/patients"              element={<PatientListPage />} />
            <Route path="/patients/new"          element={<PatientFormPage />} />
            <Route path="/patients/:id"          element={<PatientDetailPage />} />
            <Route path="/patients/:id/edit"     element={<PatientFormPage />} />
            <Route path="/registrations"         element={<RegistrationListPage />} />
            <Route path="/registrations/new"     element={<RegistrationFormPage />} />
          </Route>

          {/* ── Dokter ── */}
          <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
            <Route path="/examination/:registrationId" element={<ExaminationPage />} />
            <Route path="/patients/:id/history"        element={<MedicalHistoryPage />} />
          </Route>

          {/* ── Fallback ── */}
          <Route
            path="/403"
            element={
              <div style={{ textAlign: 'center', marginTop: '10vh' }}>
                <h2>403 – Akses Ditolak</h2>
                <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                <a href="/dashboard">← Kembali ke Dashboard</a>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
