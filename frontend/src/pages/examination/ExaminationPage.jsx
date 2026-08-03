import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { medicalRecordService, registrationService } from '../../services/api';
import Layout from '../../components/layout/Layout';

const initialForm = {
  subjective: '',
  blood_pressure: '', temperature: '', weight: '', height: '',
  diagnosis: '', therapy_plan: '',
  medical_actions: [{ action: '', note: '' }],
  medicines: [{ name: '', dosage: '', frequency: '', notes: '' }],
};

export default function ExaminationPage() {
  const navigate = useNavigate();
  const { registrationId } = useParams();
  const [form, setForm] = useState(initialForm);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('soap'); // 'soap' | 'prescription'

  useEffect(() => {
    registrationService.getAll().then((res) => {
      const reg = res.data.data.find((r) => r.id === parseInt(registrationId));
      setRegistration(reg);
      if (reg) setForm((f) => ({ ...f, subjective: reg.chief_complaint || '' }));
    }).catch(() => toast.error('Gagal memuat data pendaftaran'));
  }, [registrationId]);

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Medical actions
  const setAction = (i, k) => (e) => {
    const arr = [...form.medical_actions];
    arr[i] = { ...arr[i], [k]: e.target.value };
    setForm({ ...form, medical_actions: arr });
  };
  const addAction = () => setForm({ ...form, medical_actions: [...form.medical_actions, { action: '', note: '' }] });
  const removeAction = (i) => setForm({ ...form, medical_actions: form.medical_actions.filter((_, idx) => idx !== i) });

  // Medicines
  const setMed = (i, k) => (e) => {
    const arr = [...form.medicines];
    arr[i] = { ...arr[i], [k]: e.target.value };
    setForm({ ...form, medicines: arr });
  };
  const addMed = () => setForm({ ...form, medicines: [...form.medicines, { name: '', dosage: '', frequency: '', notes: '' }] });
  const removeMed = (i) => setForm({ ...form, medicines: form.medicines.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjective.trim() || !form.diagnosis.trim()) {
      toast.error('Keluhan dan diagnosa wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const recordRes = await medicalRecordService.create({
        registration_id: parseInt(registrationId),
        patient_id: registration?.patient_id,
        subjective: form.subjective,
        blood_pressure: form.blood_pressure,
        temperature: form.temperature || null,
        weight: form.weight || null,
        height: form.height || null,
        diagnosis: form.diagnosis,
        therapy_plan: form.therapy_plan,
        medical_actions: form.medical_actions.filter((a) => a.action.trim()),
      });

      // Save prescription if medicines filled
      const meds = form.medicines.filter((m) => m.name.trim());
      if (meds.length > 0) {
        await medicalRecordService.createPrescription({
          medical_record_id: recordRes.data.data.id,
          patient_id: registration?.patient_id,
          medicines: meds,
        });
      }

      toast.success('Pemeriksaan berhasil disimpan');
      navigate('/queues');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pemeriksaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>🩺 Pemeriksaan Pasien</h2>
          {registration && <p style={s.sub}>Pasien: <strong>{registration.patient?.name}</strong> — {registration.patient?.medical_record_number}</p>}
        </div>
        <button style={s.btnBack} onClick={() => navigate('/queues')}>← Kembali</button>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab === 'soap' ? s.tabActive : {}) }} onClick={() => setTab('soap')}>📝 SOAP & Tindakan</button>
        <button style={{ ...s.tab, ...(tab === 'prescription' ? s.tabActive : {}) }} onClick={() => setTab('prescription')}>💊 Resep Obat</button>
      </div>

      <form onSubmit={handleSubmit}>
        {tab === 'soap' && (
          <div style={s.card}>
            {/* S - Subjective */}
            <SectionTitle letter="S" title="Subjective — Keluhan Pasien" color="#e74c3c" />
            <Field label="Keluhan Utama *">
              <textarea style={inp()} rows={3} value={form.subjective} onChange={setField('subjective')} placeholder="Deskripsikan keluhan yang dirasakan pasien..." />
            </Field>

            {/* O - Objective */}
            <SectionTitle letter="O" title="Objective — Pemeriksaan Fisik" color="#e67e22" />
            <div style={s.grid4}>
              <Field label="Tekanan Darah"><input style={inp()} value={form.blood_pressure} onChange={setField('blood_pressure')} placeholder="120/80 mmHg" /></Field>
              <Field label="Suhu Tubuh (°C)"><input style={inp()} type="number" step="0.1" value={form.temperature} onChange={setField('temperature')} placeholder="36.5" /></Field>
              <Field label="Berat Badan (kg)"><input style={inp()} type="number" step="0.1" value={form.weight} onChange={setField('weight')} placeholder="60" /></Field>
              <Field label="Tinggi Badan (cm)"><input style={inp()} type="number" value={form.height} onChange={setField('height')} placeholder="165" /></Field>
            </div>

            {/* A - Assessment */}
            <SectionTitle letter="A" title="Assessment — Diagnosa" color="#8e44ad" />
            <Field label="Diagnosa *">
              <textarea style={inp()} rows={3} value={form.diagnosis} onChange={setField('diagnosis')} placeholder="Tulis diagnosa dokter..." />
            </Field>

            {/* P - Plan */}
            <SectionTitle letter="P" title="Plan — Rencana Terapi" color="#27ae60" />
            <Field label="Rencana Terapi">
              <textarea style={inp()} rows={3} value={form.therapy_plan} onChange={setField('therapy_plan')} placeholder="Tulis rencana terapi / tindakan lanjutan..." />
            </Field>

            {/* Tindakan Medis */}
            <SectionTitle letter="+" title="Tindakan Medis" color="#2d6a9f" />
            {form.medical_actions.map((a, i) => (
              <div key={i} style={s.actionRow}>
                <input style={{ ...inp(), flex: 1 }} value={a.action} onChange={setAction(i, 'action')} placeholder={`Tindakan ${i + 1}`} />
                <input style={{ ...inp(), flex: 1 }} value={a.note} onChange={setAction(i, 'note')} placeholder="Catatan" />
                {form.medical_actions.length > 1 && (
                  <button type="button" style={s.btnRemove} onClick={() => removeAction(i)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" style={s.btnAdd} onClick={addAction}>+ Tambah Tindakan</button>
          </div>
        )}

        {tab === 'prescription' && (
          <div style={s.card}>
            <h3 style={s.prescTitle}>💊 Resep Obat</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>Tambahkan obat yang akan diresepkan untuk pasien</p>

            {form.medicines.map((m, i) => (
              <div key={i} style={s.medRow}>
                <div style={s.medNum}>#{i + 1}</div>
                <div style={s.medGrid}>
                  <Field label="Nama Obat"><input style={inp()} value={m.name} onChange={setMed(i, 'name')} placeholder="Nama obat" /></Field>
                  <Field label="Dosis"><input style={inp()} value={m.dosage} onChange={setMed(i, 'dosage')} placeholder="500mg" /></Field>
                  <Field label="Frekuensi"><input style={inp()} value={m.frequency} onChange={setMed(i, 'frequency')} placeholder="3x sehari" /></Field>
                  <Field label="Keterangan"><input style={inp()} value={m.notes} onChange={setMed(i, 'notes')} placeholder="Sesudah makan" /></Field>
                </div>
                {form.medicines.length > 1 && (
                  <button type="button" style={s.btnRemoveMed} onClick={() => removeMed(i)}>🗑</button>
                )}
              </div>
            ))}
            <button type="button" style={s.btnAdd} onClick={addMed}>+ Tambah Obat</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button style={s.btnSubmit} type="submit" disabled={loading}>
            {loading ? '⏳ Menyimpan...' : '💾 Simpan Pemeriksaan'}
          </button>
          <button style={s.btnCancel} type="button" onClick={() => navigate('/queues')}>Batal</button>
        </div>
      </form>
    </Layout>
  );
}

const SectionTitle = ({ letter, title, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', marginTop: '1.5rem' }}>
    <span style={{ background: color, color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>{letter}</span>
    <span style={{ fontWeight: '700', color: '#333' }}>{title}</span>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: '0.75rem' }}>
    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '600', color: '#555', fontSize: '0.85rem' }}>{label}</label>
    {children}
  </div>
);

const inp = () => ({ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' });

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  title: { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub: { color: '#555', fontSize: '0.9rem' },
  btnBack: { padding: '0.6rem 1.2rem', background: '#fff', border: '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '0', marginBottom: '0', borderBottom: '2px solid #e0e0e0' },
  tab: { padding: '0.75rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', color: '#666' },
  tabActive: { color: '#1e3a5f', fontWeight: '700', borderBottom: '2px solid #1e3a5f', marginBottom: '-2px' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: '1rem' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  actionRow: { display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' },
  medRow: { display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', border: '1px solid #e8edf2', borderRadius: '8px', marginBottom: '0.75rem' },
  medNum: { background: '#1e3a5f', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 },
  medGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', flex: 1 },
  prescTitle: { color: '#1e3a5f', marginBottom: '0.25rem' },
  btnAdd: { padding: '0.5rem 1rem', background: '#e8f0fe', color: '#1e3a5f', border: '1px dashed #2d6a9f', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  btnRemove: { padding: '0.4rem 0.7rem', background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnRemoveMed: { padding: '0.4rem 0.7rem', background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 },
  btnSubmit: { padding: '0.8rem 2rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnCancel: { padding: '0.8rem 1.5rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};
