const db = require('../../config/db');

const getAllByUser = async (userId) => {
  const [rows] = await db.query(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

const getById = async (id, userId) => {
  const [rows] = await db.query('SELECT * FROM projects WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0];
};

const create = async ({ name, description, user_id }) => {
  const [result] = await db.query(
    'INSERT INTO projects (name, description, user_id) VALUES (?, ?, ?)',
    [name, description, user_id]
  );
  return result.insertId;
};

const remove = async (id, userId) => {
  const [result] = await db.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};

module.exports = { getAllByUser, getById, create, remove };
