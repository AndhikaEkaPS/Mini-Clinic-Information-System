import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { queueService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';

const statusConfig = {
  waiting: { label: 'Menunggu',  color: '#f39c12', bg: '#fff8e1' },
  called:  { label: 'Dipanggil', color: '#2d6a9f', bg: '#e8f0fe' },
  done:    { label: 'Selesai',   color: '#27ae60', bg: '#e8f5e9' },
  skip:    { label: 'Dilewati',  color: '#888',    bg: '#f5f5f5' },
};

export default function QueuePage() {
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);

  const [queues,    setQueues]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10));
  const [callingId, setCallingId] = useState(null);

  // ✅ Wrap dengan useCallback agar referensi stabil
  // — date dimasukkan sebagai dependency karena fetchQueues memakainya
  const fetchQueues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queueService.getAll({ date });
      setQueues(res.data.data);
    } catch {
      toast.error('Gagal memuat antrean');
    } finally {
      setLoading(false);
    }
  }, [date]);

  // ✅ fetchQueues sekarang aman dimasukkan sebagai dependency
  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const handleCall = async (id) => {
    setCallingId(id);
    try {
      await queueService.callNext(id);
      toast.success('Antrean berhasil dipanggil');
      fetchQueues();
    } catch {
      toast.error('Gagal memanggil antrean');
    } finally {
      setCallingId(null);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await queueService.updateStatus(id, { status });
      toast.success('Status antrean diperbarui');
      fetchQueues();
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  const calledQueue  = queues.find((q) => q.status === 'called');
  const waitingCount = queues.filter((q) => q.status === 'waiting').length;
  const doneCount    = queues.filter((q) => q.status === 'done').length;

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>🔢 Manajemen Antrean</h2>
          <p style={s.sub}>Kelola antrean pasien hari ini</p>
        </div>
        <input
          type="date"
          style={s.dateInput}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div style={s.summaryRow}>
        <div style={{ ...s.summaryCard, borderTop: '4px solid #1e3a5f' }}>
          <div style={s.sumVal}>{queues.length}</div>
          <div style={s.sumLabel}>Total Antrean</div>
        </div>
        <div style={{ ...s.summaryCard, borderTop: '4px solid #f39c12' }}>
          <div style={s.sumVal}>{waitingCount}</div>
          <div style={s.sumLabel}>Menunggu</div>
        </div>
        <div style={{ ...s.summaryCard, borderTop: '4px solid #27ae60' }}>
          <div style={s.sumVal}>{doneCount}</div>
          <div style={s.sumLabel}>Selesai</div>
        </div>
      </div>

      {/* Now Calling */}
      {calledQueue && (
        <div style={s.callingBox}>
          <div style={s.callingLabel}>🔊 SEDANG DIPANGGIL</div>
          <div style={s.callingNumber}>{calledQueue.queue_number}</div>
          <div style={s.callingName}>{calledQueue.registration?.patient?.name}</div>
        </div>
      )}

      {/* Queue Table */}
      <div style={s.tableWrap}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Memuat antrean...</p>
        ) : queues.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            Tidak ada antrean untuk tanggal ini
          </p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>No. Antrean</th>
                <th style={s.th}>Nama Pasien</th>
                <th style={s.th}>No. RM</th>
                <th style={s.th}>Waktu Daftar</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((q, i) => {
                const sc = statusConfig[q.status] || statusConfig.waiting;
                return (
                  <tr
                    key={q.id}
                    style={{
                      background:
                        q.status === 'called'
                          ? '#e8f0fe'
                          : i % 2 === 0 ? '#fff' : '#f8f9fa',
                    }}
                  >
                    <td style={s.td}>
                      <span style={{
                        ...s.queueNum,
                        background: q.status === 'called' ? '#1e3a5f' : '#eee',
                        color:      q.status === 'called' ? '#fff'    : '#333',
                      }}>
                        {q.queue_number}
                      </span>
                    </td>

                    <td style={s.td}>
                      <strong>{q.registration?.patient?.name || '-'}</strong>
                    </td>

                    <td style={s.td}>
                      <span style={s.rmTag}>
                        {q.registration?.patient?.medical_record_number || '-'}
                      </span>
                    </td>

                    <td style={s.td}>
                      {q.createdAt
                        ? new Date(q.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '-'}
                    </td>

                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, color: sc.color, background: sc.bg }}>
                        {sc.label}
                      </span>
                    </td>

                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>

                        {q.status === 'waiting' && (
                          <button
                            style={s.btnCall}
                            onClick={() => handleCall(q.id)}
                            disabled={callingId === q.id}
                          >
                            📢 Panggil
                          </button>
                        )}

                        {q.status === 'called' && (
                          <>
                            {user?.role === 'doctor' && (
                              <button
                                style={s.btnExam}
                                onClick={() =>
                                  navigate(
                                    `/examination/${q.registration?.id || q.registration_id}`
                                  )
                                }
                              >
                                🩺 Periksa
                              </button>
                            )}
                            <button style={s.btnDone} onClick={() => handleStatus(q.id, 'done')}>
                              ✅ Selesai
                            </button>
                            <button style={s.btnSkip} onClick={() => handleStatus(q.id, 'skip')}>
                              ⏭ Lewati
                            </button>
                          </>
                        )}

                        {q.status === 'skip' && (
                          <button style={s.btnCall} onClick={() => handleStatus(q.id, 'waiting')}>
                            🔄 Ulangi
                          </button>
                        )}

                        {q.status === 'done' && (
                          <span style={{ color: '#888', fontSize: '0.85rem' }}>—</span>
                        )}
                      </div>
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
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title:         { color: '#1e3a5f', marginBottom: '0.25rem' },
  sub:           { color: '#888', fontSize: '0.9rem' },
  dateInput:     { padding: '0.6rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.95rem' },
  summaryRow:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  summaryCard:   { background: '#fff', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sumVal:        { fontSize: '2rem', fontWeight: '800', color: '#1e3a5f' },
  sumLabel:      { color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' },
  callingBox:    { background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)', color: '#fff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' },
  callingLabel:  { fontSize: '0.85rem', fontWeight: '600', letterSpacing: '2px', marginBottom: '0.5rem', opacity: 0.8 },
  callingNumber: { fontSize: '4rem', fontWeight: '900', lineHeight: 1 },
  callingName:   { fontSize: '1.1rem', marginTop: '0.5rem', opacity: 0.9 },
  tableWrap:     { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  thead:         { background: '#1e3a5f', color: '#fff' },
  th:            { padding: '1rem 0.75rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' },
  td:            { padding: '0.75rem', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' },
  queueNum:      { padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.95rem' },
  rmTag:         { background: '#e8f0fe', color: '#1e3a5f', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.8rem' },
  statusBadge:   { padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600' },
  btnCall:       { padding: '0.35rem 0.8rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnExam:       { padding: '0.35rem 0.8rem', background: '#8e44ad', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDone:       { padding: '0.35rem 0.8rem', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnSkip:       { padding: '0.35rem 0.8rem', background: '#eee',    color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
};
