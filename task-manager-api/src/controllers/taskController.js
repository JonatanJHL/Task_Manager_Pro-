const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const ActivityLog = require('../models/activityLogModel');
const emailService = require('../services/emailService');

const getTasks = async (req, res) => {
  try {
    const { project_id } = req.query;
    const tasks = await Task.getAll(project_id);
    res.json(tasks);
  } catch (err) {
    console.error('Error getTasks:', err);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  } catch (err) {
    console.error('Error getTask:', err);
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, project_id, due_date } = req.body;
    if (!title || !project_id) {
      return res.status(400).json({ error: 'title y project_id son requeridos' });
    }

    const project = await Project.getById(project_id);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const id = await Task.create({
      title, description,
      status: status || 'pending',
      priority: priority || 'medium',
      project_id,
      user_id: req.user.id,
      due_date: due_date || null,
    });

    emailService.notifyAdmin(emailService.notifyNewTask(req.user.name, title, project?.name || 'Proyecto'));
    ActivityLog.create({ user_id: req.user.id, action: 'task_created', task_id: id, project_id, details: title });

    res.status(201).json({ id, message: 'Tarea creada' });
  } catch (err) {
    console.error('Error createTask:', err);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

const updateTask = async (req, res) => {
  try {
    const oldTask = await Task.getById(req.params.id);
    if (!oldTask) return res.status(404).json({ error: 'Tarea no encontrada' });

    await Task.update(req.params.id, req.body);

    if (req.body.status && req.body.status !== oldTask.status) {
      emailService.notifyAdmin(emailService.notifyTaskStatusChange(req.user.name, oldTask.title, req.body.status));
      ActivityLog.create({
        user_id: req.user.id,
        action: 'task_status_changed',
        task_id: oldTask.id,
        project_id: oldTask.project_id,
        details: `${oldTask.status}|${req.body.status}`,
      });
    }

    res.json({ message: 'Tarea actualizada' });
  } catch (err) {
    console.error('Error updateTask:', err);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    console.error('Error deleteTask:', err);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
