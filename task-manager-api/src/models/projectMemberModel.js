const db = require('../../config/db');

const addMember = async (projectId, userId) => {
  await db.query('INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)', [projectId, userId]);
};

const removeMember = async (projectId, userId) => {
  await db.query('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]);
};

const listMembers = async (projectId) => {
  const [rows] = await db.query(`
    SELECT u.id, u.name, u.email
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = ?
    ORDER BY u.name ASC
  `, [projectId]);
  return rows;
};

const isMember = async (projectId, userId) => {
  const [rows] = await db.query(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ? LIMIT 1',
    [projectId, userId]
  );
  return rows.length > 0;
};

module.exports = { addMember, removeMember, listMembers, isMember };
