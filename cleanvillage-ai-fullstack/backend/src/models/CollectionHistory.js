const mongoose = require('mongoose');

// One record per "Mark as Collected" action, powering the Collection
// History page and the "Collected Today" dashboard stat.
const collectionHistorySchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, trim: true, uppercase: true },
    village: { type: String, required: true },
    location: { type: String, required: true },
    ward: { type: String, required: true },
    worker: { type: String, required: true },
    fillLevelBeforeCollection: { type: Number, required: true },
    collectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

collectionHistorySchema.index({ binId: 1 });
collectionHistorySchema.index({ collectedAt: -1 });

module.exports = mongoose.model('CollectionHistory', collectionHistorySchema);
