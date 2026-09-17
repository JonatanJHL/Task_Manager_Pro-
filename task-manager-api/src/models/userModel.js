const db = require('../../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

const create = async ({ name, email, password, role = 'guest' }) => {
  const [result] = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return result.insertId;
};

const findAll = async () => {
  const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  return rows;
};

module.exports = { findByEmail, findById, create, findAll };
