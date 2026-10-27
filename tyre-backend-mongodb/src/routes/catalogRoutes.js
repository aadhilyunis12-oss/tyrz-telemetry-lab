const express = require('express');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Fitment = require('../models/Fitment');
const TireProduct = require('../models/TireProduct');
const CalibrationReference = require('../models/CalibrationReference');

const router = express.Router();
const CATEGORIES = [
  { value: 'car', label: 'Car / Sedan / Hatchback' },
  { value: 'suv', label: 'SUV / Crossover' },
  { value: 'bike', label: 'Bike / Motorcycle / Scooter' },
  { value: 'truck', label: 'Truck / Pickup' },
  { value: 'van', label: 'Van / Minivan' }
];

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalize = value => typeof value === 'string' ? value.trim() : '';

router.get('/categories', (_req, res) => res.json({ data: CATEGORIES }));

// GET /api/catalog/vehicles?category=car&search=swift&market=IN
router.get('/vehicles', async (req, res, next) => {
  try {
    const { category, search, market = 'IN' } = req.query;
    const filter = { market: String(market).toUpperCase() };

    if (category) {
      if (!['car', 'bike', 'suv', 'truck', 'van'].includes(category)) {
        return res.status(400).json({ message: 'Unsupported vehicle category.' });
      }
      filter.category = category;
    }

    if (search && normalize(String(search))) {
      const safeSearch = escapeRegex(normalize(String(search)));
      filter.$or = [
        { make: { $regex: safeSearch, $options: 'i' } },
        { model: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const data = await Vehicle.find(filter)
      .select('category make model market supportedYears bodyStyles verified demoOnly notes')
      .sort({ make: 1, model: 1 })
      .limit(250)
      .lean();

    res.json({
      data,
      total: data.length,
      dataNotice: data.some(item => item.demoOnly)
        ? 'This starter project contains a small demo vehicle catalogue, not a complete all-market database.'
        : null
    });
  } catch (error) { next(error); }
});

// GET /api/catalog/vehicles/:id/years
router.get('/vehicles/:id/years', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid vehicle ID.' });
    }
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

    const yearsFromFitments = await Fitment.distinct('year', {
      category: vehicle.category,
      make: vehicle.make,
      model: vehicle.model,
      market: vehicle.market
    });
    const years = [...new Set([...(vehicle.supportedYears || []), ...yearsFromFitments])]
      .sort((a, b) => b - a);

    res.json({ vehicle, years, demoOnly: vehicle.demoOnly });
  } catch (error) { next(error); }
});

// GET /api/catalog/fitments?category=car&make=Maruti%20Suzuki&model=Swift&year=2023
router.get('/fitments', async (req, res, next) => {
  try {
    const category = normalize(req.query.category);
    const make = normalize(req.query.make);
    const model = normalize(req.query.model);
    const year = req.query.year ? Number(req.query.year) : null;
    const market = (normalize(req.query.market) || 'IN').toUpperCase();

    if (!category || !make || !model) {
      return res.status(400).json({ message: 'category, make and model are required.' });
    }
    if (!['car', 'bike', 'suv', 'truck', 'van'].includes(category)) {
      return res.status(400).json({ message: 'Unsupported vehicle category.' });
    }
    if (req.query.year && (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 2)) {
      return res.status(400).json({ message: 'Invalid model year.' });
    }

    const filter = { category, market, make, model };
    if (year) filter.year = year;
    if (req.query.variant) filter.variant = normalize(req.query.variant);

    const data = await Fitment.find(filter).sort({ year: -1, variant: 1 }).lean();
    const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);

    res.json({
      data,
      years,
      total: data.length,
      warning: data.some(item => item.demoOnly)
        ? 'One or more results are demo/unverified examples. Confirm fitment using the exact vehicle placard/manual before fitting.'
        : null
    });
  } catch (error) { next(error); }
});

// GET /api/catalog/tyres?category=car&size=185%2F65R15
// Only products whose catalog record contains the requested size are returned.
router.get('/tyres', async (req, res, next) => {
  try {
    const category = normalize(req.query.category);
    const size = normalize(req.query.size).toUpperCase().replace(/\s+/g, '');
    const market = (normalize(req.query.market) || 'IN').toUpperCase();

    if (!category || !size) return res.status(400).json({ message: 'category and size are required.' });
    if (!['car', 'bike', 'suv', 'truck', 'van'].includes(category)) {
      return res.status(400).json({ message: 'Unsupported vehicle category.' });
    }

    const data = await TireProduct.find({
      category,
      market,
      sizes: size
    }).sort({ brand: 1, model: 1 }).lean();

    res.json({
      data: data.map(item => ({ ...item, autoSelectedSize: size })),
      total: data.length,
      requestedSize: size,
      warning: data.some(item => item.demoOnly)
        ? 'Brand/model availability is illustrative demo data. Verify that the exact model is sold in this size in your market.'
        : null
    });
  } catch (error) { next(error); }
});

// Single call to power the cascading UI after the user chooses the vehicle, year, variant and position.
// GET /api/catalog/options?category=car&make=...&model=...&year=2023&variant=...&position=front-left
router.get('/options', async (req, res, next) => {
  try {
    const category = normalize(req.query.category);
    const make = normalize(req.query.make);
    const model = normalize(req.query.model);
    const year = Number(req.query.year);
    const variant = normalize(req.query.variant);
    const position = normalize(req.query.position);
    const market = (normalize(req.query.market) || 'IN').toUpperCase();

    if (!category || !make || !model || !Number.isInteger(year) || !variant || !position) {
      return res.status(400).json({
        message: 'category, make, model, year, variant and position are required.'
      });
    }
    if (!['front-left', 'front-right', 'rear-left', 'rear-right'].includes(position)) {
      return res.status(400).json({ message: 'Invalid tyre position.' });
    }

    const fitment = await Fitment.findOne({ category, market, make, model, year, variant }).lean();
    if (!fitment) {
      return res.status(404).json({
        message: 'No fitment record exists for this exact vehicle/year/variant in the current database.',
        nextStep: 'Add a verified fitment record; do not guess a tyre size.'
      });
    }

    const side = position.startsWith('front-') ? 'front' : 'rear';
    const autoSelectedSize = side === 'front' ? fitment.frontSize : fitment.rearSize;
    const products = await TireProduct.find({ category, market, sizes: autoSelectedSize })
      .sort({ brand: 1, model: 1 }).lean();

    res.json({
      fitment,
      side,
      autoSelectedSize,
      tyres: products.map(product => ({ ...product, autoSelectedSize })),
      fitmentVerified: Boolean(fitment.verified && !fitment.demoOnly),
      warning: fitment.demoOnly || products.some(product => product.demoOnly)
        ? 'Demo/unverified fitment data is being used. Do not treat these results as road-safe recommendations.'
        : null
    });
  } catch (error) { next(error); }
});

router.get('/calibration-references', async (_req, res, next) => {
  try {
    const data = await CalibrationReference.find({ active: true }).sort({ key: 1 }).lean();
    res.json({
      data,
      photoMeasurementNote: 'For pixel-to-millimetre photo measurement, a known-size reference visible in the same plane as the tread is required. Without it, the scale is unknown.'
    });
  } catch (error) { next(error); }
});

module.exports = router;
