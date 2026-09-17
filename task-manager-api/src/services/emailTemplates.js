const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #0f172a; margin: 0; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; }
  .card { background: linear-gradient(145deg, #1e293b, #334155); border-radius: 20px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
  .logo { font-size: 32px; text-align: center; margin-bottom: 20px; }
  h1 { color: #f8fafc; text-align: center; font-size: 28px; margin-bottom: 10px; font-weight: 700; }
  h2 { color: #f8fafc; font-size: 22px; margin-bottom: 16px; font-weight: 600; }
  h3 { color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; text-align: center; }
  p { color: #cbd5e1; font-size: 16px; line-height: 1.7; margin-bottom: 16px; }
  .highlight { color: #f8fafc; font-weight: 600; }
  .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0; transition: transform 0.2s; }
  .btn:hover { transform: translateY(-2px); }
  .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, #475569, transparent); margin: 30px 0; }
`;

const sendWelcomeEmail = (userName) => ({
  subject: '🚀 ¡Bienvenido a Task Manager Pro!',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">🚀</div>
      <h3>Bienvenido</h3>
      <h1>¡Hola, ${userName}!</h1>
      
      <p style="text-align: center; font-size: 18px;">
        Estamos <span class="highlight">muy emocionados</span> de tenerte con nosotros.
      </p>
      
      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-bottom: 16px;">✨ Lo que puedes hacer</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; margin-bottom: 8px;">📋</div>
            <div style="color: #f8fafc; font-weight: 600;">Proyectos</div>
            <div style="color: #64748b; font-size: 12px;">Organiza tus tareas</div>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; margin-bottom: 8px;">📊</div>
            <div style="color: #f8fafc; font-weight: 600;">Analytics</div>
            <div style="color: #64748b; font-size: 12px;">Visualiza progreso</div>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; margin-bottom: 8px;">💬</div>
            <div style="color: #f8fafc; font-weight: 600;">Comentarios</div>
            <div style="color: #64748b; font-size: 12px;">Colabora fácil</div>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; margin-bottom: 8px;">📧</div>
            <div style="color: #f8fafc; font-weight: 600;">Reportes</div>
            <div style="color: #64748b; font-size: 12px;">RecibeUpdates</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="http://localhost:5173/dashboard" class="btn">Ir al Dashboard →</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #64748b;">
        ¿Tienes preguntas? Responde a este email y te ayudaremos.
      </p>
      
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}<br>
        El gestor de tareas más cool 🚀
      </div>
    </div>
  </div>
</body>
</html>
  `
});

const sendNotificationEmail = (icon, title, color, content) => ({
  subject: `${icon} ${title}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${BASE_STYLES}
    .notification { background: ${color}15; border: 1px solid ${color}40; border-radius: 16px; padding: 24px; margin: 20px 0; }
    .notification-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
    .notification h2 { text-align: center; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #334155; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; }
    .info-value { color: #f8fafc; font-weight: 600; }
    .quote { background: #1e293b; border-left: 4px solid ${color}; padding: 16px; border-radius: 0 12px 12px 0; margin: 16px 0; font-style: italic; color: #cbd5e1; }
    .btn-${color.replace('#', '')} { background: linear-gradient(135deg, ${color}, ${color}cc); }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">${icon}</div>
      <h1>${title}</h1>
      <div class="notification">
        ${content}
      </div>
      <div style="text-align: center;">
        <a href="http://localhost:5173/dashboard" class="btn">Ver Dashboard →</a>
      </div>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
  `
});

const notifyNewUser = (user) => ({
  subject: '👤 Nuevo usuario registrado',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">👤</div>
      <h1>Nuevo Usuario</h1>
      <p style="text-align: center; color: #10b981; font-size: 18px; margin-bottom: 24px;">
        ✨ Un nuevo miembro se unió a la comunidad
      </p>
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1)); border-radius: 16px; padding: 24px; margin: 20px 0;">
        <div class="info-row">
          <span class="info-label">Nombre</span>
          <span class="info-value">${user.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${user.email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha</span>
          <span class="info-value">${new Date().toLocaleString('es-ES')}</span>
        </div>
      </div>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
  `
});

const notifyNewTask = (userName, taskTitle, projectName) => ({
  subject: '✅ Nueva tarea creada',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">✅</div>
      <h1>Nueva Tarea</h1>
      <p style="text-align: center; color: #10b981; font-size: 18px; margin-bottom: 24px;">
        💪 ${userName} creó una nueva tarea
      </p>
      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1)); border-radius: 16px; padding: 24px; margin: 20px 0;">
        <div class="info-row">
          <span class="info-label">Tarea</span>
          <span class="info-value">${taskTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Proyecto</span>
          <span class="info-value">${projectName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha</span>
          <span class="info-value">${new Date().toLocaleString('es-ES')}</span>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="http://localhost:5173/dashboard" class="btn">Ver Tarea →</a>
      </div>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
  `
});

const notifyTaskStatusChange = (userName, taskTitle, newStatus) => {
  const statusConfig = {
    pending: { icon: '⏳', color: '#f59e0b', label: 'Pendiente', bg: 'rgba(245, 158, 11, 0.2)' },
    in_progress: { icon: '🔄', color: '#3b82f6', label: 'En Progreso', bg: 'rgba(59, 130, 246, 0.2)' },
    done: { icon: '🎉', color: '#10b981', label: 'Completada', bg: 'rgba(16, 185, 129, 0.2)' }
  };
  const status = statusConfig[newStatus] || statusConfig.pending;
  
  return {
    subject: `🔄 Tarea: ${taskTitle} - ${status.label}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">🔄</div>
      <h1>Estado Actualizado</h1>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 64px;">${status.icon}</span>
        <div style="font-size: 24px; font-weight: bold; color: ${status.color}; margin-top: 12px;">${status.label}</div>
      </div>
      <div style="background: ${status.bg}; border-radius: 16px; padding: 24px; margin: 20px 0;">
        <div class="info-row">
          <span class="info-label">Usuario</span>
          <span class="info-value">${userName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tarea</span>
          <span class="info-value">${taskTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha</span>
          <span class="info-value">${new Date().toLocaleString('es-ES')}</span>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="http://localhost:5173/dashboard" class="btn">Ver Dashboard →</a>
      </div>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
    `
  };
};

const notifyNewProject = (userName, projectName) => ({
  subject: '📁 Nuevo proyecto creado',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">📁</div>
      <h1>Nuevo Proyecto</h1>
      <p style="text-align: center; color: #8b5cf6; font-size: 18px; margin-bottom: 24px;">
        🎯 ${userName} inició un nuevo proyecto
      </p>
      <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1)); border-radius: 16px; padding: 24px; margin: 20px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
        <h2 style="color: #f8fafc; font-size: 24px; margin-bottom: 8px;">${projectName}</h2>
        <p style="color: #94a3b8;">Creado por ${userName}</p>
      </div>
      <div style="text-align: center;">
        <a href="http://localhost:5173/dashboard" class="btn">Ver Proyecto →</a>
      </div>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
  `
});

const notifyNewComment = (userName, taskTitle, comment) => ({
  subject: '💬 Nuevo comentario',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">💬</div>
      <h1>Nuevo Comentario</h1>
      <p style="text-align: center; color: #6366f1; font-size: 18px; margin-bottom: 24px;">
        💬 ${userName} comentó en una tarea
      </p>
      <div style="background: #1e293b; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">TAREA</div>
        <div style="color: #f8fafc; font-weight: 600; font-size: 18px; margin-bottom: 16px;">${taskTitle}</div>
        <div class="quote">"${comment}"</div>
      </div>
      <div style="text-align: center;">
        <a href="http://localhost:5173/dashboard" class="btn">Ver Comentario →</a>
      </div>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
  `
});

const tutorialSequence = [
  {
    step: 1,
    title: 'Crea tu primer proyecto',
    content: 'Los proyectos te ayudan a organizar tus tareas por categorías. Piensa en un proyecto como una carpeta que contiene todas las tareas relacionadas con un objetivo específico.'
  },
  {
    step: 2,
    title: 'Agrega tareas a tu proyecto',
    content: 'Las tareas son las unidades de trabajo más pequeñas. Cada tarea debe ser algo concreto que puedas completar en una sesión.'
  },
  {
    step: 3,
    title: 'Cambia el estado de tus tareas',
    content: 'Con el drag & drop puedes mover tareas entre columnas: Pendientes, En Progreso y Completadas.'
  },
  {
    step: 4,
    title: 'Usa prioridades y fechas',
    content: 'Las prioridades (Baja, Media, Alta) y fechas límite te ayudan a enfocarte en lo importante.'
  },
  {
    step: 5,
    title: 'Colabora con comentarios',
    content: '¿Necesitas más contexto? Agrega comentarios a tus tareas. Puedes crear hilos de conversación para mantener todo organizado.'
  }
];

const sendTutorialEmail = (userName, step) => {
  const tutorial = tutorialSequence[step - 1];
  const nextStep = tutorialSequence[step];
  const stepColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const color = stepColors[step - 1];
  const stepEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
  
  return {
    subject: `${stepEmojis[step - 1]} Tutorial ${step}: ${tutorial.title}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 64px; background: ${color}30; padding: 20px; border-radius: 50%; display: inline-block;">
          ${stepEmojis[step - 1]}
        </span>
      </div>
      <h3 style="color: ${color};">Tutorial ${step} de 5</h3>
      <h1>${tutorial.title}</h1>
      <p style="text-align: center; color: #94a3b8;">
        Hola <span class="highlight">${userName}</span>, continua aprendiendo
      </p>
      <div style="background: linear-gradient(135deg, ${color}20, ${color}10); border-radius: 16px; padding: 24px; margin: 24px 0; border-left: 4px solid ${color};">
        <p style="color: #e2e8f0; font-size: 17px; line-height: 1.8; margin: 0;">${tutorial.content}</p>
      </div>
      <div style="text-align: center;">
        <a href="http://localhost:5173/dashboard" class="btn" style="background: linear-gradient(135deg, ${color}, ${color}cc);">Practicar Ahora →</a>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        ${[1,2,3,4,5].map(i => `<span style="display: inline-block; width: ${i === step ? '24px' : '8px'}; height: 8px; border-radius: 4px; background: ${i <= step ? color : '#334155'}; margin: 0 4px;"></span>`).join('')}
      </div>
      ${nextStep ? `<p style="text-align: center; color: #64748b; margin-top: 16px; font-size: 14px;">Próximo: <span class="highlight">${nextStep.title}</span></p>` : '<p style="text-align: center; color: #10b981; margin-top: 16px; font-size: 14px;">🎉 ¡Completaste todos los tutoriales!</p>'}
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
    `
  };
};

const sendReportEmail = (userName, period, stats, topProjects) => {
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  
  return {
    subject: `📊 Tu Reporte ${period} - Task Manager Pro`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">📊</div>
      <h3>Reporte ${period}</h3>
      <h1>Hola, ${userName}!</h1>
      <p style="text-align: center; color: #94a3b8; margin-bottom: 24px;">
        Aquí está tu resumen de actividad
      </p>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0;">
        <div style="background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #6366f1;">${stats.total}</div>
          <div style="color: #64748b; font-size: 11px;">Total</div>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #10b981;">${stats.done}</div>
          <div style="color: #64748b; font-size: 11px;">Completadas</div>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">${stats.pending}</div>
          <div style="color: #64748b; font-size: 11px;">Pendientes</div>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${stats.inProgress}</div>
          <div style="color: #64748b; font-size: 11px;">En Progreso</div>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1)); border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
        <div style="font-size: 48px; font-weight: bold; color: ${completionRate >= 50 ? '#10b981' : '#f59e0b'};">
          ${completionRate}%
        </div>
        <div style="color: #94a3b8; margin-top: 8px;">Tasa de Completación</div>
        <div style="background: #1e293b; border-radius: 8px; height: 12px; margin-top: 16px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #10b981, #34d399); height: 100%; width: ${completionRate}%; border-radius: 8px; transition: width 0.5s;"></div>
        </div>
      </div>
      
      ${topProjects && topProjects.length > 0 ? `
        <h3 style="color: #f8fafc; margin: 24px 0 16px 0;">🏆 Top Proyectos</h3>
        ${topProjects.slice(0, 3).map((p, i) => `
          <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="color: #f8fafc; font-weight: 600;">${i + 1}. ${p.name}</div>
              <div style="color: #64748b; font-size: 12px;">${p.taskCount} tareas</div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 12px;">
              ${p.completionRate}%
            </div>
          </div>
        `).join('')}
      ` : ''}
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="http://localhost:5173/analytics" class="btn">Ver Analytics →</a>
      </div>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
    `
  };
};

const sendInvitationEmail = (inviteLink, role) => ({
  subject: '🎟️ Invitación a Task Manager Pro',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">🎟️</div>
      <h3>Invitación</h3>
      <h1>Te invitaron a Task Manager Pro</h1>
      <p style="text-align: center;">
        Fuiste invitado como <span class="highlight">${role === 'admin' ? 'administrador' : 'colaborador'}</span>.
        Usa el siguiente enlace para crear tu cuenta.
      </p>
      <div style="text-align: center;">
        <a href="${inviteLink}" class="btn">Crear mi cuenta →</a>
      </div>
      <p style="text-align: center; font-size: 13px; color: #64748b;">
        Este enlace expira en 7 días y solo puede usarse una vez.
      </p>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
    `
});

const sendProjectAssignedEmail = (userName, projectName, dashboardLink) => ({
  subject: '📁 Te asignaron a un proyecto',
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">📁</div>
      <h3>Nueva asignación</h3>
      <h1>Hola, ${userName}</h1>
      <p style="text-align: center;">
        Te asignaron al proyecto <span class="highlight">${projectName}</span>.
        Ya puedes ver sus tareas y crear las tuyas.
      </p>
      <div style="text-align: center;">
        <a href="${dashboardLink}" class="btn">Ver proyecto →</a>
      </div>
      <div class="footer">
        Task Manager Pro © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
    `
});

module.exports = {
  sendWelcomeEmail,
  sendReportEmail,
  sendTutorialEmail,
  notifyNewUser,
  notifyNewTask,
  notifyTaskStatusChange,
  notifyNewProject,
  notifyNewComment,
  sendInvitationEmail,
  sendProjectAssignedEmail,
  tutorialSequence
};
