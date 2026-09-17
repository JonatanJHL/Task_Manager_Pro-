const ProjectMember = require('../models/projectMemberModel');

const canAccessProject = async (user, projectId) =>
  user.role === 'admin' || ProjectMember.isMember(projectId, user.id);

module.exports = { canAccessProject };
