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

const upload = multer({ storage });

router.get('/tasks/:taskId/comments', getComments);
router.post('/tasks/:taskId/comments', createComment);
router.delete('/comments/:id', deleteComment);

router.get('/tasks/:taskId/attachments', getAttachments);
router.post('/tasks/:taskId/attachments', upload.single('file'), createAttachment);
router.delete('/attachments/:id', deleteAttachment);
router.get('/attachments/:id/download', downloadAttachment);

module.exports = router;
