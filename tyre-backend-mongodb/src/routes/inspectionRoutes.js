const express = require('express');
const Fitment = require('../models/Fitment');
const CalibrationReference = require('../models/CalibrationReference');
const Inspection = require('../models/Inspection');
const TireProduct = require('../models/TireProduct');

const router = express.Router();
const categories = ['car', 'bike', 'suv', 'truck', 'van'];
const positions = ['front-left', 'front-right', 'rear-left', 'rear-right'];

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const vehicleCategory = String(body.vehicleCategory || '').trim();
    const vehicleMake = String(body.vehicleMake || '').trim();
    const vehicleModel = String(body.vehicleModel || '').trim();
    const modelYear = Number(body.modelYear);
    const vehicleVariant = String(body.vehicleVariant || '').trim();
    const tyreBrand = String(body.tyreBrand || '').trim();
    const tyreModel = String(body.tyreModel || '').trim();
    const tyreSize = String(body.tyreSize || '').trim().toUpperCase().replace(/\s+/g, '');
    const tyrePosition = String(body.tyrePosition || '').trim();
    const measurementMethod = String(body.measurementMethod || 'photo').trim();

    if (!categories.includes(vehicleCategory) || !vehicleMake || !vehicleModel ||
        !Number.isInteger(modelYear) || modelYear < 1900 || !tyreBrand || !tyreModel || !tyreSize || !positions.includes(tyrePosition)) {
      return res.status(400).json({
        message: 'Required fields: vehicleCategory, vehicleMake, vehicleModel, modelYear, tyreBrand, tyreModel, tyreSize and tyrePosition.'
      });
    }
    if (!['photo', 'manual', 'unknown'].includes(measurementMethod)) {
      return res.status(400).json({ message: 'measurementMethod must be photo, manual or unknown.' });
    }

    // Resolve an exact fitment before saving it, so an arbitrary tyre size is not treated as compatible.
    let fitment = null;
    if (vehicleVariant) {
      fitment = await Fitment.findOne({
        category: vehicleCategory,
        make: vehicleMake,
        model: vehicleModel,
        year: modelYear,
        variant: vehicleVariant,
        market: String(body.market || 'IN').toUpperCase()
      }).lean();
    }

    if (fitment) {
      const expectedSize = tyrePosition.startsWith('front-') ? fitment.frontSize : fitment.rearSize;
      if (expectedSize.toUpperCase() !== tyreSize) {
        return res.status(422).json({
          message: 'The selected tyre size does not match the currently stored fitment for this position.',
          expectedSize,
          warning: fitment.demoOnly ? 'Stored fitment is demo-only and must be verified.' : null
        });
      }
    } else {
      return res.status(422).json({
        message: 'No exact vehicle/year/variant fitment is stored. Add a verified fitment before saving this selection.',
        nextStep: 'Use a checked vehicle placard/owner-manual record or a licensed fitment provider.'
      });
    }

    const market = String(body.market || 'IN').toUpperCase();
    const product = await TireProduct.findOne({
      category: vehicleCategory,
      market,
      brand: tyreBrand,
      model: tyreModel,
      sizes: tyreSize
    }).lean();
    if (!product) {
      return res.status(422).json({
        message: 'The selected tyre brand/model is not stored as available in the selected size.',
        nextStep: 'Select a product returned by /api/catalog/tyres or import a verified product catalogue.'
      });
    }

    let calibrationReferenceKey = String(body.calibrationReferenceKey || '').trim();
    let calibrationDimensionMm = body.calibrationDimensionMm == null || body.calibrationDimensionMm === ''
      ? null : Number(body.calibrationDimensionMm);

    if (measurementMethod === 'photo') {
      if (!calibrationReferenceKey) {
        return res.status(400).json({
          message: 'Photo-based millimetre measurement requires a known-size calibration reference.'
        });
      }

      if (calibrationReferenceKey === 'custom') {
        if (!Number.isFinite(calibrationDimensionMm) || calibrationDimensionMm <= 0) {
          return res.status(400).json({ message: 'Enter the custom reference length/diameter in millimetres.' });
        }
      } else {
        const reference = await CalibrationReference.findOne({ key: calibrationReferenceKey, active: true }).lean();
        if (!reference || (!reference.diameterMm && !reference.lengthMm)) {
          return res.status(400).json({ message: 'The selected reference has no usable known dimension.' });
        }
        calibrationDimensionMm = reference.diameterMm || reference.lengthMm;
      }
    }

    const odometerKm = body.odometerKm == null || body.odometerKm === '' ? null : Number(body.odometerKm);
    if (odometerKm !== null && (!Number.isFinite(odometerKm) || odometerKm < 0)) {
      return res.status(400).json({ message: 'odometerKm must be a non-negative number.' });
    }

    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter(url => typeof url === 'string' && /^https?:\/\//i.test(url)).slice(0, 10)
      : [];

    const inspection = await Inspection.create({
      vehicleCategory, vehicleMake, vehicleModel, modelYear,
      vehicleVariant, tyreBrand, tyreModel, tyreSize, tyrePosition,
      odometerKm, calibrationReferenceKey, calibrationDimensionMm,
      measurementMethod, imageUrls,
      treadDepthMm: body.treadDepthMm == null ? null : Number(body.treadDepthMm),
      estimatedRemainingKm: body.estimatedRemainingKm == null ? null : Number(body.estimatedRemainingKm),
      fitmentDemoOnly: Boolean(fitment.demoOnly),
      fitmentSource: fitment.sourceName || 'unknown',
      notes: String(body.notes || '')
    });

    res.status(201).json({
      message: 'Inspection details saved.',
      data: inspection,
      warning: fitment.demoOnly
        ? 'This record used demo-only vehicle/tyre fitment data. Verify the fitment before real-world use.'
        : null
    });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id).lean();
    if (!inspection) return res.status(404).json({ message: 'Inspection not found.' });
    res.json({ data: inspection });
  } catch (error) { next(error); }
});

module.exports = router;
