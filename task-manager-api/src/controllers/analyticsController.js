const db = require('../../config/db');
const ActivityLog = require('../models/activityLogModel');

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM tasks WHERE user_id = ?
    `, [userId]);

    const [projectsStats] = await db.query(`
      SELECT 
        p.id,
        p.name,
        COUNT(t.id) as taskCount,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as doneCount
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.user_id = ?
      GROUP BY p.id, p.name
      ORDER BY taskCount DESC
    `, [userId]);

    const projectsWithRate = projectsStats.map(p => ({
      id: p.id,
      name: p.name,
      taskCount: p.taskCount,
      doneCount: p.doneCount,
      completionRate: p.taskCount > 0 ? Math.round((p.doneCount / p.taskCount) * 100) : 0
    }));

    const [tasksByPriority] = await db.query(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM tasks 
      WHERE user_id = ?
      GROUP BY priority
    `, [userId]);

    const [recentTasks] = await db.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT 5
    `, [userId]);

    const [overdueTasks] = await db.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = ? AND t.due_date < CURDATE() AND t.status != 'done'
      ORDER BY t.due_date ASC
    `, [userId]);

    const [weeklyStats] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM tasks
      WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [userId]);

    res.json({
      overview: {
        total: totalStats[0]?.total || 0,
        pending: totalStats[0]?.pending || 0,
        in_progress: totalStats[0]?.in_progress || 0,
        done: totalStats[0]?.done || 0,
        completionRate: totalStats[0]?.total > 0 
          ? Math.round((totalStats[0]?.done / totalStats[0]?.total) * 100) 
          : 0
      },
      projects: projectsWithRate,
      byPriority: tasksByPriority,
      recentTasks,
      overdueTasks,
      weeklyStats
    });
  } catch (err) {
    console.error('Error en analytics:', err);
    res.status(500).json({ error: 'Error al obtener analytics' });
  }
};

const getTeamOverview = async (req, res) => {
  try {
    const [kpis] = await db.query(`
      SELECT
        SUM(CASE WHEN status IN ('pending','in_progress') THEN 1 ELSE 0 END) as activeTasks,
        SUM(CASE WHEN status = 'done' AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as completedThisWeek,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'done' THEN 1 ELSE 0 END) as overdueTasks
      FROM tasks
    `);

    const [members] = await db.query(`
      SELECT
        u.id, u.name, u.role,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN t.due_date < CURDATE() AND t.status != 'done' THEN 1 ELSE 0 END) as overdue
      FROM users u
      LEFT JOIN tasks t ON t.user_id = u.id
      WHERE u.role = 'guest'
      GROUP BY u.id, u.name, u.role
      ORDER BY u.name ASC
    `);

    const lastActivityRows = await ActivityLog.getLastActivityByUser();
    const lastActivityByUser = Object.fromEntries(lastActivityRows.map(r => [r.user_id, r.lastActivity]));
    members.forEach(m => { m.lastActivity = lastActivityByUser[m.id] || null; });

    const [activeBecarios] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count FROM tasks t
      JOIN users u ON u.id = t.user_id
      WHERE u.role = 'guest' AND t.status != 'done'
    `);

    const activity = await ActivityLog.getRecent(15);

    res.json({
      kpis: {
        activeTasks: kpis[0]?.activeTasks || 0,
        completedThisWeek: kpis[0]?.completedThisWeek || 0,
        overdueTasks: kpis[0]?.overdueTasks || 0,
        activeBecarios: activeBecarios[0]?.count || 0,
      },
      members,
      activity,
    });
  } catch (err) {
    console.error('Error en team overview:', err);
    res.status(500).json({ error: 'Error al obtener el resumen del equipo' });
  }
};

const getReportData = async (userId) => {
  const [stats] = await db.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
    FROM tasks WHERE user_id = ?
  `, [userId]);

  const [topProjects] = await db.query(`
    SELECT 
      p.name,
      COUNT(t.id) as taskCount,
      SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as doneCount
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    WHERE p.user_id = ? AND t.id IS NOT NULL
    GROUP BY p.name
    ORDER BY taskCount DESC
    LIMIT 5
  `, [userId]);

  return {
    total: stats[0]?.total || 0,
    pending: stats[0]?.pending || 0,
    inProgress: stats[0]?.inProgress || 0,
    done: stats[0]?.done || 0
  };
};

module.exports = { getAnalytics, getTeamOverview, getReportData };
