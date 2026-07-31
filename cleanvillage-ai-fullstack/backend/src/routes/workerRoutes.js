const express = require('express');
const {
  getWorkers,
  getWorkerById,
  getWorkerBins,
  createWorker,
  updateWorker,
  deleteWorker,
} = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.route('/').get(getWorkers).post(authorize(ROLES.ADMIN, ROLES.OFFICER), createWorker);
router
  .route('/:workerId')
  .get(getWorkerById)
  .put(authorize(ROLES.ADMIN, ROLES.OFFICER), updateWorker)
  .delete(authorize(ROLES.ADMIN), deleteWorker);
router.get('/:workerId/bins', getWorkerBins);

module.exports = router;
