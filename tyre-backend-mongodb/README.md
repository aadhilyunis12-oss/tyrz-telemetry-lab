# Tyre Fitment + Calibration Backend (Node.js + MongoDB)

This is a backend starter for the existing **Vehicle Details** and **Tyre Details & Calibration** form. It does not redesign the frontend.

## What it supports

- Vehicle categories: Car / Sedan / Hatchback, SUV / Crossover, Bike / Motorcycle / Scooter, Truck / Pickup, Van / Minivan.
- Vehicle search by make/model.
- Model year and variant/trim fitment lookups.
- Front/rear tyre sizes for four wheel positions (`front-left`, `front-right`, `rear-left`, `rear-right`).
- Tyre brand/model choices filtered to a specific selected size; the API returns `autoSelectedSize` so the frontend can set the size when a tyre product is selected.
- Calibration reference list (including the US Quarter reference shown in your screenshot).
- Inspection submission to MongoDB with selected vehicle, tyre, odometer and calibration information.
- A JSON import tool for a larger verified vehicle/fitment/product catalogue.

## Important dataset note

The bundled `data/starterCatalog.js` has a small **demo-only** dataset to make the dropdown flow testable. The demo records are marked `demoOnly: true` and `verified: false`. Tyre brand/model-to-size lists inside that demo file are illustrative and are **not manufacturer-approved recommendations**. Do not use them to select tyres for real road use before verifying the exact market, vehicle year, trim/variant, wheel size, load rating and speed rating.

There is no single static list in this starter project that covers every car, bike, model year, trim and tyre product worldwide. Vehicle make/model catalogues and tyre fitment/product catalogues are different datasets. For a real deployment, import records from official vehicle owner manuals/tyre placards and tyre-maker catalogues, or integrate a licensed data provider. Provider availability depends on market: for example, the NHTSA vPIC API is a vehicle make/model data source, not a tyre-fitment database; Tire Library documents a separate vehicle-fitment endpoint and tyre product search endpoint, both requiring an API key. Check data coverage and usage terms before choosing a provider:

- NHTSA vPIC API: https://vpic.nhtsa.dot.gov/api/Home/Index
- Tire Library vehicle fitments: https://app.tireweblibrary.com/Docs/Vehicles
- Tire Library tyre search: https://app.tireweblibrary.com/Docs/Tires

For an India-first app, verify that any provider supports Indian-market cars, scooters/motorcycles and tyre models before paying for or importing data.

## 1. Requirements

Install Node.js (LTS recommended) and create a MongoDB Atlas cluster, or use a local MongoDB server.

## 2. Install

Open a terminal in this folder:

```bash
npm install
```

Copy `.env.example` to `.env`. On Windows Command Prompt:

```bat
copy .env.example .env
```

On PowerShell or macOS/Linux:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_real_mongodb_connection_string
```

Set `CLIENT_URL` to the exact origin of your existing frontend. For example, a Vite app often runs on port `5173`; a different frontend port requires a matching value. Keep `.env` private and do not commit it to GitHub.

## 3. Seed MongoDB

```bash
npm run seed
```

This upserts the starter vehicle, fitment, product and calibration reference records. It does not delete your other catalogue records.

## 4. Start the API

```bash
npm run dev
```

Health check:

- http://localhost:5000/api/health

The server should connect to MongoDB before it begins listening.

## API endpoints

### Vehicle dropdowns

```http
GET /api/catalog/categories
GET /api/catalog/vehicles?category=car&market=IN
GET /api/catalog/vehicles?category=bike&search=Activa&market=IN
GET /api/catalog/vehicles/:vehicleId/years
```

Use `/vehicles` to fill the make/model selector. The result includes `supportedYears`; `/vehicles/:vehicleId/years` combines the vehicle's year list with years found in the fitment collection.

### Model year, variant and tyre fitment

```http
GET /api/catalog/fitments?category=car&make=Maruti%20Suzuki&model=Swift&year=2023&market=IN
```

This returns records for the selected make/model/year. Each fitment record contains `variant`, `frontSize` and `rearSize`. Use `variant` to fill the trim/variant selector if your frontend has one. Exact variant is important because two trims of the same model/year may have different wheels and tyre sizes.

### Auto-select tire size when a brand/model is selected

```http
GET /api/catalog/options?category=car&make=Maruti%20Suzuki&model=Swift&year=2023&variant=ZXi%20(demo)&position=front-left&market=IN
```

Response includes:

- `autoSelectedSize`: size associated with the chosen position.
- `tyres`: tyre products containing this size in the product catalogue.
- `fitmentVerified` and `warning`: tell the frontend whether demo/unverified data was used.

If user changes `position` from a front wheel to a rear wheel, call the endpoint again. For bikes, front and rear tyre sizes are commonly different.

You can also query product choices directly:

```http
GET /api/catalog/tyres?category=bike&size=90%2F90-12&market=IN
```

The response property `autoSelectedSize` can be assigned to your existing tyre-size field when the user chooses a compatible brand/model. If a brand/model has multiple valid sizes for the current fitment, keep the fitment-selected size rather than arbitrarily choosing another one.

### Calibration reference

```http
GET /api/catalog/calibration-references
```

For photo-based pixel-to-millimetre measurement, a known-size reference must be visible in the image and approximately in the same plane as the tyre tread. For the US Quarter option, use an actual US quarter coin. If you do not have that object, use a measured ruler/object and submit its known dimension as a custom reference. Without a known reference, the image scale is unknown; do not claim a precise millimetre measurement from pixels alone.

`POST /api/inspections` requires a calibration reference for `measurementMethod: "photo"`. For `measurementMethod: "manual"`, this photo calibration is not required.

### Save an inspection

`POST /api/inspections` with `Content-Type: application/json`:

```json
{
  "vehicleCategory": "car",
  "vehicleMake": "Maruti Suzuki",
  "vehicleModel": "Swift",
  "modelYear": 2023,
  "vehicleVariant": "ZXi (demo)",
  "tyreBrand": "MRF",
  "tyreModel": "ZVTV (demo mapping)",
  "tyreSize": "185/65R15",
  "tyrePosition": "front-left",
  "odometerKm": 45000,
  "measurementMethod": "photo",
  "calibrationReferenceKey": "us-quarter",
  "imageUrls": [],
  "notes": "Demo test only"
}
```

The backend checks that the selected tyre size matches the stored size for the exact vehicle/year/variant/wheel position. It rejects selections when no fitment row exists. This is intentional: a missing fitment should not be replaced with a guessed size.

Other inspection endpoints:

```http
GET /api/inspections/:inspectionId
```

## Suggested frontend sequence

1. Load `/api/catalog/categories` for the category selector.
2. When category changes, call `/api/catalog/vehicles?category=...` and populate make/model. A production dataset may require a separate make selector and dependent model selector.
3. When make/model changes, fetch its model years. Show only years available for that selected vehicle.
4. After the user selects a year/variant, fetch `/api/catalog/fitments`.
5. When wheel position changes, call `/api/catalog/options` and store `autoSelectedSize` in the tyre-size field.
6. Use the returned `tyres` to fill tyre brand/model. If user explicitly changes brand/model, use the chosen product's returned `autoSelectedSize` to update tyre size.
7. Load calibration references from `/api/catalog/calibration-references`.
8. Submit selected values to `POST /api/inspections`.

The exact JavaScript event handler depends on whether your frontend uses React, plain HTML/JavaScript, Vue, etc. Keep your current UI controls and connect their state to these endpoints.

## Import a larger verified dataset

Prepare a JSON file using `data/customCatalog.template.json` as a schema example. **Replace all example values with genuine records** and make sure `sourceName`, `sourceUrl`, `market`, `year`, `variant`, `frontSize` and `rearSize` reflect the source precisely.

Then run:

```bash
node scripts/importCatalogJson.js path/to/your-catalog.json
```

The importer upserts into the four collections: `vehicles`, `fitments`, `tireproducts` and `calibrationreferences`. It does not clear collections. Keep source citations/URLs with imported fitments so records can be audited later.

## MongoDB collections

- `vehicles`: category, make, model, market and available model years.
- `fitments`: exact category/make/model/year/variant and front/rear fitment sizes.
- `tireproducts`: tyre brand/model with its explicitly catalogued sizes.
- `calibrationreferences`: physical reference dimensions for image calibration.
- `inspections`: selected vehicle and tyre details, calibration choice, odometer and inspection output fields.

## Safety / accuracy requirements for a real product

- Keep `demoOnly: false` only after you verify a row against a source appropriate to the country and exact model year/trim.
- Include load index and speed rating in a production fitment schema. This starter keeps the displayed size simple to fit the existing UI, but size alone is not sufficient for all compatibility checks.
- Do not infer fitment from vehicle name alone if multiple wheel sizes or trims exist.
- Do not estimate mm from photo pixels without calibration.
- The backend currently stores a selected inspection; it does not itself run tyre-tread computer vision or predict remaining kilometres. Those require a separate measurement/model pipeline and validation data.
