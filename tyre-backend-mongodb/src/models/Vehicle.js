const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['car', 'bike', 'suv', 'truck', 'van'],
    index: true
  },
  make: { type: String, required: true, trim: true, index: true },
  model: { type: String, required: true, trim: true, index: true },
  market: { type: String, default: 'IN', index: true },
  supportedYears: [{ type: Number }],
  bodyStyles: [{ type: String }],
  sourceName: { type: String, default: 'local-demo-dataset' },
  sourceUrl: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  demoOnly: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

vehicleSchema.index({ category: 1, make: 1, model: 1, market: 1 }, { unique: true });
module.exports = mongoose.model('Vehicle', vehicleSchema);
