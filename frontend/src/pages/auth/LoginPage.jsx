import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate('/dashboard');
  };

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <div style={s.logo}>🏥</div>
        <h2 style={s.title}>Klinik Pratama</h2>
        <p style={s.sub}>Mini Clinic Information System</p>

        {error && <div style={s.alert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              type="text"
              placeholder="Masukkan username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? '⏳ Memproses...' : 'Masuk'}
          </button>
        </form>

        <p style={s.hint}>
          Default: admin / password &nbsp;|&nbsp; dokter1 / password &nbsp;|&nbsp; petugas1 / password
        </p>
      </div>
    </div>
  );
}

const s = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)' },
  card: { background: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', width: '380px' },
  logo: { textAlign: 'center', fontSize: '3rem', marginBottom: '0.5rem' },
  title: { textAlign: 'center', color: '#1e3a5f', marginBottom: '0.25rem', fontSize: '1.5rem' },
  sub: { textAlign: 'center', color: '#888', marginBottom: '1.5rem', fontSize: '0.85rem' },
  alert: { background: '#ffe0e0', color: '#c00', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#333', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '0.85rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem' },
  hint: { textAlign: 'center', color: '#aaa', fontSize: '0.75rem', marginTop: '1.5rem' },
};
