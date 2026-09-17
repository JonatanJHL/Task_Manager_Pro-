const express = require('express');
const router = express.Router();
const { getAnalytics, getTeamOverview } = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.get('/', getAnalytics);
router.get('/team', requireRole('admin'), getTeamOverview);

module.exports = router;
