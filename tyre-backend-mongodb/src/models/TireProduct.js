const mongoose = require('mongoose');

const tireProductSchema = new mongoose.Schema({
  category: { type: String, required: true, enum: ['car', 'bike', 'suv', 'truck', 'van'], index: true },
  market: { type: String, default: 'IN', index: true },
  brand: { type: String, required: true, trim: true, index: true },
  model: { type: String, required: true, trim: true, index: true },
  sizes: [{ type: String, trim: true, index: true }],
  sourceName: { type: String, default: 'local-demo-dataset' },
  sourceUrl: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  demoOnly: { type: Boolean, default: true },
  notes: { type: String, default: 'Illustrative product/size mapping only. Confirm availability with the tyre manufacturer or dealer.' }
}, { timestamps: true });

tireProductSchema.index({ category: 1, brand: 1, model: 1, market: 1 }, { unique: true });
module.exports = mongoose.model('TireProduct', tireProductSchema);
