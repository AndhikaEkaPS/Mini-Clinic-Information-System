import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { patientService } from '../../services/api';
import Layout from '../../components/layout/Layout';

const initialForm = { nik: '', name: '', gender: '', date_of_birth: '', phone: '', address: '' };

export default function PatientFormPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);          // ✅ bukan state, cukup derived value

  const [form,    setForm]    = useState(initialForm);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ isEdit dimasukkan ke dependency array
  // Aman karena isEdit hanya berubah jika id berubah (ganti halaman)
  useEffect(() => {
    if (!isEdit) return;                 // mode tambah → tidak perlu fetch

    patientService.getById(id)
      .then((res) => {
        const p = res.data.data;
        setForm({
          nik:           p.nik,
          name:          p.name,
          gender:        p.gender,
          date_of_birth: p.date_of_birth,
          phone:         p.phone  || '',
          address:       p.address || '',
        });
      })
      .catch(() => toast.error('Gagal memuat data pasien'));
  }, [id, isEdit]);                      // ✅ kedua dependency didaftarkan

  const validate = () => {
    const e = {};
    if (!form.nik || form.nik.length !== 16) e.nik = 'NIK harus 16 digit';
    if (!form.name.trim())                   e.name = 'Nama wajib diisi';
    if (!form.gender)                        e.gender = 'Jenis kelamin wajib dipilih';
    if (!form.date_of_birth)                 e.date_of_birth = 'Tanggal lahir wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await patientService.update(id, form);
        toast.success('Data pasien berhasil diperbarui');
      } else {
        await patientService.create(form);
        toast.success('Pasien berhasil ditambahkan');
      }
      navigate('/patients');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data';
      toast.error(msg);
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>{isEdit ? '✏️ Edit Pasien' : '➕ Tambah Pasien'}</h2>
          <p style={s.sub}>{isEdit ? 'Perbarui data pasien' : 'Daftarkan pasien baru'}</p>
        </div>
        <button style={s.btnBack} onClick={() => navigate('/patients')}>← Kembali</button>
      </div>

      <div style={s.card}>
        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <div style={s.infoBox}>
              ℹ️ Nomor Rekam Medis akan dibuat otomatis oleh sistem
            </div>
          )}

          <div style={s.grid2}>
            <Field label="NIK *" error={errors.nik}>
              <input style={inp(errors.nik)} value={form.nik} onChange={set('nik')} maxLength={16} placeholder="16 digit NIK" />
            </Field>
            <Field label="Nama Lengkap *" error={errors.name}>
              <input style={inp(errors.name)} value={form.name} onChange={set('name')} placeholder="Nama pasien" />
            </Field>
          </div>

          <div style={s.grid2}>
            <Field label="Jenis Kelamin *" error={errors.gender}>
              <select style={inp(errors.gender)} value={form.gender} onChange={set('gender')}>
                <option value="">-- Pilih --</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </Field>
            <Field label="Tanggal Lahir *" error={errors.date_of_birth}>
              <input style={inp(errors.date_of_birth)} type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            </Field>
          </div>

          <div style={s.grid2}>
            <Field label="Nomor Telepon">
              <input style={inp()} value={form.phone} onChange={set('phone')} placeholder="08xx-xxxx-xxxx" />
            </Field>
            <Field label="Alamat">
              <textarea style={{ ...inp(), height: '80px', resize: 'vertical' }} value={form.address} onChange={set('address')} placeholder="Alamat lengkap" />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button style={s.btnSubmit} type="submit" disabled={loading}>
              {loading ? '⏳ Menyimpan...' : isEdit ? '💾 Simpan Perubahan' : '✅ Tambah Pasien'}
            </button>
            <button style={s.btnCancel} type="button" onClick={() => navigate('/patients')}>Batal</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{label}</label>
    {children}
    {error && <span style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{error}</span>}
  </div>
);

const inp = (err) => ({
  width: '100%', padding: '0.7rem 1rem',
  border: `1.5px solid ${err ? '#e74c3c' : '#ddd'}`,
  borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none',
});

const s = {
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title:     { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub:       { color: '#888', fontSize: '0.9rem' },
  btnBack:   { padding: '0.6rem 1.2rem', background: '#fff', border: '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer' },
  card:      { background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  infoBox:   { background: '#e8f0fe', color: '#1e3a5f', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' },
  grid2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  btnSubmit: { padding: '0.8rem 2rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnCancel: { padding: '0.8rem 1.5rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};
