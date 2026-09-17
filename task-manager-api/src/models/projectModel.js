const db = require('../../config/db');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
  return rows[0];
};

const create = async ({ name, description, user_id }) => {
  const [result] = await db.query(
    'INSERT INTO projects (name, description, user_id) VALUES (?, ?, ?)',
    [name, description, user_id]
  );
  return result.insertId;
};

const remove = async (id) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM tasks WHERE project_id = ?', [id]);
    const [result] = await conn.query('DELETE FROM projects WHERE id = ?', [id]);
    await conn.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { getAll, getById, create, remove };
