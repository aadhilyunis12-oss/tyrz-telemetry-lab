/*
 * UI-DEMO DATA ONLY.
 * Every vehicle/year/tyre combination in this file is deliberately marked demoOnly:true
 * and verified:false. Do not use these mappings to recommend or fit real tyres until they
 * have been checked against the vehicle placard/manual and tyre manufacturer catalogue.
 */

const vehicles = [
  { category: 'car', make: 'Maruti Suzuki', model: 'Swift', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['Hatchback'], demoOnly: true, verified: false },
  { category: 'car', make: 'Hyundai', model: 'i20', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['Hatchback'], demoOnly: true, verified: false },
  { category: 'car', make: 'Honda', model: 'City', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['Sedan'], demoOnly: true, verified: false },
  { category: 'suv', make: 'Hyundai', model: 'Creta', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['SUV'], demoOnly: true, verified: false },
  { category: 'suv', make: 'Tata', model: 'Nexon', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['SUV'], demoOnly: true, verified: false },
  { category: 'bike', make: 'Honda', model: 'Activa 6G', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['Scooter'], demoOnly: true, verified: false },
  { category: 'bike', make: 'Royal Enfield', model: 'Classic 350', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['Motorcycle'], demoOnly: true, verified: false },
  { category: 'bike', make: 'Bajaj', model: 'Pulsar 150', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['Motorcycle'], demoOnly: true, verified: false },
  { category: 'bike', make: 'Hero', model: 'Splendor Plus', market: 'IN', supportedYears: [2022, 2023, 2024], bodyStyles: ['Motorcycle'], demoOnly: true, verified: false }
];

const fitmentTemplates = [
  { category: 'car', market: 'IN', make: 'Maruti Suzuki', model: 'Swift', year: 2023, variant: 'LXi (demo)', frontSize: '165/80R14', rearSize: '165/80R14', demoOnly: true, verified: false },
  { category: 'car', market: 'IN', make: 'Maruti Suzuki', model: 'Swift', year: 2023, variant: 'ZXi (demo)', frontSize: '185/65R15', rearSize: '185/65R15', demoOnly: true, verified: false },
  { category: 'car', market: 'IN', make: 'Hyundai', model: 'i20', year: 2023, variant: 'Standard trim (demo)', frontSize: '185/65R15', rearSize: '185/65R15', demoOnly: true, verified: false },
  { category: 'car', market: 'IN', make: 'Hyundai', model: 'i20', year: 2023, variant: 'Alloy trim (demo)', frontSize: '195/55R16', rearSize: '195/55R16', demoOnly: true, verified: false },
  { category: 'car', market: 'IN', make: 'Honda', model: 'City', year: 2023, variant: '15-inch wheel trim (demo)', frontSize: '175/65R15', rearSize: '175/65R15', demoOnly: true, verified: false },
  { category: 'car', market: 'IN', make: 'Honda', model: 'City', year: 2023, variant: '16-inch wheel trim (demo)', frontSize: '185/55R16', rearSize: '185/55R16', demoOnly: true, verified: false },
  { category: 'suv', market: 'IN', make: 'Hyundai', model: 'Creta', year: 2023, variant: '16-inch wheel trim (demo)', frontSize: '205/65R16', rearSize: '205/65R16', demoOnly: true, verified: false },
  { category: 'suv', market: 'IN', make: 'Hyundai', model: 'Creta', year: 2023, variant: '17-inch wheel trim (demo)', frontSize: '215/60R17', rearSize: '215/60R17', demoOnly: true, verified: false },
  { category: 'suv', market: 'IN', make: 'Tata', model: 'Nexon', year: 2023, variant: '16-inch wheel trim (demo)', frontSize: '195/60R16', rearSize: '195/60R16', demoOnly: true, verified: false },
  { category: 'bike', market: 'IN', make: 'Honda', model: 'Activa 6G', year: 2023, variant: 'Standard (demo)', frontSize: '90/90-12', rearSize: '90/100-10', demoOnly: true, verified: false },
  { category: 'bike', market: 'IN', make: 'Royal Enfield', model: 'Classic 350', year: 2023, variant: 'Standard (demo)', frontSize: '100/90-19', rearSize: '120/80-18', demoOnly: true, verified: false },
  { category: 'bike', market: 'IN', make: 'Bajaj', model: 'Pulsar 150', year: 2023, variant: 'Standard (demo)', frontSize: '90/90-17', rearSize: '120/80-17', demoOnly: true, verified: false },
  { category: 'bike', market: 'IN', make: 'Hero', model: 'Splendor Plus', year: 2023, variant: 'Standard (demo)', frontSize: '80/100-18', rearSize: '80/100-18', demoOnly: true, verified: false }
] .map(record => ({
  ...record,
  sourceName: 'starter-demo-data',
  sourceUrl: '',
  notes: 'Demo record only — verify exact year, variant, wheel and market using the tyre placard/owner manual and manufacturer fitment catalogue.'
}));

// Repeat the small template across nearby years only to demonstrate the cascading year selector.
// These generated year rows remain explicitly unverified/demo-only.
const fitments = fitmentTemplates.flatMap(record => [2022, 2023, 2024].map(year => ({ ...record, year })));

const carSizes = [
  '165/80R14', '185/65R15', '195/55R16', '175/65R15', '185/55R16',
  '205/65R16', '215/60R17', '195/60R16'
];
const bikeSizes = [
  '90/90-12', '90/100-10', '100/90-19', '120/80-18', '90/90-17', '120/80-17', '80/100-18'
];
const tireProducts = [
  { category: 'car', market: 'IN', brand: 'MRF', model: 'ZVTV (demo mapping)', sizes: carSizes, demoOnly: true, verified: false },
  { category: 'car', market: 'IN', brand: 'Apollo', model: 'Alnac 4G (demo mapping)', sizes: carSizes, demoOnly: true, verified: false },
  { category: 'car', market: 'IN', brand: 'CEAT', model: 'SecuraDrive (demo mapping)', sizes: carSizes, demoOnly: true, verified: false },
  { category: 'car', market: 'IN', brand: 'Michelin', model: 'Primacy (demo mapping)', sizes: carSizes, demoOnly: true, verified: false },
  { category: 'car', market: 'IN', brand: 'Bridgestone', model: 'Turanza (demo mapping)', sizes: carSizes, demoOnly: true, verified: false },
  { category: 'bike', market: 'IN', brand: 'MRF', model: 'Nylogrip (demo mapping)', sizes: bikeSizes, demoOnly: true, verified: false },
  { category: 'bike', market: 'IN', brand: 'CEAT', model: 'Zoom (demo mapping)', sizes: bikeSizes, demoOnly: true, verified: false },
  { category: 'bike', market: 'IN', brand: 'Apollo', model: 'ActiGrip (demo mapping)', sizes: bikeSizes, demoOnly: true, verified: false },
  { category: 'bike', market: 'IN', brand: 'Michelin', model: 'City (demo mapping)', sizes: bikeSizes, demoOnly: true, verified: false }
].map(record => ({
  ...record,
  sourceName: 'starter-demo-data',
  sourceUrl: '',
  notes: 'Demo product-to-size mapping, not a manufacturer-approved fitment list. Replace or verify before deployment.'
}));

// SUV product choices reuse the demo catalogue shape solely to demonstrate the UI flow.
// They are not evidence that these exact products/sizes are sold or approved for a real SUV.
tireProducts.push(...tireProducts.filter(record => record.category === 'car').map(record => ({
  ...record,
  category: 'suv',
  notes: 'SUV demo mapping only. Verify exact product/size availability and all load/speed ratings before use.'
})));

const calibrationReferences = [
  {
    key: 'us-quarter', label: 'US Quarter coin (24.26 mm diameter)', diameterMm: 24.26,
    kind: 'circle', recommendedFor: ['photo'], active: true,
    notes: 'Use only when the actual reference is a US quarter and it is in the same plane as the tyre tread.'
  },
  {
    key: 'custom', label: 'Custom ruler/object length', lengthMm: null,
    kind: 'custom', recommendedFor: ['photo'], active: true,
    notes: 'Enter the known physical length in millimetres. The reference should be visible in the image and at the same plane/distance as the tread.'
  },
  {
    key: 'none-manual', label: 'No photo calibration (manual measurement only)', kind: 'custom',
    recommendedFor: ['manual'], active: true,
    notes: 'Do not use pixel-based photo measurement without a known-size reference.'
  }
];

module.exports = { vehicles, fitments, tireProducts, calibrationReferences };
