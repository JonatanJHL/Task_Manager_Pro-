const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, deleteProject, getMembers, addMember, removeMember } = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', requireRole('admin'), createProject);
router.delete('/:id', requireRole('admin'), deleteProject);

router.get('/:id/members', requireRole('admin'), getMembers);
router.post('/:id/members', requireRole('admin'), addMember);
router.delete('/:id/members/:userId', requireRole('admin'), removeMember);

module.exports = router;
