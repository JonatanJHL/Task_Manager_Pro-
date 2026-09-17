import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Sin actividad';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
};

const STATUS_LABELS = { pending: 'Pendiente', in_progress: 'En progreso', done: 'Completada' };

const ACTIVITY_LABELS = {
  task_created: (e) => <>creó la tarea <strong>{e.task_title}</strong></>,
  task_status_changed: (e) => {
    const [from, to] = (e.details || '').split('|');
    return <>movió <strong>{e.task_title}</strong> de {STATUS_LABELS[from] || from} a {STATUS_LABELS[to] || to}</>;
  },
  comment_added: (e) => <>comentó en <strong>{e.task_title}</strong></>,
  attachment_added: (e) => <>subió un archivo a <strong>{e.task_title}</strong></>,
  project_created: (e) => <>creó el proyecto <strong>{e.project_name}</strong></>,
};

export default function Team() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await api.get('/analytics/team');
      setData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el resumen del equipo');
    }
  };

  const memberTotal = (m) => Number(m.pending) + Number(m.in_progress) + Number(m.done);
  const pct = (n, total) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <div className="app">
      <header className="header">
        <h1>👥 Equipo</h1>
        <div className="header-user">
          <Link to="/dashboard" style={{ padding: '8px 16px', background: '#10b981', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            📋 Tablero
          </Link>
          <Link to="/analytics" style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            📊 Analíticas
          </Link>
          <Link to="/admin" style={{ padding: '8px 16px', background: '#6366f1', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            🛠️ Admin
          </Link>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span>{user?.name}</span>
          <button className="btn btn-secondary" onClick={logout}>Salir</button>
        </div>
      </header>

      <main className="dashboard">
        <div className="welcome">
          <h2>Pulso del equipo</h2>
          <p>Qué está haciendo cada becario, de un vistazo.</p>
        </div>

        {error && <div className="error">{error}</div>}

        {data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 16, marginBottom: 24 }}>
              <div className="stat-card"><h3>{data.kpis.activeTasks}</h3><p>Tareas activas</p></div>
              <div className="stat-card"><h3>{data.kpis.completedThisWeek}</h3><p>Completadas esta semana</p></div>
              <div className="stat-card"><h3>{data.kpis.activeBecarios}</h3><p>Becarios activos</p></div>
              <div className="stat-card" style={{ background: data.kpis.overdueTasks > 0 ? '#fef2f2' : undefined }}>
                <h3 style={{ color: data.kpis.overdueTasks > 0 ? '#dc2626' : undefined }}>{data.kpis.overdueTasks}</h3>
                <p style={{ color: data.kpis.overdueTasks > 0 ? '#dc2626' : undefined }}>Tareas vencidas</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0 }}>Becarios</h3>
                {data.members.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Todavía no hay becarios registrados.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                    {data.members.map(m => {
                      const total = memberTotal(m);
                      return (
                        <div key={m.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>Becario</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', background: '#f1f5f9', marginBottom: 10 }}>
                            <div style={{ width: `${pct(m.pending, total)}%`, background: '#d97706' }} />
                            <div style={{ width: `${pct(m.in_progress, total)}%`, background: '#2563eb' }} />
                            <div style={{ width: `${pct(m.done, total)}%`, background: '#15803d' }} />
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                            {m.pending} pend · {m.in_progress} en curso · {m.done} listas
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#64748b' }}>{timeAgo(m.lastActivity)}</span>
                            {m.overdue > 0 && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '3px 9px', borderRadius: 999 }}>
                                {m.overdue} vencida{m.overdue > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 18px 8px' }}>
                <h3 style={{ margin: '0 0 12px' }}>Actividad reciente</h3>
                {data.activity.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Sin actividad todavía.</p>
                ) : (
                  data.activity.map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < data.activity.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {e.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13 }}>
                          <strong>{e.user_name}</strong> {ACTIVITY_LABELS[e.action]?.(e)}
                          {e.project_name && <span style={{ color: '#94a3b8' }}> · {e.project_name}</span>}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{timeAgo(e.created_at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
