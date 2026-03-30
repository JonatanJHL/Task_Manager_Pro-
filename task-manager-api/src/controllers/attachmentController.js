const Attachment = require('../models/attachmentModel');
const fs = require('fs');
const path = require('path');

const getAttachments = async (req, res) => {
  try {
    const attachments = await Attachment.getByTask(req.params.taskId);
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
};

const createAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

    const id = await Attachment.create({
      filename: req.file.originalname,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      task_id: req.params.taskId,
      user_id: req.user.id
    });

    res.status(201).json({ id, filename: req.file.originalname, message: 'Archivo subido' });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir archivo' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
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
    const db = require('../../config/db');
    const [rows] = await db.query('SELECT * FROM attachments WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Archivo no encontrado' });
    
    res.download(rows[0].filepath);
  } catch (err) {
    res.status(500).json({ error: 'Error al descargar archivo' });
  }
};

module.exports = { getAttachments, createAttachment, deleteAttachment, downloadAttachment };
