import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

const menuItems = [
  { path: '/dashboard', label: '📊 Dashboard', roles: ['admin', 'doctor', 'receptionist'] },
  { path: '/patients', label: '👤 Data Pasien', roles: ['admin', 'receptionist'] },
  { path: '/registrations', label: '📋 Pendaftaran', roles: ['admin', 'receptionist'] },
  { path: '/queues', label: '🔢 Antrean', roles: ['admin', 'doctor', 'receptionist'] },
];

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const roleLabel = { admin: 'Administrator', doctor: 'Dokter', receptionist: 'Petugas' };

  const visibleMenu = menuItems.filter((m) => !user || m.roles.includes(user.role));

  return (
    <div style={s.container}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>🏥 Klinik Pratama</div>

        <div style={s.userBox}>
          <div style={s.avatar}>{user?.name?.[0] || '?'}</div>
          <div>
            <div style={s.userName}>{user?.name}</div>
            <div style={s.userRole}>{roleLabel[user?.role] || user?.role}</div>
          </div>
        </div>

        <nav style={s.nav}>
          {visibleMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...s.navItem,
                ...(location.pathname.startsWith(item.path) ? s.navActive : {}),
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button style={s.logoutBtn} onClick={handleLogout}>🚪 Keluar</button>
      </aside>

      {/* Main Content */}
      <main style={s.main}>{children}</main>
    </div>
  );
}

const s = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: '240px', background: '#1e3a5f', color: '#fff', display: 'flex', flexDirection: 'column', padding: '0', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
  brand: { padding: '1.5rem 1.2rem', fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  userBox: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#2d6a9f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem' },
  userName: { fontSize: '0.85rem', fontWeight: '600' },
  userRole: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' },
  nav: { display: 'flex', flexDirection: 'column', padding: '1rem 0', flex: 1 },
  navItem: { display: 'block', padding: '0.75rem 1.2rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.2s' },
  navActive: { background: 'rgba(255,255,255,0.15)', color: '#fff', borderLeft: '3px solid #4db6ff' },
  logoutBtn: { margin: '1rem', padding: '0.7rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  main: { marginLeft: '240px', flex: 1, background: '#f0f4f8', minHeight: '100vh', padding: '2rem' },
};
