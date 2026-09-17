const db = require('../../config/db');

const getAll = async (projectId) => {
  let query = 'SELECT * FROM tasks';
  const params = [];

  if (projectId) {
    query += ' WHERE project_id = ?';
    params.push(projectId);
  }

  query += ' ORDER BY created_at DESC';
  const [rows] = await db.query(query, params);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
  return rows[0];
};

const create = async ({ title, description, status, priority, project_id, user_id, due_date }) => {
  const [result] = await db.query(
    'INSERT INTO tasks (title, description, status, priority, project_id, user_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, status, priority, project_id, user_id, due_date]
  );
  return result.insertId;
};

const update = async (id, fields) => {
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

  values.push(id);
  const [result] = await db.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
  return result;
};

const remove = async (id) => {
  const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { getAll, getById, create, update, remove };
