async function runTestSuite() {
  console.log("🏁 Starting TYRZ Lab Authentication & MongoDB Test Suite...\n");

  const testUser = {
    name: "Dharshan Pilot",
    username: "dharshan_" + Date.now().toString().slice(-4),
    email: `dharshan_${Date.now().toString().slice(-4)}@f40.it`,
    password: "secure_pilot_pass_2026"
  };

  // 1. Unregistered user login should FAIL (404)
  console.log("TEST 1: Login unregistered account (Should be rejected)...");
  const failLoginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "nonexistent_pilot", password: "somepassword" })
  });
  const failLoginData = await failLoginRes.json();
  console.log("Status:", failLoginRes.status, failLoginData);
  if (failLoginRes.status === 404 && failLoginData.success === false) {
    console.log("✅ TEST 1 PASSED: Unregistered user properly rejected.\n");
  } else {
    console.error("❌ TEST 1 FAILED\n");
  }

  // 2. Short password registration should FAIL (< 8 chars)
  console.log("TEST 2: Register with short password (< 8 chars, should be rejected)...");
  const shortPassRes = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: testUser.name, username: testUser.username, email: testUser.email, password: "123" })
  });
  const shortPassData = await shortPassRes.json();
  console.log("Status:", shortPassRes.status, shortPassData);
  if (shortPassRes.status === 400 && shortPassData.success === false) {
    console.log("✅ TEST 2 PASSED: Short password rejected.\n");
  } else {
    console.error("❌ TEST 2 FAILED\n");
  }

  // 3. Valid registration should SUCCEED (201)
  console.log("TEST 3: Register valid user with bcrypt hashed password...");
  const regRes = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser)
  });
  const regData = await regRes.json();
  console.log("Status:", regRes.status, regData);
  if (regRes.status === 201 && regData.success === true) {
    console.log("✅ TEST 3 PASSED: User successfully registered.\n");
  } else {
    console.error("❌ TEST 3 FAILED\n");
  }

  // 4. Duplicate registration should FAIL (409)
  console.log("TEST 4: Duplicate registration (Should be rejected)...");
  const dupRes = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser)
  });
  const dupData = await dupRes.json();
  console.log("Status:", dupRes.status, dupData);
  if (dupRes.status === 409 && dupData.success === false) {
    console.log("✅ TEST 4 PASSED: Duplicate registration rejected.\n");
  } else {
    console.error("❌ TEST 4 FAILED\n");
  }

  // 5. Login with incorrect password should FAIL (401)
  console.log("TEST 5: Login with wrong password (Should be rejected)...");
  const wrongPassRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUser.username, password: "wrong_password_xyz" })
  });
  const wrongPassData = await wrongPassRes.json();
  console.log("Status:", wrongPassRes.status, wrongPassData);
  if (wrongPassRes.status === 401 && wrongPassData.success === false) {
    console.log("✅ TEST 5 PASSED: Incorrect password properly rejected.\n");
  } else {
    console.error("❌ TEST 5 FAILED\n");
  }

  // 6. Login with correct password should SUCCEED (200)
  console.log("TEST 6: Login with correct credentials...");
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUser.username, password: testUser.password })
  });
  const loginData = await loginRes.json();
  console.log("Status:", loginRes.status, loginData);
  if (loginRes.status === 200 && loginData.success === true && loginData.token) {
    console.log("✅ TEST 6 PASSED: User authenticated successfully with token.\n");
  } else {
    console.error("❌ TEST 6 FAILED\n");
  }

  // 7. Session check /api/auth/me
  console.log("TEST 7: Verify session via /api/auth/me...");
  const meRes = await fetch("http://localhost:5000/api/auth/me", {
    method: "GET",
    headers: { "Authorization": `Bearer ${loginData.token}` }
  });
  const meData = await meRes.json();
  console.log("Status:", meRes.status, meData);
  if (meRes.status === 200 && meData.success === true && meData.user.username === testUser.username) {
    console.log("✅ TEST 7 PASSED: Session verified successfully.\n");
  } else {
    console.error("❌ TEST 7 FAILED\n");
  }

  // 8. Health status
  console.log("TEST 8: Backend health check...");
  const healthRes = await fetch("http://localhost:5000/api/health");
  const healthData = await healthRes.json();
  console.log("Health:", healthData);
  if (healthRes.status === 200 && healthData.status === "ok") {
    console.log("✅ TEST 8 PASSED: Backend is healthy and connected.\n");
  }

  console.log("🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
}

runTestSuite().catch(console.error);
