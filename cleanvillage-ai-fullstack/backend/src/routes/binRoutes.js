const express = require('express');
const {
  getBins,
  getBinById,
  createBin,
  updateBin,
  deleteBin,
  setFillLevel,
  setSensorStatus,
  collectBin,
} = require('../controllers/binController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getBins)
  .post(authorize(ROLES.ADMIN, ROLES.OFFICER), createBin);

router
  .route('/:binId')
  .get(getBinById)
  .put(authorize(ROLES.ADMIN, ROLES.OFFICER), updateBin)
  .delete(authorize(ROLES.ADMIN), deleteBin);

router.patch('/:binId/fill', authorize(ROLES.ADMIN, ROLES.OFFICER), setFillLevel);
router.patch('/:binId/sensor-status', authorize(ROLES.ADMIN, ROLES.OFFICER), setSensorStatus);
router.patch('/:binId/collect', authorize(ROLES.ADMIN, ROLES.OFFICER, ROLES.WORKER), collectBin);

module.exports = router;
