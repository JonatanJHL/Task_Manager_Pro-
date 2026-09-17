const Project = require('../models/projectModel');
const ProjectMember = require('../models/projectMemberModel');
const ActivityLog = require('../models/activityLogModel');
const User = require('../models/userModel');
const emailService = require('../services/emailService');

const getProjects = async (req, res) => {
  try {
    const projects = req.user.role === 'admin'
      ? await Project.getAll()
      : await Project.getAllForUser(req.user.id);
    res.json(projects);
  } catch (err) {
    console.error('Error getProjects:', err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    if (req.user.role !== 'admin' && !(await ProjectMember.isMember(project.id, req.user.id))) {
      return res.status(403).json({ error: 'No tienes acceso a este proyecto' });
    }

    res.json(project);
  } catch (err) {
    console.error('Error getProject:', err);
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
};

const getMembers = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    const members = await ProjectMember.listMembers(req.params.id);
    res.json(members);
  } catch (err) {
    console.error('Error getMembers:', err);
    res.status(500).json({ error: 'Error al obtener miembros' });
  }
};

const addMember = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id es requerido' });

    const project = await Project.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    await ProjectMember.addMember(req.params.id, user_id);

    const member = await User.findById(user_id);
    if (member) {
      emailService.sendProjectAssignedEmailTo(member, project.name).catch(err => {
        console.error('Error enviando notificación de asignación:', err.message);
      });
    }

    res.status(201).json({ message: 'Miembro agregado' });
  } catch (err) {
    console.error('Error addMember:', err);
    res.status(500).json({ error: 'Error al agregar miembro' });
  }
};

const removeMember = async (req, res) => {
  try {
    await ProjectMember.removeMember(req.params.id, req.params.userId);
    res.json({ message: 'Miembro removido' });
  } catch (err) {
    console.error('Error removeMember:', err);
    res.status(500).json({ error: 'Error al remover miembro' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    const id = await Project.create({
      name,
      description: description || '',
      user_id: req.user.id,
    });

    emailService.notifyAdmin(emailService.notifyNewProject(req.user.name, name));
    ActivityLog.create({ user_id: req.user.id, action: 'project_created', project_id: id, details: name });

    res.status(201).json({ id, message: 'Proyecto creado' });
  } catch (err) {
    console.error('Error createProject:', err);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const deleted = await Project.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    console.error('Error deleteProject:', err);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
};

module.exports = { getProjects, getProject, createProject, deleteProject, getMembers, addMember, removeMember };
