import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];
const PRIORITY_COLORS = { low: '#64748b', medium: '#f59e0b', high: '#ef4444' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics');
      setData(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: 24 }}>Cargando analytics...</div>
      </div>
    );
  }

  const { overview, projects, byPriority, recentTasks, overdueTasks, weeklyStats } = data || {
    overview: { total: 0, pending: 0, in_progress: 0, done: 0, completionRate: 0 },
    projects: [],
    byPriority: [],
    recentTasks: [],
    overdueTasks: [],
    weeklyStats: []
  };

  const pieData = [
    { name: 'Pendientes', value: overview.pending },
    { name: 'En Progreso', value: overview.in_progress },
    { name: 'Completadas', value: overview.done }
  ].filter(d => d.value > 0);

  const priorityData = byPriority.map(p => ({
    name: p.priority === 'low' ? 'Baja' : p.priority === 'medium' ? 'Media' : 'Alta',
    value: p.count,
    fill: PRIORITY_COLORS[p.priority]
  }));

  const weeklyData = weeklyStats.map(s => ({
    date: new Date(s.date).toLocaleDateString('es-ES', { weekday: 'short' }),
    tareas: s.count,
    completadas: s.done
  }));

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: 20, color: '#6366f1', margin: 0 }}>📊 Analytics</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0 0' }}>Análisis detallado de tu productividad</p>
        </div>
        <Link to="/dashboard" style={{
          padding: '10px 20px',
          background: '#6366f1',
          color: 'white',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600
        }}>
          ← Volver al Dashboard
        </Link>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Total Tareas</div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#6366f1' }}>{overview.total}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Pendientes</div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#f59e0b' }}>{overview.pending}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>En Progreso</div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#3b82f6' }}>{overview.in_progress}</div>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Completadas</div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#10b981' }}>{overview.done}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Distribución por Estado</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                No hay tareas aún
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: COLORS[i] }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Tasa de Completación</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 250 }}>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: overview.completionRate }]} startAngle={180} endAngle={0}>
                  <RadialBar background dataKey="value" cornerRadius={10} fill="#10b981" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#10b981', marginTop: -80 }}>
                {overview.completionRate}%
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Por Prioridad</h3>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                No hay tareas aún
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Actividad Semanal</h3>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tareas" stroke="#6366f1" strokeWidth={2} name="Tareas Creadas" />
                  <Line type="monotone" dataKey="completadas" stroke="#10b981" strokeWidth={2} name="Completadas" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Sin actividad esta semana
              </div>
            )}
          </div>

          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>🏆 Top Proyectos</h3>
            {projects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {projects.slice(0, 4).map((p, i) => (
                  <div key={p.id} style={{
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 8,
                    borderLeft: `4px solid ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#6366f1'}`
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                      <span>{p.taskCount} tareas</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{p.completionRate}%</span>
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: 4, height: 6, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ background: '#10b981', width: `${p.completionRate}%`, height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No hay proyectos</div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>📋 Tareas Recientes</h3>
            {recentTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentTasks.map(task => (
                  <div key={task.id} style={{
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{task.project_name}</div>
                    </div>
                    <span className={`badge badge-${task.status}`} style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>
                      {task.status === 'pending' ? 'Pendiente' : task.status === 'in_progress' ? 'En Progreso' : 'Completada'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>Sin tareas recientes</div>
            )}
          </div>

          <div style={{ background: overdueTasks.length > 0 ? '#fef2f2' : 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: overdueTasks.length > 0 ? '2px solid #ef4444' : 'none' }}>
            <h3 style={{ fontSize: 18, marginBottom: 16, color: overdueTasks.length > 0 ? '#ef4444' : '#1e293b' }}>
              ⚠️ Tareas Vencidas ({overdueTasks.length})
            </h3>
            {overdueTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {overdueTasks.map(task => (
                  <div key={task.id} style={{
                    padding: 12,
                    background: 'white',
                    borderRadius: 8,
                    borderLeft: '4px solid #ef4444'
                  }}>
                    <div style={{ fontWeight: 500 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                      Venció: {new Date(task.due_date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#10b981', textAlign: 'center', padding: 20, fontWeight: 600 }}>
                ¡No hay tareas vencidas! 🎉
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
