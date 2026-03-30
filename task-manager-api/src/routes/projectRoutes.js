const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, deleteProject } = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.delete('/:id', deleteProject);

module.exports = router;
