const db = require('../../config/db');

const getByTask = async (taskId) => {
  const [rows] = await db.query(
    `SELECT a.*, u.name as user_name 
     FROM attachments a 
     JOIN users u ON a.user_id = u.id 
     WHERE a.task_id = ? 
     ORDER BY a.created_at DESC`,
    [taskId]
  );
  return rows;
};

const create = async ({ filename, filepath, mimetype, task_id, user_id }) => {
  const [result] = await db.query(
    'INSERT INTO attachments (filename, filepath, mimetype, task_id, user_id) VALUES (?, ?, ?, ?, ?)',
    [filename, filepath, mimetype, task_id, user_id]
  );
  return result.insertId;
};

const remove = async (id) => {
  const [rows] = await db.query('SELECT filepath FROM attachments WHERE id = ?', [id]);
  await db.query('DELETE FROM attachments WHERE id = ?', [id]);
  return rows[0]?.filepath;
};

module.exports = { getByTask, create, remove };
