import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registrationService } from '../../services/api';
import Layout from '../../components/layout/Layout';

const statusConfig = {
  waiting:     { label: 'Menunggu',    color: '#f39c12', bg: '#fff8e1' },
  checkin:     { label: 'Check In',    color: '#2d6a9f', bg: '#e8f0fe' },
  examination: { label: 'Pemeriksaan', color: '#8e44ad', bg: '#f3e5f5' },
  done:        { label: 'Selesai',     color: '#27ae60', bg: '#e8f5e9' },
};

export default function RegistrationListPage() {
  const navigate = useNavigate();

  const [regs,         setRegs]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [filterDate,   setFilterDate]   = useState(new Date().toISOString().slice(0, 10));
  const [filterStatus, setFilterStatus] = useState('');

  // ✅ useCallback — filterDate & filterStatus sebagai dependency
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate)   params.date   = filterDate;
      if (filterStatus) params.status = filterStatus;
      const res = await registrationService.getAll(params);
      setRegs(res.data.data);
    } catch {
      toast.error('Gagal memuat data pendaftaran');
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStatus]);        // ✅ kedua filter didaftarkan

  // ✅ fetchData aman didaftarkan — ulang otomatis saat filter berubah
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id, status) => {
    try {
      await registrationService.updateStatus(id, { status });
      toast.success('Status berhasil diperbarui');
      fetchData();
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📋 Pendaftaran Pasien</h2>
          <p style={s.sub}>Daftar kunjungan pasien</p>
        </div>
        <button style={s.btnPrimary} onClick={() => navigate('/registrations/new')}>
          + Daftarkan Pasien
        </button>
      </div>

      {/* Filter */}
      <div style={s.filterRow}>
        <div style={s.filterItem}>
          <label style={s.filterLabel}>Tanggal Kunjungan</label>
          <input
            type="date"
            style={s.filterInput}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div style={s.filterItem}>
          <label style={s.filterLabel}>Status</label>
          <select
            style={s.filterInput}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Memuat...</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>No Antrean</th>
                <th style={s.th}>Pasien</th>
                <th style={s.th}>Dokter</th>
                <th style={s.th}>Poli</th>
                <th style={s.th}>Pembayaran</th>
                <th style={s.th}>Keluhan</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {regs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    Tidak ada data pendaftaran
                  </td>
                </tr>
              ) : regs.map((r, i) => {
                const sc = statusConfig[r.status] || statusConfig.waiting;
                return (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                    <td style={s.td}>
                      <span style={s.queueBadge}>{r.queue?.queue_number || '-'}</span>
                    </td>
                    <td style={s.td}>
                      <div><strong>{r.patient?.name}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        {r.patient?.medical_record_number}
                      </div>
                    </td>
                    <td style={s.td}>{r.doctor?.name || '-'}</td>
                    <td style={s.td}>{r.polyclinic?.name || '-'}</td>
                    <td style={s.td}>
                      <span style={s.payBadge}>{r.payment_type?.toUpperCase()}</span>
                    </td>
                    <td style={s.td}>
                      <span title={r.chief_complaint}>
                        {r.chief_complaint?.length > 30
                          ? r.chief_complaint.slice(0, 30) + '...'
                          : r.chief_complaint || '-'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, color: sc.color, background: sc.bg }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={s.td}>
                      <select
                        style={s.selectStatus}
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      >
                        {Object.entries(statusConfig).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

const s = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title:        { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub:          { color: '#888', fontSize: '0.9rem' },
  btnPrimary:   { padding: '0.7rem 1.5rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  filterRow:    { display: 'flex', gap: '1rem', marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  filterItem:   { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  filterLabel:  { fontSize: '0.8rem', fontWeight: '600', color: '#555' },
  filterInput:  { padding: '0.5rem 0.8rem', border: '1.5px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' },
  tableWrap:    { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  thead:        { background: '#1e3a5f', color: '#fff' },
  th:           { padding: '1rem 0.75rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' },
  td:           { padding: '0.75rem', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' },
  queueBadge:   { background: '#1e3a5f', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' },
  payBadge:     { background: '#e8f5e9', color: '#27ae60', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' },
  statusBadge:  { padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600' },
  selectStatus: { padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' },
};
