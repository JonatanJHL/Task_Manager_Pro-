const express = require('express');
const router = express.Router();
const { createInvitation, getInvitations, deleteInvitation } = require('../controllers/invitationController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

router.use(authMiddleware, requireRole('admin'));

router.get('/', getInvitations);
router.post('/', createInvitation);
router.delete('/:id', deleteInvitation);

module.exports = router;
