import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: '#d97706', bg: '#fef3c7' },
  used: { label: 'Usada', color: '#059669', bg: '#d1fae5' },
  expired: { label: 'Expirada', color: '#dc2626', bg: '#fee2e2' },
};

export default function Admin() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [form, setForm] = useState({ email: '', role: 'guest' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
    loadInvitations();
  }, []);

  const loadUsers = async () => {
    try { const { data } = await api.get('/users'); setUsers(data); }
    catch { setUsers([]); }
  };

  const loadInvitations = async () => {
    try { const { data } = await api.get('/invitations'); setInvitations(data); }
    catch { setInvitations([]); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/invitations', form);
      setSuccess(`Invitación enviada a ${form.email}`);
      setForm({ email: '', role: 'guest' });
      loadInvitations();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear invitación');
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm('¿Revocar esta invitación?')) return;
    await api.delete(`/invitations/${id}`);
    loadInvitations();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🛠️ Panel de administración</h1>
        <div className="header-user">
          <Link to="/dashboard" style={{ padding: '8px 16px', background: '#10b981', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            📋 Dashboard
          </Link>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span>{user?.name}</span>
          <button className="btn btn-secondary" onClick={logout}>Salir</button>
        </div>
      </header>

      <main className="dashboard">
        <div className="welcome">
          <h2>Invitaciones y colaboradores</h2>
          <p>Invita becarios/colaboradores, revisa el estado de sus invitaciones y quién ya se unió.</p>
        </div>

        <section style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 16 }}>Crear invitación</h3>
          {error && <div className="error">{error}</div>}
          {success && <div style={{ background: '#d1fae5', color: '#059669', padding: 12, borderRadius: 8, marginBottom: 16 }}>{success}</div>}
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 220 }}>
              <label>Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="becario@email.com" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Rol</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="guest">Becario (guest)</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Enviar invitación</button>
          </form>
        </section>

        <section style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 16 }}>Invitaciones</h3>
          {invitations.length === 0 ? <p style={{ color: '#64748b' }}>No hay invitaciones todavía</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: 8 }}>Email</th>
                  <th style={{ padding: 8 }}>Rol</th>
                  <th style={{ padding: 8 }}>Estado</th>
                  <th style={{ padding: 8 }}>Invitado por</th>
                  <th style={{ padding: 8 }}></th>
                </tr>
              </thead>
              <tbody>
                {invitations.map(inv => {
                  const status = STATUS_LABELS[inv.status] || STATUS_LABELS.pending;
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 8 }}>{inv.email}</td>
                      <td style={{ padding: 8 }}>{inv.role}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: status.color, background: status.bg }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>{inv.invited_by_name}</td>
                      <td style={{ padding: 8 }}>
                        {inv.status === 'pending' && (
                          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleRevoke(inv.id)}>Revocar</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 16 }}>Usuarios registrados</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: 8 }}>Nombre</th>
                <th style={{ padding: 8 }}>Email</th>
                <th style={{ padding: 8 }}>Rol</th>
                <th style={{ padding: 8 }}>Desde</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 8 }}>{u.name}</td>
                  <td style={{ padding: 8 }}>{u.email}</td>
                  <td style={{ padding: 8 }}>{u.role}</td>
                  <td style={{ padding: 8 }}>{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
