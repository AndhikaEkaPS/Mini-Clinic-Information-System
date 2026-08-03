import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { medicalRecordService, patientService } from '../../services/api';
import Layout from '../../components/layout/Layout';

export default function MedicalHistoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([
      patientService.getById(id),
      medicalRecordService.getByPatient(id),
    ]).then(([pRes, rRes]) => {
      setPatient(pRes.data.data);
      setRecords(rRes.data.data);
    }).catch(() => toast.error('Gagal memuat riwayat'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p style={{ padding: '2rem' }}>Memuat riwayat...</p></Layout>;

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📋 Riwayat Pemeriksaan</h2>
          {patient && (
            <p style={s.sub}>
              {patient.name} — <span style={s.rmTag}>{patient.medical_record_number}</span>
            </p>
          )}
        </div>
        <button style={s.btnBack} onClick={() => navigate(-1)}>← Kembali</button>
      </div>

      {/* Patient Info */}
      {patient && (
        <div style={s.patientCard}>
          <div style={s.pGrid}>
            <Info label="Nama" value={patient.name} />
            <Info label="NIK" value={patient.nik} />
            <Info label="Jenis Kelamin" value={patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'} />
            <Info label="Tanggal Lahir" value={patient.date_of_birth} />
            <Info label="Telepon" value={patient.phone || '-'} />
            <Info label="Alamat" value={patient.address || '-'} />
          </div>
        </div>
      )}

      {/* Records */}
      <h3 style={s.recTitle}>📅 Daftar Pemeriksaan ({records.length})</h3>

      {records.length === 0 ? (
        <div style={s.emptyBox}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: '#888' }}>Belum ada riwayat pemeriksaan untuk pasien ini</p>
        </div>
      ) : records.map((r) => {
        const isOpen = expanded === r.id;
        const medicines = r.prescription?.medicines || [];
        const actions = (() => { try { return JSON.parse(r.medical_actions || '[]'); } catch { return []; } })();

        return (
          <div key={r.id} style={s.recordCard}>
            {/* Header */}
            <div style={s.recordHeader} onClick={() => setExpanded(isOpen ? null : r.id)}>
              <div>
                <div style={s.recordDate}>
                  📅 {new Date(r.examination_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div style={s.recordDoc}>👨‍⚕️ dr. {r.doctor?.name || '-'}</div>
                <div style={s.diagPreview}>Dx: {r.diagnosis || '-'}</div>
              </div>
              <span style={s.chevron}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Detail */}
            {isOpen && (
              <div style={s.recordBody}>
                {/* SOAP */}
                <div style={s.soapGrid}>
                  <SoapBlock letter="S" color="#e74c3c" title="Subjective">
                    <p>{r.subjective || '-'}</p>
                  </SoapBlock>
                  <SoapBlock letter="O" color="#e67e22" title="Objective (Vital Signs)">
                    <table style={s.vitalTable}>
                      <tbody>
                        <tr><td style={s.vKey}>Tekanan Darah</td><td>{r.blood_pressure || '-'}</td></tr>
                        <tr><td style={s.vKey}>Suhu Tubuh</td><td>{r.temperature ? `${r.temperature} °C` : '-'}</td></tr>
                        <tr><td style={s.vKey}>Berat Badan</td><td>{r.weight ? `${r.weight} kg` : '-'}</td></tr>
                        <tr><td style={s.vKey}>Tinggi Badan</td><td>{r.height ? `${r.height} cm` : '-'}</td></tr>
                      </tbody>
                    </table>
                  </SoapBlock>
                  <SoapBlock letter="A" color="#8e44ad" title="Assessment (Diagnosa)">
                    <p>{r.diagnosis || '-'}</p>
                  </SoapBlock>
                  <SoapBlock letter="P" color="#27ae60" title="Plan (Rencana Terapi)">
                    <p>{r.therapy_plan || '-'}</p>
                  </SoapBlock>
                </div>

                {/* Tindakan */}
                {actions.length > 0 && (
                  <div style={s.subSection}>
                    <h4 style={s.subTitle}>🩹 Tindakan Medis</h4>
                    {actions.map((a, i) => (
                      <div key={i} style={s.actionItem}>
                        <strong>{a.action}</strong>
                        {a.note && <span style={{ color: '#666' }}> — {a.note}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Resep */}
                {medicines.length > 0 && (
                  <div style={s.subSection}>
                    <h4 style={s.subTitle}>💊 Resep Obat</h4>
                    <table style={s.prescTable}>
                      <thead>
                        <tr style={{ background: '#f0f4f8' }}>
                          <th style={s.prescTh}>Nama Obat</th>
                          <th style={s.prescTh}>Dosis</th>
                          <th style={s.prescTh}>Frekuensi</th>
                          <th style={s.prescTh}>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((m, i) => (
                          <tr key={i}>
                            <td style={s.prescTd}><strong>{m.name}</strong></td>
                            <td style={s.prescTd}>{m.dosage || '-'}</td>
                            <td style={s.prescTd}>{m.frequency || '-'}</td>
                            <td style={s.prescTd}>{m.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </Layout>
  );
}

const Info = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.15rem' }}>{label}</div>
    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{value}</div>
  </div>
);

const SoapBlock = ({ letter, color, title, children }) => (
  <div style={{ border: '1px solid #e8edf2', borderRadius: '8px', padding: '1rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <span style={{ background: color, color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>{letter}</span>
      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#333' }}>{title}</span>
    </div>
    <div style={{ fontSize: '0.9rem', color: '#444' }}>{children}</div>
  </div>
);

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub: { color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  rmTag: { background: '#1e3a5f', color: '#fff', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' },
  btnBack: { padding: '0.6rem 1.2rem', background: '#fff', border: '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer' },
  patientCard: { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.5rem' },
  pGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem 2rem' },
  recTitle: { color: '#1e3a5f', marginBottom: '1rem', fontSize: '1rem' },
  emptyBox: { background: '#fff', borderRadius: '12px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  recordCard: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem', overflow: 'hidden' },
  recordHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', cursor: 'pointer', userSelect: 'none' },
  recordDate: { fontWeight: '700', color: '#1e3a5f', marginBottom: '0.2rem' },
  recordDoc: { color: '#555', fontSize: '0.9rem', marginBottom: '0.2rem' },
  diagPreview: { color: '#666', fontSize: '0.85rem', fontStyle: 'italic' },
  chevron: { color: '#888', fontSize: '0.85rem' },
  recordBody: { padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f0f4f8' },
  soapGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' },
  vitalTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  vKey: { color: '#555', paddingRight: '1rem', paddingBottom: '0.25rem', width: '50%' },
  subSection: { marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' },
  subTitle: { color: '#1e3a5f', marginBottom: '0.75rem', fontSize: '0.95rem' },
  actionItem: { padding: '0.4rem 0', borderBottom: '1px solid #eee', fontSize: '0.9rem' },
  prescTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  prescTh: { padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: '600', color: '#555' },
  prescTd: { padding: '0.5rem 0.75rem', borderBottom: '1px solid #eee' },
};
