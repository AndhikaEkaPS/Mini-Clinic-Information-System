import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { patientService, medicalRecordService } from '../../services/api';
import Layout from '../../components/layout/Layout';

export default function PatientDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      patientService.getById(id),
      medicalRecordService.getByPatient(id),
    ]).then(([pRes, rRes]) => {
      setPatient(pRes.data.data);
      setRecords(rRes.data.data);
    }).catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p>Memuat...</p></Layout>;
  if (!patient) return <Layout><p>Pasien tidak ditemukan</p></Layout>;

  const genderLabel = { male: 'Laki-laki', female: 'Perempuan' };
  const age = patient.date_of_birth
    ? Math.floor((new Date() - new Date(patient.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
    : '-';

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>👤 Detail Pasien</h2>
          <p style={s.sub}>Informasi lengkap pasien</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={s.btnEdit} onClick={() => navigate(`/patients/${id}/edit`)}>✏️ Edit</button>
          <button style={s.btnBack} onClick={() => navigate('/patients')}>← Kembali</button>
        </div>
      </div>

      {/* Patient Info Card */}
      <div style={s.card}>
        <div style={s.rmBadge}>{patient.medical_record_number}</div>
        <div style={s.grid2}>
          <InfoRow label="Nama Lengkap" value={patient.name} />
          <InfoRow label="NIK" value={patient.nik} />
          <InfoRow label="Jenis Kelamin" value={genderLabel[patient.gender]} />
          <InfoRow label="Tanggal Lahir" value={`${patient.date_of_birth} (${age} tahun)`} />
          <InfoRow label="Nomor Telepon" value={patient.phone || '-'} />
          <InfoRow label="Alamat" value={patient.address || '-'} />
        </div>
      </div>

      {/* Medical History */}
      <div style={s.card}>
        <h3 style={s.sectionTitle}>📋 Riwayat Pemeriksaan</h3>
        {records.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '1.5rem' }}>Belum ada riwayat pemeriksaan</p>
        ) : records.map((r) => (
          <div key={r.id} style={s.recordItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{new Date(r.examination_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>
                <span style={s.doctorTag}> oleh dr. {r.doctor?.name}</span>
              </div>
            </div>
            <div style={s.soapGrid}>
              <div><span style={s.soapLabel}>Keluhan:</span> {r.subjective || '-'}</div>
              <div><span style={s.soapLabel}>Diagnosa:</span> {r.diagnosis || '-'}</div>
              <div><span style={s.soapLabel}>TD:</span> {r.blood_pressure || '-'} | <span style={s.soapLabel}>Suhu:</span> {r.temperature ? `${r.temperature}°C` : '-'}</div>
              <div><span style={s.soapLabel}>Terapi:</span> {r.therapy_plan || '-'}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const InfoRow = ({ label, value }) => (
  <div style={{ marginBottom: '0.75rem' }}>
    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>{label}</div>
    <div style={{ fontWeight: '600', color: '#222' }}>{value}</div>
  </div>
);

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub: { color: '#888', fontSize: '0.9rem' },
  btnBack: { padding: '0.6rem 1.2rem', background: '#fff', border: '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer' },
  btnEdit: { padding: '0.6rem 1.2rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  rmBadge: { display: 'inline-block', background: '#1e3a5f', color: '#fff', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: '700', marginBottom: '1rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' },
  sectionTitle: { color: '#1e3a5f', marginBottom: '1rem', borderBottom: '2px solid #f0f4f8', paddingBottom: '0.5rem' },
  recordItem: { border: '1px solid #e8edf2', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' },
  doctorTag: { color: '#2d6a9f', fontSize: '0.85rem' },
  soapGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.9rem' },
  soapLabel: { fontWeight: '600', color: '#555' },
};
