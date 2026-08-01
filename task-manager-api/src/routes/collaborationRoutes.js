const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { getAttachments, createAttachment, deleteAttachment, downloadAttachment } = require('../controllers/attachmentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Límite de tamaño: en un servidor compartido, sin tope cualquier miembro
// del equipo podría llenar el disco subiendo archivos enormes por error o
// a propósito.
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB por archivo
});

router.get('/tasks/:taskId/comments', getComments);
router.post('/tasks/:taskId/comments', createComment);
router.delete('/comments/:id', deleteComment);

router.get('/tasks/:taskId/attachments', getAttachments);
router.post('/tasks/:taskId/attachments', upload.single('file'), createAttachment);
router.delete('/attachments/:id', deleteAttachment);
router.get('/attachments/:id/download', downloadAttachment);

// Errores de multer (ej. archivo > 20MB) no llegan al try/catch del
// controller porque ocurren en el middleware de upload; se atrapan aquí.
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Archivo demasiado grande o inválido (máx 20MB)' });
  }
  next(err);
});

module.exports = router;
