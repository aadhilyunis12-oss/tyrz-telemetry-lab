require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Vehicle = require('../src/models/Vehicle');
const Fitment = require('../src/models/Fitment');
const TireProduct = require('../src/models/TireProduct');
const CalibrationReference = require('../src/models/CalibrationReference');

const fileArg = process.argv[2];
if (!fileArg) {
  console.error('Usage: node scripts/importCatalogJson.js path/to/catalog.json');
  process.exit(1);
}

function buildOperations(Model, records, keyFields) {
  if (!Array.isArray(records)) return [];
  return records.map(record => {
    const filter = {};
    for (const key of keyFields) {
      if (record[key] === undefined || record[key] === null || record[key] === '') {
        throw new Error(`Missing required key field "${key}" in record: ${JSON.stringify(record)}`);
      }
      filter[key] = record[key];
    }
    return { updateOne: { filter, update: { $set: record }, upsert: true } };
  });
}

async function run() {
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in .env first.');
  const filePath = path.resolve(process.cwd(), fileArg);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  await mongoose.connect(process.env.MONGO_URI);

  const tasks = [
    [Vehicle, parsed.vehicles, ['category', 'make', 'model', 'market']],
    [Fitment, parsed.fitments, ['category', 'make', 'model', 'year', 'variant', 'market']],
    [TireProduct, parsed.tireProducts, ['category', 'brand', 'model', 'market']],
    [CalibrationReference, parsed.calibrationReferences, ['key']]
  ];

  for (const [Model, records, keys] of tasks) {
    if (!Array.isArray(records) || records.length === 0) continue;
    const operations = buildOperations(Model, records, keys);
    await Model.bulkWrite(operations, { ordered: false });
    console.log(`Imported/upserted ${operations.length} record(s) into ${Model.collection.name}.`);
  }

  await mongoose.disconnect();
  console.log('Import complete. Confirm the source, market, year, variant and size data before using it for real tyre recommendations.');
}

run().catch(async error => {
  console.error('Import failed:', error.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
