import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/api';
import Layout from '../../components/layout/Layout';

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ ...s.card, borderTop: `4px solid ${color}` }}>
    <div style={{ fontSize: '2rem' }}>{icon}</div>
    <div style={s.cardVal}>{value ?? '-'}</div>
    <div style={s.cardLabel}>{label}</div>
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getSummary()
      .then((res) => setData(res.data.data))
      .catch(() => setError('Gagal memuat data dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h2 style={s.title}>📊 Dashboard</h2>
      <p style={s.sub}>Ringkasan aktivitas klinik hari ini</p>

      {loading && <p>Memuat data...</p>}
      {error && <div style={s.error}>{error}</div>}

      {data && (
        <div style={s.grid}>
          <StatCard icon="👥" label="Total Pasien Terdaftar" value={data.total_patients} color="#1e3a5f" />
          <StatCard icon="🗓️" label="Pasien Hari Ini" value={data.total_patients_today} color="#2d6a9f" />
          <StatCard icon="🔢" label="Total Antrean Hari Ini" value={data.total_queues_today} color="#f39c12" />
          <StatCard icon="⏳" label="Pasien Menunggu" value={data.total_waiting} color="#e74c3c" />
          <StatCard icon="✅" label="Pasien Selesai" value={data.total_done} color="#27ae60" />
        </div>
      )}
    </Layout>
  );
}

const s = {
  title: { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub: { color: '#888', marginBottom: '2rem', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  cardVal: { fontSize: '2.5rem', fontWeight: '800', color: '#1e3a5f', margin: '0.5rem 0' },
  cardLabel: { color: '#666', fontSize: '0.9rem', fontWeight: '500' },
  error: { background: '#ffe0e0', color: '#c00', padding: '1rem', borderRadius: '8px' },
};
