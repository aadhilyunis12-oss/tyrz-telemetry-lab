require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('../src/models/Vehicle');
const Fitment = require('../src/models/Fitment');
const TireProduct = require('../src/models/TireProduct');
const CalibrationReference = require('../src/models/CalibrationReference');
const { vehicles, fitments, tireProducts, calibrationReferences } = require('../data/starterCatalog');

async function upsertMany(Model, records, keyFields, extraDefaults = {}) {
  const ops = records.map(record => {
    const filter = {};
    for (const key of keyFields) filter[key] = record[key];
    return {
      updateOne: {
        filter,
        update: { $set: { ...extraDefaults, ...record } },
        upsert: true
      }
    };
  });
  if (ops.length) await Model.bulkWrite(ops, { ordered: false });
}

async function run() {
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in .env before running the seed script.');
  await mongoose.connect(process.env.MONGO_URI);

  await upsertMany(Vehicle, vehicles, ['category', 'make', 'model', 'market'], {
    sourceName: 'starter-demo-data', sourceUrl: '', verified: false, demoOnly: true,
    notes: 'Starter dropdown example only; catalogue coverage is not complete.'
  });
  await upsertMany(Fitment, fitments, ['category', 'make', 'model', 'year', 'variant', 'market'], {
    sourceName: 'starter-demo-data', sourceUrl: '', verified: false, demoOnly: true
  });
  await upsertMany(TireProduct, tireProducts, ['category', 'brand', 'model', 'market'], {
    sourceName: 'starter-demo-data', sourceUrl: '', verified: false, demoOnly: true
  });
  await upsertMany(CalibrationReference, calibrationReferences, ['key']);

  console.log(`Seed complete: ${vehicles.length} vehicle rows, ${fitments.length} fitment rows, ${tireProducts.length} tyre product rows, ${calibrationReferences.length} calibration references.`);
  console.log('NOTE: vehicle fitment and tyre product rows are demo-only. Verify and replace before real-world use.');
  await mongoose.disconnect();
}

run().catch(async error => {
  console.error('Seed failed:', error.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
