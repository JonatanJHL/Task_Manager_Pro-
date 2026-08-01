const db = require('../../config/db');

const getAllByUser = async (userId, projectId) => {
  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [userId];

  if (projectId) {
    query += ' AND project_id = ?';
    params.push(projectId);
  }

  query += ' ORDER BY created_at DESC';
  const [rows] = await db.query(query, params);
  return rows;
};

const getById = async (id, userId) => {
  const [rows] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0];
};

const create = async ({ title, description, status, priority, project_id, user_id, due_date }) => {
  const [result] = await db.query(
    'INSERT INTO tasks (title, description, status, priority, project_id, user_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, status, priority, project_id, user_id, due_date]
  );
  return result.insertId;
};

const update = async (id, userId, fields) => {
  const allowedFields = ['title', 'description', 'status', 'priority', 'due_date'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (fields[field] !== undefined && fields[field] !== null && fields[field] !== '') {
      updates.push(`${field} = ?`);
      values.push(fields[field]);
    }
  }

  if (updates.length === 0) return { affectedRows: 0 };

  values.push(id, userId);
  const [result] = await db.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values);
  return result;
};

const remove = async (id, userId) => {
  const [result] = await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

module.exports = { getAllByUser, getById, create, update, remove };
