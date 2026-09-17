const Attachment = require('../models/attachmentModel');
const Task = require('../models/taskModel');
const ActivityLog = require('../models/activityLogModel');
const { canAccessProject } = require('../utils/projectAccess');
const fs = require('fs');

const getAttachments = async (req, res) => {
  try {
    const task = await Task.getById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    if (!(await canAccessProject(req.user, task.project_id))) {
      return res.status(403).json({ error: 'No tienes acceso a este proyecto' });
    }

    const attachments = await Attachment.getByTask(req.params.taskId);
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
};

const createAttachment = async (req, res) => {
  try {
    const task = await Task.getById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    if (!(await canAccessProject(req.user, task.project_id))) {
      return res.status(403).json({ error: 'No tienes acceso a este proyecto' });
    }

    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

    const id = await Attachment.create({
      filename: req.file.originalname,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      task_id: req.params.taskId,
      user_id: req.user.id
    });

    ActivityLog.create({ user_id: req.user.id, action: 'attachment_added', task_id: task.id, project_id: task.project_id, details: req.file.originalname });

    res.status(201).json({ id, filename: req.file.originalname, message: 'Archivo subido' });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir archivo' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.getById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const filepath = await Attachment.remove(req.params.id);
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    res.json({ message: 'Archivo eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar archivo' });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.getById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const task = await Task.getById(attachment.task_id);
    if (!task || !(await canAccessProject(req.user, task.project_id))) {
      return res.status(403).json({ error: 'No tienes acceso a este archivo' });
    }

    res.download(attachment.filepath);
  } catch (err) {
    res.status(500).json({ error: 'Error al descargar archivo' });
  }
};

module.exports = { getAttachments, createAttachment, deleteAttachment, downloadAttachment };
