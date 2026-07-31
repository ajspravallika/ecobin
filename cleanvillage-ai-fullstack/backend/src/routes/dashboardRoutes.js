const express = require('express');
const {
  getStats,
  getStatusDistribution,
  getVillageBreakdown,
  getCollectionTrend,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/charts/status-distribution', getStatusDistribution);
router.get('/charts/village-breakdown', getVillageBreakdown);
router.get('/charts/collection-trend', getCollectionTrend);

module.exports = router;
