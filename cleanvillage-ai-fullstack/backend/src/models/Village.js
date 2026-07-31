const mongoose = require('mongoose');

// A village represents a Gram Panchayat jurisdiction. Every Bin ID is
// resolved to a location through this collection (Bin -> villageId ->
// Village), which is the core trick that removes the need for a GPS
// module on the ESP32: the sensor only ever reports its Bin ID.
const villageSchema = new mongoose.Schema(
  {
    villageId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    mandal: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Village', villageSchema);
