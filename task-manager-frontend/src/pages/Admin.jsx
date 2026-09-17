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
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState({});
  const [form, setForm] = useState({ email: '', role: 'guest' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
    loadInvitations();
    loadProjects();
  }, []);

  const loadUsers = async () => {
    try { const { data } = await api.get('/users'); setUsers(data); }
    catch { setUsers([]); }
  };

  const loadInvitations = async () => {
    try { const { data } = await api.get('/invitations'); setInvitations(data); }
    catch { setInvitations([]); }
  };

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
      const entries = await Promise.all(
        data.map(async (p) => {
          const { data: members } = await api.get(`/projects/${p.id}/members`);
          return [p.id, members];
        })
      );
      setProjectMembers(Object.fromEntries(entries));
    } catch {
      setProjects([]);
    }
  };

  const handleAddMember = async (projectId, userId) => {
    if (!userId) return;
    await api.post(`/projects/${projectId}/members`, { user_id: Number(userId) });
    loadProjects();
  };

  const handleRemoveMember = async (projectId, userId) => {
    await api.delete(`/projects/${projectId}/members/${userId}`);
    loadProjects();
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
          <Link to="/team" style={{ padding: '8px 16px', background: '#0ea5e9', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            👥 Equipo
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

        <section style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 4 }}>Proyectos y miembros</h3>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
            Un becario solo ve y trabaja en los proyectos donde está asignado. Las tareas dentro de cada proyecto las genera cada quien.
          </p>
          {projects.length === 0 ? <p style={{ color: '#64748b' }}>No hay proyectos todavía</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {projects.map(p => {
                const members = projectMembers[p.id] || [];
                const memberIds = new Set(members.map(m => m.id));
                const availableGuests = users.filter(u => u.role === 'guest' && !memberIds.has(u.id));
                return (
                  <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{p.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {members.length === 0 && <span style={{ color: '#94a3b8', fontSize: 13 }}>Sin becarios asignados</span>}
                      {members.map(m => (
                        <span key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                          {m.name}
                          <button onClick={() => handleRemoveMember(p.id, m.id)}
                            style={{ border: 'none', background: 'none', color: '#3730a3', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            title="Quitar del proyecto">×</button>
                        </span>
                      ))}
                    </div>
                    <select value="" onChange={e => handleAddMember(p.id, e.target.value)} style={{ fontSize: 13 }}>
                      <option value="">+ Agregar becario…</option>
                      {availableGuests.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
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
