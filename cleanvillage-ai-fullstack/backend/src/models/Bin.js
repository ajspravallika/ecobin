const mongoose = require('mongoose');
const { STATUS, SENSOR_STATUS } = require('../config/constants');

// Core entity of the system. One document per physical ESP32 + HC-SR04
// bin unit. The ESP32 only ever sends { binId, fillLevel } — everything
// else here (village, ward, landmark, assigned worker) is looked up by
// binId, which is why no GPS module is required on the device.
const binSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, unique: true, trim: true, uppercase: true }, // BIN-001
    villageId: { type: String, required: true, trim: true, lowercase: true },
    village: { type: String, required: true, trim: true },
    mandal: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    landmark: { type: String, required: true, trim: true },

    assignedWorkerId: { type: String, default: null }, // WRK-01
    assignedWorkerName: { type: String, default: null },

    sensorStatus: {
      type: String,
      enum: Object.values(SENSOR_STATUS),
      default: SENSOR_STATUS.ONLINE,
    },
    fillLevel: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.NORMAL,
    },
    lastUpdated: { type: Date, default: Date.now },

    binType: {
      type: String,
      enum: ['Household Cluster Bin', 'Bulk Community Bin'],
      default: 'Household Cluster Bin',
    },
    capacityLiters: { type: Number, default: 120 },
  },
  { timestamps: true }
);

binSchema.index({ village: 1 });
binSchema.index({ status: 1 });
binSchema.index({ assignedWorkerId: 1 });

module.exports = mongoose.model('Bin', binSchema);
