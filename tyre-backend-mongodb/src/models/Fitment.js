const mongoose = require('mongoose');

const fitmentSchema = new mongoose.Schema({
  category: { type: String, required: true, enum: ['car', 'bike', 'suv', 'truck', 'van'], index: true },
  market: { type: String, default: 'IN', index: true },
  make: { type: String, required: true, trim: true, index: true },
  model: { type: String, required: true, trim: true, index: true },
  year: { type: Number, required: true, index: true },
  variant: { type: String, default: 'Standard', trim: true, index: true },
  frontSize: { type: String, required: true, trim: true },
  rearSize: { type: String, required: true, trim: true },
  fitmentType: { type: String, enum: ['OEM', 'alternate'], default: 'OEM' },
  sourceName: { type: String, default: 'local-demo-dataset' },
  sourceUrl: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  demoOnly: { type: Boolean, default: true },
  notes: { type: String, default: 'Demo record only. Confirm the vehicle placard/owner manual before fitting.' }
}, { timestamps: true });

fitmentSchema.index({ category: 1, make: 1, model: 1, year: 1, variant: 1, market: 1 }, { unique: true });
module.exports = mongoose.model('Fitment', fitmentSchema);
