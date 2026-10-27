const mongoose = require('mongoose');

const calibrationReferenceSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  diameterMm: { type: Number, default: null },
  lengthMm: { type: Number, default: null },
  kind: { type: String, enum: ['circle', 'length', 'custom'], default: 'circle' },
  recommendedFor: [{ type: String }],
  active: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('CalibrationReference', calibrationReferenceSchema);
