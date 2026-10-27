const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  vehicleCategory: { type: String, required: true, enum: ['car', 'bike', 'suv', 'truck', 'van'] },
  vehicleMake: { type: String, required: true, trim: true },
  vehicleModel: { type: String, required: true, trim: true },
  modelYear: { type: Number, required: true },
  vehicleVariant: { type: String, default: '', trim: true },
  tyreBrand: { type: String, default: '', trim: true },
  tyreModel: { type: String, default: '', trim: true },
  tyreSize: { type: String, required: true, trim: true },
  tyrePosition: { type: String, required: true, enum: ['front-left', 'front-right', 'rear-left', 'rear-right'] },
  odometerKm: { type: Number, min: 0, default: null },
  calibrationReferenceKey: { type: String, default: '' },
  calibrationDimensionMm: { type: Number, min: 0, default: null },
  measurementMethod: { type: String, enum: ['photo', 'manual', 'unknown'], default: 'photo' },
  imageUrls: [{ type: String }],
  treadDepthMm: { type: Number, min: 0, default: null },
  estimatedRemainingKm: { type: Number, min: 0, default: null },
  fitmentDemoOnly: { type: Boolean, default: true },
  fitmentSource: { type: String, default: 'local-demo-dataset' },
  notes: { type: String, default: '' }
}, { timestamps: true });

inspectionSchema.index({ vehicleMake: 1, vehicleModel: 1, modelYear: 1 });
module.exports = mongoose.model('Inspection', inspectionSchema);
