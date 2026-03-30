const Comment = require('../models/commentModel');
const Task = require('../models/taskModel');
const emailService = require('../services/emailService');

const getComments = async (req, res) => {
  try {
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
    const { content, parent_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Contenido requerido' });

    const id = await Comment.create({
      content,
      task_id: req.params.taskId,
      user_id: req.user.id,
      parent_id: parent_id || null
    });

    const task = await Task.getById(req.params.taskId);
    emailService.notifyAdmin(emailService.notifyNewComment(req.user.name, task?.title || 'Tarea', content));

    res.status(201).json({ id, message: 'Comentario agregado' });
  } catch (err) {
    console.error('Error createComment:', err);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
};

const deleteComment = async (req, res) => {
  try {
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
