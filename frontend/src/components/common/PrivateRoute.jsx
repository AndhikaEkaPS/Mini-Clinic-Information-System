import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { authService } from '../../services/api';

export default function PrivateRoute({ allowedRoles = [] }) {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Jika ada token tapi user belum ada di Redux (misal setelah refresh halaman)
    // fetch /auth/me untuk isi ulang data user
    if (token && !user) {
      authService.me()
        .then((res) => {
          dispatch(setUser(res.data.data));
        })
        .catch(() => {
          // Token tidak valid — bersihkan dan paksa login ulang
          localStorage.removeItem('token');
          window.location.href = '/login';
        })
        .finally(() => setChecking(false));
    } else {
      // Token tidak ada ATAU user sudah ada — tidak perlu fetch
      setChecking(false);
    }
  }, [token, user, dispatch]);

  // Sedang verifikasi token → tampilkan loading screen
  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#f0f4f8', gap: '1rem',
      }}>
        <div style={{ fontSize: '2.5rem' }}>🏥</div>
        <p style={{ color: '#555', fontSize: '0.95rem' }}>Memuat sesi pengguna...</p>
      </div>
    );
  }

  // Tidak ada token → redirect ke login
  if (!token) return <Navigate to="/login" replace />;

  // Role tidak diizinkan → halaman 403
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
