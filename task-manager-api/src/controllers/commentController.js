const Comment = require('../models/commentModel');
const Task = require('../models/taskModel');
const ActivityLog = require('../models/activityLogModel');
const emailService = require('../services/emailService');

const getComments = async (req, res) => {
  try {
    const task = await Task.getById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    const comments = await Comment.getByTask(req.params.taskId);
    const tree = buildCommentTree(comments);
    res.json(tree);
  } catch (err) {
    console.error('Error getComments:', err);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

const createComment = async (req, res) => {
  try {
    const task = await Task.getById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    const { content, parent_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Contenido requerido' });

    const id = await Comment.create({
      content,
      task_id: req.params.taskId,
      user_id: req.user.id,
      parent_id: parent_id || null
    });

    emailService.notifyAdmin(emailService.notifyNewComment(req.user.name, task.title, content));
    ActivityLog.create({ user_id: req.user.id, action: 'comment_added', task_id: task.id, project_id: task.project_id, details: content.slice(0, 100) });

    res.status(201).json({ id, message: 'Comentario agregado' });
  } catch (err) {
    console.error('Error createComment:', err);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.getById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }
    await Comment.remove(req.params.id);
    res.json({ message: 'Comentario eliminado' });
  } catch (err) {
    console.error('Error deleteComment:', err);
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
};

function buildCommentTree(comments) {
  const map = {};
  const roots = [];

  comments.forEach(c => {
    map[c.id] = { ...c, children: [] };
  });

  comments.forEach(c => {
    if (c.parent_id) {
      map[c.parent_id]?.children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
}

module.exports = { getComments, createComment, deleteComment };
