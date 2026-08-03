import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registrationService, patientService } from '../../services/api';
import api from '../../services/api';
import Layout from '../../components/layout/Layout';

const initialForm = {
  patient_id:    '',
  doctor_id:     '',
  polyclinic_id: '',
  visit_date:    new Date().toISOString().slice(0, 10),
  payment_type:  'umum',
  chief_complaint: '',
};

export default function RegistrationFormPage() {
  const navigate = useNavigate();

  const [form,          setForm]          = useState(initialForm);
  const [patients,      setPatients]      = useState([]);
  const [doctors,       setDoctors]       = useState([]);
  const [polyclinics,   setPolyclinics]   = useState([]);
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(true); // ← loading master data
  const [searchPatient, setSearchPatient] = useState('');

  // ── Load dokter & poli saat halaman pertama dibuka ──────────────────────
  useEffect(() => {
    const loadMasterData = async () => {
      setLoadingMaster(true);
      try {
        const [docRes, polyRes] = await Promise.all([
          api.get('/users?role=doctor'),
          api.get('/polyclinics'),
        ]);

        const docData  = docRes.data?.data  || [];
        const polyData = polyRes.data?.data || [];

        setDoctors(docData);
        setPolyclinics(polyData);

        if (docData.length === 0) {
          toast.warning('Belum ada dokter terdaftar. Tambahkan user dengan role dokter terlebih dahulu.');
        }
        if (polyData.length === 0) {
          toast.warning('Belum ada poli terdaftar. Periksa data polyclinics di database.');
        }
      } catch (err) {
        toast.error('Gagal memuat data dokter / poli. Pastikan backend berjalan.');
        console.error('Master data error:', err);
      } finally {
        setLoadingMaster(false);
      }
    };

    loadMasterData();
  }, []); // hanya sekali saat mount

  // ── Cari pasien ─────────────────────────────────────────────────────────
  const searchPatients = async () => {
    if (!searchPatient.trim()) {
      toast.warning('Masukkan kata kunci pencarian terlebih dahulu');
      return;
    }
    try {
      const res = await patientService.getAll({ search: searchPatient, limit: 20 });
      const found = res.data?.data?.data || [];
      setPatients(found);
      if (found.length === 0) toast.info('Pasien tidak ditemukan. Daftarkan pasien baru terlebih dahulu.');
    } catch {
      toast.error('Gagal mencari pasien');
    }
  };

  // ── Validasi ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.patient_id)        e.patient_id     = 'Pasien wajib dipilih';
    if (!form.doctor_id)         e.doctor_id      = 'Dokter wajib dipilih';
    if (!form.polyclinic_id)     e.polyclinic_id  = 'Poli wajib dipilih';
    if (!form.visit_date)        e.visit_date     = 'Tanggal kunjungan wajib diisi';
    if (!form.chief_complaint.trim()) e.chief_complaint = 'Keluhan awal wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await registrationService.create(form);
      toast.success('Pendaftaran berhasil! Nomor antrean telah dibuat otomatis.');
      navigate('/registrations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftarkan pasien');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const selectedPatient = patients.find((p) => p.id === parseInt(form.patient_id));

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📋 Pendaftaran Pasien</h2>
          <p style={s.sub}>Daftarkan pasien untuk kunjungan</p>
        </div>
        <button style={s.btnBack} onClick={() => navigate('/registrations')}>← Kembali</button>
      </div>

      <div style={s.card}>
        <form onSubmit={handleSubmit}>

          {/* ── STEP 1: Cari Pasien ── */}
          <h3 style={s.sectionTitle}>1. Pilih Pasien</h3>
          <div style={s.searchRow}>
            <input
              style={s.searchInput}
              placeholder="Cari nama, NIK, atau No. RM pasien..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchPatients())}
            />
            <button type="button" style={s.btnSearch} onClick={searchPatients}>
              🔍 Cari
            </button>
          </div>

          {patients.length > 0 && (
            <div style={s.fieldWrap}>
              <label style={s.label}>Pilih Pasien *</label>
              <select
                style={inp(errors.patient_id)}
                value={form.patient_id}
                onChange={set('patient_id')}
              >
                <option value="">-- Pilih Pasien --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.medical_record_number} — NIK: {p.nik}
                  </option>
                ))}
              </select>
              {errors.patient_id && <ErrMsg msg={errors.patient_id} />}
            </div>
          )}

          {selectedPatient && (
            <div style={s.patientCard}>
              <strong>👤 {selectedPatient.name}</strong>
              <span style={s.rmTag}>{selectedPatient.medical_record_number}</span>
              <span style={{ color: '#555' }}> | NIK: {selectedPatient.nik}</span>
            </div>
          )}

          {/* ── STEP 2: Detail Kunjungan ── */}
          <h3 style={{ ...s.sectionTitle, marginTop: '1.5rem' }}>2. Detail Kunjungan</h3>

          {/* Loading state master data */}
          {loadingMaster ? (
            <div style={s.loadingBox}>
              ⏳ Memuat data dokter dan poli...
            </div>
          ) : (
            <div style={s.grid3}>

              {/* Dokter */}
              <div style={s.fieldWrap}>
                <label style={s.label}>Dokter *</label>
                {doctors.length === 0 ? (
                  <div style={s.emptyWarn}>
                    ⚠️ Belum ada dokter. Tambahkan user dengan role <strong>doctor</strong> di database.
                  </div>
                ) : (
                  <select
                    style={inp(errors.doctor_id)}
                    value={form.doctor_id}
                    onChange={set('doctor_id')}
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>dr. {d.name}</option>
                    ))}
                  </select>
                )}
                {errors.doctor_id && <ErrMsg msg={errors.doctor_id} />}
              </div>

              {/* Poli */}
              <div style={s.fieldWrap}>
                <label style={s.label}>Poli *</label>
                {polyclinics.length === 0 ? (
                  <div style={s.emptyWarn}>
                    ⚠️ Belum ada poli. Periksa tabel <strong>polyclinics</strong> di database.
                  </div>
                ) : (
                  <select
                    style={inp(errors.polyclinic_id)}
                    value={form.polyclinic_id}
                    onChange={set('polyclinic_id')}
                  >
                    <option value="">-- Pilih Poli --</option>
                    {polyclinics.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
                {errors.polyclinic_id && <ErrMsg msg={errors.polyclinic_id} />}
              </div>

              {/* Tanggal */}
              <div style={s.fieldWrap}>
                <label style={s.label}>Tanggal Kunjungan *</label>
                <input
                  type="date"
                  style={inp(errors.visit_date)}
                  value={form.visit_date}
                  onChange={set('visit_date')}
                />
                {errors.visit_date && <ErrMsg msg={errors.visit_date} />}
              </div>
            </div>
          )}

          <div style={s.grid2}>
            {/* Pembayaran */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Jenis Pembayaran *</label>
              <select style={inp()} value={form.payment_type} onChange={set('payment_type')}>
                <option value="umum">Umum</option>
                <option value="bpjs">BPJS</option>
                <option value="asuransi">Asuransi</option>
              </select>
            </div>

            {/* Keluhan */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Keluhan Awal *</label>
              <textarea
                style={{ ...inp(errors.chief_complaint), height: '80px', resize: 'vertical' }}
                value={form.chief_complaint}
                onChange={set('chief_complaint')}
                placeholder="Deskripsikan keluhan pasien..."
              />
              {errors.chief_complaint && <ErrMsg msg={errors.chief_complaint} />}
            </div>
          </div>

          <div style={s.infoBox}>
            ℹ️ Nomor antrean akan dibuat otomatis setelah pendaftaran berhasil
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              style={{ ...s.btnSubmit, opacity: loadingMaster ? 0.6 : 1 }}
              type="submit"
              disabled={loading || loadingMaster}
            >
              {loading ? '⏳ Mendaftarkan...' : '✅ Daftarkan Pasien'}
            </button>
            <button style={s.btnCancel} type="button" onClick={() => navigate('/registrations')}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

// ── Sub-komponen kecil ───────────────────────────────────────────────────────
const ErrMsg = ({ msg }) => (
  <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>
    {msg}
  </span>
);

const inp = (err) => ({
  width: '100%', padding: '0.7rem 1rem',
  border: `1.5px solid ${err ? '#e74c3c' : '#ddd'}`,
  borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none',
});

// ── Styles ───────────────────────────────────────────────────────────────────
const s = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title:        { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub:          { color: '#888', fontSize: '0.9rem' },
  btnBack:      { padding: '0.6rem 1.2rem', background: '#fff', border: '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer' },
  card:         { background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitle: { color: '#1e3a5f', fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #f0f4f8' },
  searchRow:    { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  searchInput:  { flex: 1, padding: '0.7rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.95rem' },
  btnSearch:    { padding: '0.7rem 1.4rem', background: '#2d6a9f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  fieldWrap:    { marginBottom: '0.25rem' },
  label:        { display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#333', fontSize: '0.9rem' },
  grid3:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  patientCard:  { background: '#e8f0fe', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  rmTag:        { background: '#1e3a5f', color: '#fff', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', margin: '0 0.5rem' },
  loadingBox:   { background: '#f0f4f8', padding: '1rem', borderRadius: '8px', color: '#555', marginBottom: '1rem', textAlign: 'center' },
  emptyWarn:    { background: '#fff3cd', border: '1px solid #ffc107', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#856404' },
  infoBox:      { background: '#fff8e1', color: '#856404', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginTop: '0.5rem' },
  btnSubmit:    { padding: '0.8rem 2rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnCancel:    { padding: '0.8rem 1.5rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};
