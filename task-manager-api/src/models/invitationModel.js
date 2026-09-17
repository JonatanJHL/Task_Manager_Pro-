const db = require('../../config/db');

const create = async ({ token, email, role, invited_by, expires_at }) => {
  const [result] = await db.query(
    'INSERT INTO invitations (token, email, role, invited_by, expires_at) VALUES (?, ?, ?, ?, ?)',
    [token, email, role, invited_by, expires_at]
  );
  return result.insertId;
};

const findByToken = async (token) => {
  const [rows] = await db.query('SELECT * FROM invitations WHERE token = ?', [token]);
  return rows[0];
};

const findAll = async () => {
  const [rows] = await db.query(
    `SELECT i.*, u.name as invited_by_name
     FROM invitations i
     JOIN users u ON i.invited_by = u.id
     ORDER BY i.created_at DESC`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM invitations WHERE id = ?', [id]);
  return rows[0];
};

const markUsed = async (id) => {
  await db.query('UPDATE invitations SET used_at = NOW() WHERE id = ?', [id]);
};

const remove = async (id) => {
  const [result] = await db.query('DELETE FROM invitations WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { create, findByToken, findAll, findById, markUsed, remove };
