const mongoose = require('mongoose');
const { STATUS, PRIORITY } = require('../config/constants');

// Auto-generated whenever a bin crosses upward into Almost Full / Full
// territory. Cleared automatically once the bin is marked collected.
const notificationSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, trim: true, uppercase: true },
    village: { type: String, required: true },
    location: { type: String, required: true }, // landmark
    ward: { type: String, required: true },
    fillLevel: { type: Number, required: true },
    status: {
      type: String,
      enum: [STATUS.ALMOST_FULL, STATUS.FULL],
      required: true,
    },
    priority: { type: String, enum: Object.values(PRIORITY), required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

notificationSchema.index({ binId: 1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
