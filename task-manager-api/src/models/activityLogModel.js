const db = require('../../config/db');

const create = async ({ user_id, action, task_id = null, project_id = null, details = null }) => {
  const [result] = await db.query(
    'INSERT INTO activity_log (user_id, action, task_id, project_id, details) VALUES (?, ?, ?, ?, ?)',
    [user_id, action, task_id, project_id, details]
  );
  return result.insertId;
};

const getRecent = async (limit = 15) => {
  const safeLimit = Number.isInteger(limit) ? limit : 15;
  const [rows] = await db.query(`
    SELECT al.id, al.action, al.details, al.created_at,
           u.name AS user_name,
           t.title AS task_title,
           COALESCE(p.name, tp.name) AS project_name
    FROM activity_log al
    JOIN users u ON u.id = al.user_id
    LEFT JOIN tasks t ON t.id = al.task_id
    LEFT JOIN projects tp ON tp.id = t.project_id
    LEFT JOIN projects p ON p.id = al.project_id
    ORDER BY al.created_at DESC
    LIMIT ${safeLimit}
  `);
  return rows;
};

const getLastActivityByUser = async () => {
  const [rows] = await db.query(`
    SELECT user_id, MAX(created_at) as lastActivity
    FROM activity_log
    GROUP BY user_id
  `);
  return rows;
};

module.exports = { create, getRecent, getLastActivityByUser };
