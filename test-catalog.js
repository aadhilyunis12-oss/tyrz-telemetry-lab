async function testCatalog() {
  const url = "http://localhost:5000/api/catalog/options?category=car&make=Maruti%20Suzuki&model=Swift&year=2023&variant=ZXi&position=front-left";
  const res = await fetch(url);
  const data = await res.json();
  console.log("Auto-Selected Size:", data.autoSelectedSize);
  console.log("Matching Tyres Count:", data.totalTyres);
  console.log("First Tyre Brand/Model:", data.tyres[0]?.brand, data.tyres[0]?.model);

  // Test inspection submission
  const inspRes = await fetch("http://localhost:5000/api/inspections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vehicleCategory: "car",
      vehicleMake: "Maruti Suzuki",
      vehicleModel: "Swift",
      modelYear: 2023,
      vehicleVariant: "ZXi (demo)",
      tyreBrand: "MRF",
      tyreModel: "ZVTV",
      tyreSize: "185/65R15",
      tyrePosition: "front-left",
      odometerKm: 42000,
      calibrationReferenceKey: "us-quarter"
    })
  });
  const inspData = await inspRes.json();
  console.log("Inspection Saved:", inspData.success, inspData.inspection?._id);
}

testCatalog().catch(console.error);
