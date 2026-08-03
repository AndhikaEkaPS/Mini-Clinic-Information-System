import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { patientService } from '../../services/api';
import Layout from '../../components/layout/Layout';

export default function PatientListPage() {
  const navigate = useNavigate();

  const [patients,   setPatients]   = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(false);

  // ✅ useCallback — referensi stabil, dependency [search] didaftarkan
  const fetchPatients = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const res = await patientService.getAll({ page, limit: 10, search: q });
      setPatients(res.data.data.data);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Gagal memuat data pasien');
    } finally {
      setLoading(false);
    }
  }, [search]);                          // ✅ search sebagai dependency useCallback

  // ✅ fetchPatients aman didaftarkan — hanya jalan ulang jika fetchPatients berubah
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(1, search);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus pasien "${name}"?`)) return;
    try {
      await patientService.delete(id);
      toast.success('Pasien berhasil dihapus');
      fetchPatients(pagination.page);
    } catch {
      toast.error('Gagal menghapus pasien');
    }
  };

  const genderLabel = { male: 'Laki-laki', female: 'Perempuan' };

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>👤 Data Pasien</h2>
          <p style={s.sub}>Kelola data pasien klinik</p>
        </div>
        <button style={s.btnPrimary} onClick={() => navigate('/patients/new')}>+ Tambah Pasien</button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={s.searchRow}>
        <input
          style={s.searchInput}
          placeholder="Cari nama, NIK, atau No. RM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={s.btnSearch} type="submit">🔍 Cari</button>
        {search && (
          <button
            style={s.btnReset}
            type="button"
            onClick={() => { setSearch(''); fetchPatients(1, ''); }}
          >
            ✕ Reset
          </button>
        )}
      </form>

      {/* Table */}
      <div style={s.tableWrap}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Memuat...</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>No. RM</th>
                <th style={s.th}>NIK</th>
                <th style={s.th}>Nama</th>
                <th style={s.th}>Jenis Kelamin</th>
                <th style={s.th}>Tanggal Lahir</th>
                <th style={s.th}>Telepon</th>
                <th style={s.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    Tidak ada data pasien
                  </td>
                </tr>
              ) : patients.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                  <td style={s.td}><span style={s.badge}>{p.medical_record_number}</span></td>
                  <td style={s.td}>{p.nik}</td>
                  <td style={s.td}><strong>{p.name}</strong></td>
                  <td style={s.td}>{genderLabel[p.gender] || p.gender}</td>
                  <td style={s.td}>{p.date_of_birth}</td>
                  <td style={s.td}>{p.phone || '-'}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button style={s.btnView} onClick={() => navigate(`/patients/${p.id}`)}>👁</button>
                      <button style={s.btnEdit} onClick={() => navigate(`/patients/${p.id}/edit`)}>✏️</button>
                      <button style={s.btnDel}  onClick={() => handleDelete(p.id, p.name)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={s.paginationRow}>
        <span style={{ color: '#666', fontSize: '0.85rem' }}>
          Total: {pagination.total} pasien &nbsp;|&nbsp; Halaman {pagination.page} dari {pagination.totalPages}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            style={s.btnPage}
            disabled={pagination.page <= 1}
            onClick={() => fetchPatients(pagination.page - 1)}
          >
            ← Prev
          </button>
          <button
            style={s.btnPage}
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchPatients(pagination.page + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </Layout>
  );
}

const s = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title:        { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub:          { color: '#888', fontSize: '0.9rem' },
  btnPrimary:   { padding: '0.7rem 1.5rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  searchRow:    { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  searchInput:  { flex: 1, padding: '0.65rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.95rem' },
  btnSearch:    { padding: '0.65rem 1.2rem', background: '#2d6a9f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btnReset:     { padding: '0.65rem 1rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tableWrap:    { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#1e3a5f', color: '#fff' },
  th:           { padding: '1rem 0.75rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' },
  td:           { padding: '0.75rem', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' },
  badge:        { background: '#e8f0fe', color: '#1e3a5f', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  btnView:      { padding: '0.35rem 0.6rem', background: '#e8f0fe', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnEdit:      { padding: '0.35rem 0.6rem', background: '#fff8e1', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnDel:       { padding: '0.35rem 0.6rem', background: '#fce4ec', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  paginationRow:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
  btnPage:      { padding: '0.5rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' },
};
