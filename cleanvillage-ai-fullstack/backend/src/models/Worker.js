const mongoose = require('mongoose');

// Worker profile — separate from User (auth) so a worker can exist / be
// assigned bins even before a login account is created for them.
const workerSchema = new mongoose.Schema(
  {
    workerId: { type: String, required: true, unique: true, trim: true }, // e.g. WRK-01
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    villages: [{ type: String, trim: true, lowercase: true }], // village ids they cover
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
