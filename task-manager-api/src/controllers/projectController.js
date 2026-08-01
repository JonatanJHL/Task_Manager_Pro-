const Project = require('../models/projectModel');
const emailService = require('../services/emailService');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.getAllByUser(req.user.id);
    res.json(projects);
  } catch (err) {
    console.error('Error getProjects:', err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(project);
  } catch (err) {
    console.error('Error getProject:', err);
    res.status(500).json({ error: 'Error al obtener proyecto' });
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

    res.status(201).json({ id, message: 'Proyecto creado' });
  } catch (err) {
    console.error('Error createProject:', err);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const deleted = await Project.remove(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    console.error('Error deleteProject:', err);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
};

module.exports = { getProjects, getProject, createProject, deleteProject };
