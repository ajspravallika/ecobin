const express = require('express');
const {
  getVillages,
  createVillage,
  updateVillage,
  deleteVillage,
} = require('../controllers/villageController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(protect);

router.route('/').get(getVillages).post(authorize(ROLES.ADMIN), createVillage);
router
  .route('/:villageId')
  .put(authorize(ROLES.ADMIN), updateVillage)
  .delete(authorize(ROLES.ADMIN), deleteVillage);

module.exports = router;
