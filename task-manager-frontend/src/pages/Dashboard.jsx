import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

function CommentModal({ isOpen, onClose, taskId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (isOpen && taskId) loadComments();
  }, [isOpen, taskId]);

  const loadComments = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/comments`);
      setComments(data);
    } catch { setComments([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await api.post(`/tasks/${taskId}/comments`, { content: newComment });
    setNewComment('');
    loadComments();
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    await api.post(`/tasks/${taskId}/comments`, { content: replyContent, parent_id: parentId });
    setReplyContent('');
    setReplyingTo(null);
    loadComments();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar comentario?')) {
      await api.delete(`/comments/${id}`);
      loadComments();
    }
  };

  const renderComment = (comment, depth = 0) => (
    <div key={comment.id} style={{ marginLeft: depth * 24, marginBottom: 12 }}>
      <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 8, borderLeft: `3px solid ${depth === 0 ? '#6366f1' : '#94a3b8'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <strong style={{ fontSize: 13 }}>{comment.user_name}</strong>
          <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(comment.created_at).toLocaleString('es-ES')}</span>
        </div>
        <p style={{ margin: 0, fontSize: 14 }}>{comment.content}</p>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            style={{ fontSize: 12, padding: '4px 8px', marginRight: 8, background: 'none', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}>Responder</button>
          {user?.role === 'admin' && (
            <button onClick={() => handleDelete(comment.id)}
              style={{ fontSize: 12, padding: '4px 8px', background: 'none', border: '1px solid #fecaca', borderRadius: 4, color: '#ef4444', cursor: 'pointer' }}>Eliminar</button>
          )}
        </div>
      </div>
      {replyingTo === comment.id && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <input type="text" value={replyContent} onChange={e => setReplyContent(e.target.value)}
            placeholder="Escribe una respuesta..." style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}
            onKeyDown={e => e.key === 'Enter' && handleReply(comment.id)} />
          <button onClick={() => handleReply(comment.id)} className="btn btn-primary" style={{ padding: '8px 16px' }}>Enviar</button>
        </div>
      )}
      {comment.children?.map(child => renderComment(child, depth + 1))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <h2 style={{ marginBottom: 16 }}>Comentarios</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..." rows={3}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '2px solid #e2e8f0', marginBottom: 8 }} />
          <button type="submit" className="btn btn-primary">Publicar</button>
        </form>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {comments.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No hay comentarios aún</p>
            : comments.map(c => renderComment(c))}
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function FileModal({ isOpen, onClose, taskId }) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (isOpen && taskId) loadFiles(); }, [isOpen, taskId]);

  const loadFiles = async () => {
    try { const { data } = await api.get(`/tasks/${taskId}/attachments`); setFiles(data); }
    catch { setFiles([]); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try { await api.post(`/tasks/${taskId}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); loadFiles(); }
    catch { alert('Error al subir archivo'); }
    setUploading(false);
  };

  const handleDelete = async (id) => { if (confirm('¿Eliminar archivo?')) { await api.delete(`/attachments/${id}`); loadFiles(); } };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <h2 style={{ marginBottom: 16 }}>Archivos Adjuntos</h2>
        <div style={{ marginBottom: 16 }}>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            {uploading ? 'Subiendo...' : 'Subir archivo'}
            <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {files.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>No hay archivos</p>
            : files.map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                <div><span style={{ fontWeight: 500 }}>{f.filename}</span><span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>{f.user_name}</span></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={`${api.defaults.baseURL}/attachments/${f.id}/download`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 12 }}>Descargar</a>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(f.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }}>Eliminar</button>
                  )}
                </div>
              </div>
            ))}
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ isOpen, onClose, onSubmit, title, initialData, editingTask }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        due_date: editingTask.due_date || ''
      });
    } else {
      setForm({ title: '', description: '', priority: 'medium', due_date: '' });
    }
  }, [editingTask]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, editingTask?.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Prioridad</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha límite</label>
            <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editingTask ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Nuevo Proyecto</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del proyecto</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange, onComments, onFiles, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('taskId', task.id.toString());
    e.dataTransfer.setData('currentStatus', task.status);
    onDragStart && onDragStart(task.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd && onDragEnd();
  };

  return (
    <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}
      className={`task-card ${task.status}`}
      style={{ opacity: isDragging ? 0.5 : 1, transform: isDragging ? 'rotate(3deg)' : 'none', cursor: 'grab' }}>
      <div className="task-header">
        <span className="task-title">{task.title}</span>
        <button className={`status-btn status-${task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'pending'}`}
          onClick={() => onStatusChange(task.id, task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'pending')}>
          {task.status === 'pending' && '▶️'}
          {task.status === 'in_progress' && '✅'}
          {task.status === 'done' && '↩️'}
        </button>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta">
        <span className={`badge badge-${task.status}`}>{task.status === 'pending' ? 'Pendiente' : task.status === 'in_progress' ? 'En progreso' : 'Completada'}</span>
        <span className={`badge badge-${task.priority}`}>{task.priority === 'low' ? 'Baja' : task.priority === 'medium' ? 'Media' : 'Alta'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        {task.due_date ? <div className="task-due" style={{ margin: 0 }}>📅 {formatDate(task.due_date)}</div> : <span />}
        {task.user_name && (
          <div title={`Creada por ${task.user_name}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
              {task.user_name.charAt(0).toUpperCase()}
            </span>
            {task.user_name}
          </div>
        )}
      </div>
      <div className="task-actions">
        <button className="edit-btn" onClick={() => onEdit(task)}>Editar</button>
        <button className="edit-btn" onClick={() => onComments(task.id)}>💬</button>
        <button className="edit-btn" onClick={() => onFiles(task.id)}>📎</button>
        {user?.role === 'admin' && (
          <button className="delete-btn" onClick={() => onDelete(task.id)}>Eliminar</button>
        )}
      </div>
    </div>
  );
}

function TaskColumn({ status, tasks, onEdit, onDelete, onStatusChange, onComments, onFiles, onDragOver, onDrop }) {
  const [dragOverId, setDragOverId] = useState(null);
  const statusLabels = { pending: 'Pendientes', in_progress: 'En Progreso', done: 'Completadas' };
  const statusColors = { pending: '#f59e0b', in_progress: '#3b82f6', done: '#10b981' };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOverId(status);
    onDragOver && onDragOver(status);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const currentStatus = e.dataTransfer.getData('currentStatus');
    setDragOverId(null);
    onDrop && onDrop(taskId, currentStatus, status);
  };

  return (
    <div className="column" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      style={{ background: dragOverId === status ? '#e2e8f0' : '#f1f5f9', transition: 'background 0.2s' }}>
      <div className="column-header" style={{ borderBottom: `3px solid ${statusColors[status]}` }}>
        <h3>{statusLabels[status]}</h3>
        <span className="count">{tasks.length}</span>
      </div>
      <div className="column-content">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete}
            onStatusChange={onStatusChange} onComments={onComments} onFiles={onFiles} />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => { loadProjects(); }, []);

  useEffect(() => { if (selectedProject) loadTasks(); }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
      if (data.length > 0 && !selectedProject) setSelectedProject(data[0].id);
    } catch { setProjects([]); }
  };

  const loadTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?project_id=${selectedProject}`);
      setTasks(data);
    } catch { setTasks([]); }
  };

  const handleDragOver = (status) => setDragOverStatus(status);

  const handleDrop = async (taskId, currentStatus, newStatus) => {
    setDragOverStatus(null);
    if (currentStatus !== newStatus) {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      loadTasks();
    }
  };

  const handleCreateProject = async ({ name, description }) => {
    const { data } = await api.post('/projects', { name, description });
    await loadProjects();
    setSelectedProject(data.id);
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    const project = projects.find(p => p.id === selectedProject);
    if (confirm(`¿Eliminar el proyecto "${project?.name}" y todas sus tareas?`)) {
      await api.delete(`/projects/${selectedProject}`);
      setSelectedProject('');
      await loadProjects();
    }
  };

  const handleCreateTask = async (form) => {
    await api.post('/tasks', { ...form, project_id: selectedProject });
    loadTasks();
  };

  const handleEditTask = async (form, taskId) => {
    await api.put(`/tasks/${taskId}`, form);
    setEditingTask(null);
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    if (confirm('¿Eliminar esta tarea?')) {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await api.put(`/tasks/${id}`, { status: newStatus });
    loadTasks();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const pieData = [
    { name: 'Pendientes', value: pendingTasks.length },
    { name: 'En Progreso', value: inProgressTasks.length },
    { name: 'Completadas', value: doneTasks.length }
  ];

  return (
    <div className="app">
      <header className="header">
        <h1>📋 Task Manager Pro</h1>
        <div className="header-user">
          <Link to="/analytics" style={{ padding: '8px 16px', background: '#10b981', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            📊 Analytics
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/team" style={{ padding: '8px 16px', background: '#0ea5e9', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                👥 Equipo
              </Link>
              <Link to="/admin" style={{ padding: '8px 16px', background: '#6366f1', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                🛠️ Admin
              </Link>
            </>
          )}
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span>{user?.name}</span>
          <button className="btn btn-secondary" onClick={logout}>Salir</button>
        </div>
      </header>

      <main className="dashboard">
        <div className="welcome">
          <h2>¡Hola, {user?.name}! 👋</h2>
          <p>Arrastra las tareas entre columnas para cambiar su estado</p>
        </div>

        {selectedProject && (
          <>
            <div className="stats">
              <div className="stat-card"><h3>{tasks.length}</h3><p>Total</p></div>
              <div className="stat-card pending"><h3>{pendingTasks.length}</h3><p>Pendientes</p></div>
              <div className="stat-card progress"><h3>{inProgressTasks.length}</h3><p>En Progreso</p></div>
              <div className="stat-card done"><h3>{doneTasks.length}</h3><p>Completadas</p></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ marginBottom: 16 }}>Distribución de Tareas</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ marginBottom: 16 }}>Progreso</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, fontWeight: 'bold', color: '#10b981' }}>
                      {tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0}%
                    </div>
                    <p style={{ color: '#64748b' }}>Completado</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="controls">
          <div className="project-select">
            <select value={selectedProject} onChange={e => setSelectedProject(Number(e.target.value))}>
              <option value="">Selecciona un proyecto</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="btn-group">
            {user?.role === 'admin' && (
              <>
                <button className="btn btn-primary" onClick={() => setShowProjectModal(true)}>+ Proyecto</button>
                <button className="btn btn-danger" onClick={handleDeleteProject} disabled={!selectedProject}>🗑️ Eliminar proyecto</button>
              </>
            )}
            <button className="btn btn-success" onClick={() => { setEditingTask(null); setShowTaskModal(true); }} disabled={!selectedProject}>+ Tarea</button>
          </div>
        </div>

        {selectedProject && (
          <div className="board">
            <TaskColumn status="pending" tasks={pendingTasks} onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange} onComments={(id) => { setSelectedTask({ id }); setShowCommentModal(true); }}
              onFiles={(id) => { setSelectedTask({ id }); setShowFileModal(true); }} onDragOver={handleDragOver} onDrop={handleDrop} />
            <TaskColumn status="in_progress" tasks={inProgressTasks} onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange} onComments={(id) => { setSelectedTask({ id }); setShowCommentModal(true); }}
              onFiles={(id) => { setSelectedTask({ id }); setShowFileModal(true); }} onDragOver={handleDragOver} onDrop={handleDrop} />
            <TaskColumn status="done" tasks={doneTasks} onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange} onComments={(id) => { setSelectedTask({ id }); setShowCommentModal(true); }}
              onFiles={(id) => { setSelectedTask({ id }); setShowFileModal(true); }} onDragOver={handleDragOver} onDrop={handleDrop} />
          </div>
        )}
      </main>

      <TaskModal isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleEditTask : handleCreateTask} title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'} editingTask={editingTask} />

      <ProjectModal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} onSubmit={handleCreateProject} />

      <CommentModal isOpen={showCommentModal} onClose={() => { setShowCommentModal(false); setSelectedTask(null); }} taskId={selectedTask?.id} />

      <FileModal isOpen={showFileModal} onClose={() => { setShowFileModal(false); setSelectedTask(null); }} taskId={selectedTask?.id} />
    </div>
  );
}
