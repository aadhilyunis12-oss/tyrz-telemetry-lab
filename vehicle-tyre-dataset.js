/**
 * TYRZ LAB — Global Road Vehicle & Tyre Specification Dataset
 * Comprehensive dataset covering all classes of road vehicles:
 * - Cars / Sedans / Coupes
 * - SUVs / Crossovers / 4x4
 * - Pickup Trucks / Light Trucks
 * - Heavy Commercial Trucks / Lorries / Semis
 * - Buses / Coaches / Transit
 * - Commercial Vans / Minivans / LCV
 * - Motorcycles / Scooters / Superbikes
 * - Electric Vehicles (EV) & Hybrids
 * - Sports Cars & Supercars (Ferrari F40, GT, Racing)
 */

(function (root, factory) {
  var dataset = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = dataset;
  }
  if (typeof root !== 'undefined') {
    root.TyrzVehicleDataset = dataset;
  }
  if (typeof window !== 'undefined') {
    window.TyrzVehicleDataset = dataset;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.TyrzVehicleDataset = dataset;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : this)), function () {
  'use strict';

  const VEHICLE_CATEGORIES = {
    car: {
      id: 'car',
      name: 'Car / Sedan / Hatchback',
      icon: '🚗',
      defaultBaselineMm: 8.0,
      legalMinMm: 1.6,
      warningThresholdMm: 3.0,
      wearRatePer1kKm: 0.142,
      avgLifespanKm: 45000,
      defaultPsi: '32 – 35 PSI',
      positions: [
        { code: 'FL', label: 'Front Left' },
        { code: 'FR', label: 'Front Right' },
        { code: 'RL', label: 'Rear Left' },
        { code: 'RR', label: 'Rear Right' }
      ],
      commonSizes: ['205/55 R16', '225/45 R17', '215/60 R16', '195/65 R15', '245/40 R18'],
      commonBrands: ['Michelin Pilot Sport 5', 'Pirelli Cinturato P7', 'Bridgestone Turanza T005', 'Continental PremiumContact 6', 'Goodyear Eagle F1'],
      popularModels: [
        { model: 'Toyota Camry', defaultSize: '215/55 R17', brand: 'Michelin Primacy 4' },
        { model: 'Honda Civic', defaultSize: '215/50 R17', brand: 'Goodyear Eagle Sport' },
        { model: 'BMW 3 Series', defaultSize: '225/45 R18', brand: 'Pirelli Cinturato P7' },
        { model: 'Mercedes-Benz C-Class', defaultSize: '225/50 R17', brand: 'Continental ProContact' },
        { model: 'Hyundai Elantra', defaultSize: '205/55 R16', brand: 'Hankook Kinergy' },
        { model: 'Volkswagen Golf', defaultSize: '205/55 R16', brand: 'Bridgestone Turanza' }
      ]
    },

    suv: {
      id: 'suv',
      name: 'SUV / Crossover / 4x4',
      icon: '🚙',
      defaultBaselineMm: 10.0,
      legalMinMm: 1.6,
      warningThresholdMm: 3.5,
      wearRatePer1kKm: 0.168,
      avgLifespanKm: 50000,
      defaultPsi: '35 – 40 PSI',
      positions: [
        { code: 'FL', label: 'Front Left' },
        { code: 'FR', label: 'Front Right' },
        { code: 'RL', label: 'Rear Left' },
        { code: 'RR', label: 'Rear Right' }
      ],
      commonSizes: ['235/60 R18', '255/55 R19', '225/65 R17', '275/45 R20', '265/60 R18'],
      commonBrands: ['Michelin Latitude Sport 3', 'Pirelli Scorpion Verde', 'Bridgestone Dueler H/P', 'Continental CrossContact', 'BFGoodrich All-Terrain'],
      popularModels: [
        { model: 'Toyota RAV4', defaultSize: '225/65 R17', brand: 'Yokohama Dunlop' },
        { model: 'Honda CR-V', defaultSize: '235/60 R18', brand: 'Bridgestone Ecopia' },
        { model: 'Ford Explorer', defaultSize: '255/55 R20', brand: 'Michelin Premier LTX' },
        { model: 'Jeep Grand Cherokee', defaultSize: '265/60 R18', brand: 'Pirelli Scorpion' },
        { model: 'BMW X5', defaultSize: '275/45 R20', brand: 'Continental CrossContact' },
        { model: 'Toyota Land Cruiser', defaultSize: '285/60 R18', brand: 'Dunlop Grandtrek' }
      ]
    },

    pickup: {
      id: 'pickup',
      name: 'Pickup Truck / Light Truck',
      icon: '🛻',
      defaultBaselineMm: 11.0,
      legalMinMm: 1.6,
      warningThresholdMm: 4.0,
      wearRatePer1kKm: 0.171,
      avgLifespanKm: 55000,
      defaultPsi: '38 – 45 PSI',
      positions: [
        { code: 'FL', label: 'Front Left' },
        { code: 'FR', label: 'Front Right' },
        { code: 'RL', label: 'Rear Left' },
        { code: 'RR', label: 'Rear Right' }
      ],
      commonSizes: ['265/70 R17', '275/65 R18', '275/55 R20', '245/75 R16'],
      commonBrands: ['BFGoodrich All-Terrain T/A KO2', 'Goodyear Wrangler All-Terrain', 'Michelin LTX M/S2', 'Falken Wildpeak A/T3W'],
      popularModels: [
        { model: 'Ford F-150', defaultSize: '275/65 R18', brand: 'Goodyear Wrangler' },
        { model: 'Chevrolet Silverado', defaultSize: '275/60 R20', brand: 'Bridgestone Alenza' },
        { model: 'RAM 1500', defaultSize: '275/55 R20', brand: 'Falken Wildpeak' },
        { model: 'Toyota Hilux', defaultSize: '265/65 R17', brand: 'Dunlop Grandtrek' },
        { model: 'Isuzu D-Max', defaultSize: '255/65 R17', brand: 'Bridgestone Dueler' }
      ]
    },

    truck: {
      id: 'truck',
      name: 'Heavy Commercial Truck / Semi / Lorry',
      icon: '🚚',
      defaultBaselineMm: 18.0,
      legalMinMm: 3.2, // Steer axle legal limit is 3.2mm (4/32")
      warningThresholdMm: 5.5,
      wearRatePer1kKm: 0.148,
      avgLifespanKm: 100000,
      defaultPsi: '100 – 120 PSI',
      positions: [
        { code: 'L1', label: 'Steer Axle Left (L1)' },
        { code: 'R1', label: 'Steer Axle Right (R1)' },
        { code: 'L2', label: 'Drive Axle Outer Left (L2)' },
        { code: 'R2', label: 'Drive Axle Outer Right (R2)' },
        { code: 'L3', label: 'Trailer Axle Left (L3)' },
        { code: 'R3', label: 'Trailer Axle Right (R3)' }
      ],
      commonSizes: ['315/80 R22.5', '295/80 R22.5', '11 R22.5', '385/65 R22.5'],
      commonBrands: ['Michelin X Line Energy', 'Bridgestone Ecopia H-Steer', 'Continental HSR2', 'Goodyear Marathon LHS', 'Hankook SmartFlex'],
      popularModels: [
        { model: 'Volvo FH16 Semi', defaultSize: '315/80 R22.5', brand: 'Michelin X Multiway' },
        { model: 'Scania R-Series', defaultSize: '315/70 R22.5', brand: 'Bridgestone Ecopia' },
        { model: 'Freightliner Cascadia', defaultSize: '295/75 R22.5', brand: 'Michelin X Line' },
        { model: 'Peterbilt 579', defaultSize: '11 R22.5', brand: 'Goodyear Endurance' },
        { model: 'Tata Prima 3538', defaultSize: '11.00 R20', brand: 'Apollo EnduRace' },
        { model: 'Eicher Pro 6037', defaultSize: '295/80 R22.5', brand: 'JK Tyre Jetsteel' }
      ]
    },

    bus: {
      id: 'bus',
      name: 'Bus / Coach / Transit',
      icon: '🚌',
      defaultBaselineMm: 16.0,
      legalMinMm: 3.2,
      warningThresholdMm: 5.0,
      wearRatePer1kKm: 0.160,
      avgLifespanKm: 80000,
      defaultPsi: '95 – 110 PSI',
      positions: [
        { code: 'FL', label: 'Front Left Steer' },
        { code: 'FR', label: 'Front Right Steer' },
        { code: 'RL', label: 'Rear Left Drive' },
        { code: 'RR', label: 'Rear Right Drive' }
      ],
      commonSizes: ['295/80 R22.5', '275/70 R22.5', '315/80 R22.5'],
      commonBrands: ['Michelin X InCity', 'Continental CoachRegio', 'Bridgestone U-AP 002', 'Goodyear Urban Max'],
      popularModels: [
        { model: 'Mercedes-Benz Citaro', defaultSize: '275/70 R22.5', brand: 'Michelin X InCity' },
        { model: 'Volvo B9R / B11R Coach', defaultSize: '295/80 R22.5', brand: 'Continental CoachRegio' },
        { model: 'Scania Touring Coach', defaultSize: '315/80 R22.5', brand: 'Bridgestone U-AP' },
        { model: 'Yutong ZK6129', defaultSize: '295/80 R22.5', brand: 'Double Coin RR680' }
      ]
    },

    van: {
      id: 'van',
      name: 'Commercial Van / Minivan / LCV',
      icon: '🚐',
      defaultBaselineMm: 9.5,
      legalMinMm: 1.6,
      warningThresholdMm: 3.2,
      wearRatePer1kKm: 0.175,
      avgLifespanKm: 45000,
      defaultPsi: '45 – 65 PSI',
      positions: [
        { code: 'FL', label: 'Front Left' },
        { code: 'FR', label: 'Front Right' },
        { code: 'RL', label: 'Rear Left' },
        { code: 'RR', label: 'Rear Right' }
      ],
      commonSizes: ['235/65 R16C', '215/75 R16C', '195/70 R15C', '225/70 R15C'],
      commonBrands: ['Michelin Agilis CrossClimate', 'Continental VanContact', 'Pirelli Carrier', 'Bridgestone Duravis'],
      popularModels: [
        { model: 'Mercedes-Benz Sprinter', defaultSize: '235/65 R16C', brand: 'Michelin Agilis 3' },
        { model: 'Ford Transit', defaultSize: '215/75 R16C', brand: 'Continental VanContact' },
        { model: 'Toyota HiAce', defaultSize: '195/80 R15C', brand: 'Bridgestone Duravis' },
        { model: 'RAM ProMaster', defaultSize: '225/75 R16C', brand: 'Goodyear Cargo' }
      ]
    },

    bike: {
      id: 'bike',
      name: 'Motorcycle / Scooter / Superbike',
      icon: '🏍️',
      defaultBaselineMm: 7.0, // Rear baseline: 7.0mm, Front: 4.5mm
      legalMinMm: 1.0, // Motorcycle legal min is 1.0mm (1/32")
      warningThresholdMm: 2.0,
      wearRatePer1kKm: 0.40, // Real motorcycle tyre wear rate (~15,000 km max life)
      avgLifespanKm: 15000,
      defaultPsi: '33 – 42 PSI',
      positions: [
        { code: 'F', label: 'Front Wheel' },
        { code: 'R', label: 'Rear Wheel' }
      ],
      commonSizes: ['120/70 ZR17', '180/55 ZR17', '190/55 ZR17', '200/55 ZR17', '110/80 R19'],
      commonBrands: ['Pirelli Diablo Rosso IV', 'Michelin Road 6', 'Metzeler Roadtec 01', 'Bridgestone Battlax Hypersport S22', 'Dunlop Sportmax'],
      popularModels: [
        { model: 'Yamaha YZF-R1', defaultSize: '120/70 ZR17 (F) / 200/55 ZR17 (R)', brand: 'Bridgestone Battlax RS11' },
        { model: 'Honda CBR1000RR', defaultSize: '120/70 ZR17 (F) / 190/55 ZR17 (R)', brand: 'Pirelli Diablo Supercorsa' },
        { model: 'BMW R1250GS Adventure', defaultSize: '120/70 R19 (F) / 170/60 R17 (R)', brand: 'Metzeler Tourance Next' },
        { model: 'Ducati Panigale V4', defaultSize: '120/70 ZR17 (F) / 200/60 ZR17 (R)', brand: 'Pirelli Diablo Corsa' },
        { model: 'Kawasaki Ninja ZX-10R', defaultSize: '120/70 ZR17 (F) / 190/55 ZR17 (R)', brand: 'Bridgestone S22' },
        { model: 'Vespa GTS 300', defaultSize: '120/70-12 (F) / 130/70-12 (R)', brand: 'Michelin City Grip 2' }
      ]
    },

    ev: {
      id: 'ev',
      name: 'Electric Vehicle (EV) / Hybrid',
      icon: '⚡',
      defaultBaselineMm: 8.0,
      legalMinMm: 1.6,
      warningThresholdMm: 3.2,
      wearRatePer1kKm: 0.183, // Instant high torque & heavy battery increases wear rate by ~30%
      avgLifespanKm: 35000,
      defaultPsi: '38 – 45 PSI',
      positions: [
        { code: 'FL', label: 'Front Left' },
        { code: 'FR', label: 'Front Right' },
        { code: 'RL', label: 'Rear Left' },
        { code: 'RR', label: 'Rear Right' }
      ],
      commonSizes: ['235/45 R18', '255/45 R19', '245/45 R20', '275/40 R20'],
      commonBrands: ['Michelin Pilot Sport EV', 'Pirelli P Zero Elect', 'Hankook i*cept iON', 'Bridgestone Turanza Eco', 'Continental EcoContact 6 Q'],
      popularModels: [
        { model: 'Tesla Model 3', defaultSize: '235/45 R18', brand: 'Michelin Pilot Sport T1' },
        { model: 'Tesla Model Y', defaultSize: '255/45 R19', brand: 'Hankook Ventus S1 EVO3 EV' },
        { model: 'Porsche Taycan', defaultSize: '265/35 R21 (F) / 305/30 R21 (R)', brand: 'Pirelli P Zero Elect' },
        { model: 'BYD Seal / Atto 3', defaultSize: '235/45 R19', brand: 'Continental EcoContact 6' },
        { model: 'Nissan Leaf', defaultSize: '205/55 R16', brand: 'Michelin Energy Saver' },
        { model: 'Hyundai Ioniq 5', defaultSize: '255/45 R20', brand: 'Michelin Primacy Tour A/S' }
      ]
    },

    supercar: {
      id: 'supercar',
      name: 'Sports Car & Supercar (F40, GT)',
      icon: '🏎️',
      defaultBaselineMm: 7.5,
      legalMinMm: 1.6,
      warningThresholdMm: 3.0,
      wearRatePer1kKm: 0.295, // High speed camber & high lateral g-forces
      avgLifespanKm: 20000,
      defaultPsi: '30 – 34 PSI',
      positions: [
        { code: 'FL', label: 'Front Left' },
        { code: 'FR', label: 'Front Right' },
        { code: 'RL', label: 'Rear Left' },
        { code: 'RR', label: 'Rear Right' }
      ],
      commonSizes: ['245/40 ZR17', '335/35 ZR17', '245/35 ZR19', '305/30 ZR20', '265/35 ZR20'],
      commonBrands: ['Pirelli P Zero Asimmetrico OE', 'Michelin Pilot Sport Cup 2', 'Bridgestone Potenza RE-71RS', 'Continental SportContact 7'],
      popularModels: [
        { model: 'Ferrari F40 (1987)', defaultSize: '245/40 ZR17 (F) / 335/35 ZR17 (R)', brand: 'Pirelli P Zero Asimmetrico OE' },
        { model: 'Ferrari F50 / 488 GTB', defaultSize: '245/35 ZR20 (F) / 305/30 ZR20 (R)', brand: 'Michelin Pilot Sport Cup 2' },
        { model: 'Porsche 911 GT3', defaultSize: '255/35 ZR20 (F) / 315/30 ZR21 (R)', brand: 'Michelin Pilot Sport Cup 2 R' },
        { model: 'Chevrolet Corvette Z06', defaultSize: '275/30 ZR20 (F) / 345/25 ZR21 (R)', brand: 'Michelin Pilot Super Sport' },
        { model: 'Lamborghini Huracán', defaultSize: '245/30 ZR20 (F) / 305/30 ZR20 (R)', brand: 'Pirelli P Zero Corsa' }
      ]
    }
  };

  const CALIBRATION_REFERENCES = {
    coin_us_quarter: { id: 'coin_us_quarter', name: 'US Quarter Coin', mm: 24.26, icon: '🪙' },
    coin_euro_2: { id: 'coin_euro_2', name: 'Euro 2€ Coin', mm: 25.75, icon: '🪙' },
    coin_euro_1: { id: 'coin_euro_1', name: 'Euro 1€ Coin', mm: 23.25, icon: '🪙' },
    coin_uk_pound: { id: 'coin_uk_pound', name: 'UK £1 Coin', mm: 23.43, icon: '🪙' },
    coin_in_rupee_5: { id: 'coin_in_rupee_5', name: 'Indian ₹5 Coin', mm: 23.00, icon: '🪙' },
    coin_in_rupee_10: { id: 'coin_in_rupee_10', name: 'Indian ₹10 Coin', mm: 27.00, icon: '🪙' },
    coin_jp_yen_100: { id: 'coin_jp_yen_100', name: 'Japanese 100¥ Coin', mm: 22.60, icon: '🪙' },
    coin_ca_dollar_1: { id: 'coin_ca_dollar_1', name: 'Canadian $1 Loonie', mm: 26.50, icon: '🪙' },
    card_credit: { id: 'card_credit', name: 'Standard Credit / ID Card Width', mm: 85.60, icon: '💳' },
    gauge_depth: { id: 'gauge_depth', name: 'Digital/Mechanical Depth Gauge', mm: 50.00, icon: '📏' },
    auto_detect: { id: 'auto_detect', name: 'AI Computer Vision Auto Scale', mm: null, icon: '⚡' }
  };

  return {
    categories: VEHICLE_CATEGORIES,
    calibrationRefs: CALIBRATION_REFERENCES,

    getCategory: function (catKey) {
      if (!catKey) return VEHICLE_CATEGORIES.car;
      const key = catKey.toLowerCase();
      if (key.includes('suv')) return VEHICLE_CATEGORIES.suv;
      if (key.includes('pickup') || key.includes('light truck')) return VEHICLE_CATEGORIES.pickup;
      if (key.includes('truck') || key.includes('lorry') || key.includes('semi')) return VEHICLE_CATEGORIES.truck;
      if (key.includes('bus') || key.includes('coach')) return VEHICLE_CATEGORIES.bus;
      if (key.includes('van') || key.includes('lcv')) return VEHICLE_CATEGORIES.van;
      if (key.includes('bike') || key.includes('motorcycle') || key.includes('scooter')) return VEHICLE_CATEGORIES.bike;
      if (key.includes('ev') || key.includes('electric')) return VEHICLE_CATEGORIES.ev;
      if (key.includes('supercar') || key.includes('sports') || key.includes('f40')) return VEHICLE_CATEGORIES.supercar;
      return VEHICLE_CATEGORIES[key] || VEHICLE_CATEGORIES.car;
    },

    getRefMm: function (refKey) {
      if (CALIBRATION_REFERENCES[refKey] && CALIBRATION_REFERENCES[refKey].mm) {
        return CALIBRATION_REFERENCES[refKey].mm;
      }
      return 24.26; // Default standard calibration scale (US/Euro/INR coin standard ~24.26mm)
    },

    getRefName: function (refKey) {
      if (refKey === 'auto_detect') return '⚡ AI Auto-Detected Reference (24.26 mm)';
      if (CALIBRATION_REFERENCES[refKey]) return CALIBRATION_REFERENCES[refKey].name;
      return 'Standard Reference Coin (24.26 mm)';
    }
  };
});
