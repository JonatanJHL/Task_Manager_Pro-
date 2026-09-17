const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, deleteProject } = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', requireRole('admin'), createProject);
router.delete('/:id', requireRole('admin'), deleteProject);

module.exports = router;
