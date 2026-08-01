const db = require('../../config/db');

const getByTask = async (taskId) => {
  const [rows] = await db.query(
    `SELECT c.*, u.name as user_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.task_id = ?
     ORDER BY c.created_at ASC`,
    [taskId]
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
  return rows[0];
};

const create = async ({ content, task_id, user_id, parent_id }) => {
  const [result] = await db.query(
    'INSERT INTO comments (content, task_id, user_id, parent_id) VALUES (?, ?, ?, ?)',
    [content, task_id, user_id, parent_id || null]
  );
  return result.insertId;
};

const remove = async (id) => {
  await db.query('DELETE FROM comments WHERE id = ?', [id]);
};

module.exports = { getByTask, getById, create, remove };
