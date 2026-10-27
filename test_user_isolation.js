/**
 * Automated Multi-User Scan History Data Isolation Verification Suite
 * Tests 1 to 12 as defined in the project specification.
 */

const http = require('http');

const BASE_URL = 'http://127.0.0.1:5000';

function makeRequest(method, path, body = null, token = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTestSuite() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 RUNNING COMPREHENSIVE TYRE SCAN USER ISOLATION TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
      failedCount++;
    }
  }

  try {
    // ── Setup: Create or authenticate Test User A and Test User B ─────────
    const timestamp = Date.now();
    const userA_credentials = {
      username: `usera_${timestamp}`,
      email: `usera_${timestamp}@testdomain.com`,
      password: `PasswordA_${timestamp}`,
      name: 'Pilot User A'
    };

    const userB_credentials = {
      username: `userb_${timestamp}`,
      email: `userb_${timestamp}@testdomain.com`,
      password: `PasswordB_${timestamp}`,
      name: 'Pilot User B'
    };

    // Register User A
    const regA = await makeRequest('POST', '/api/auth/register', userA_credentials);
    assert(regA.status === 201 && regA.data.success, 'Register User A', JSON.stringify(regA.data));
    const tokenA = regA.data.token;
    const userA_id = regA.data.user._id || regA.data.user.id;

    // Register User B
    const regB = await makeRequest('POST', '/api/auth/register', userB_credentials);
    assert(regB.status === 201 && regB.data.success, 'Register User B', JSON.stringify(regB.data));
    const tokenB = regB.data.token;
    const userB_id = regB.data.user._id || regB.data.user.id;

    // ── TEST 7: An unauthenticated user requests scan history ──────────────
    const test7 = await makeRequest('GET', '/api/history');
    assert(test7.status === 401, 'TEST 7: Unauthenticated request to /api/history returns 401', `Status: ${test7.status}`);

    const test7_scans = await makeRequest('GET', '/api/scans');
    assert(test7_scans.status === 401, 'TEST 7: Unauthenticated request to /api/scans returns 401', `Status: ${test7_scans.status}`);

    // ── TEST 1: User A saves a scan. User A sees it. ──────────────────────
    const scanA_payload = {
      image: 'simulated_user_a_tread_image',
      metadata: {
        tireMake: 'Pirelli P Zero Corsa',
        tireSize: '245/40 R17',
        position: 'FL',
        vehicleType: 'car',
        vehicleModel: 'Ferrari F40 User A'
      }
    };
    const saveA = await makeRequest('POST', '/api/analyze', scanA_payload, tokenA);
    assert(saveA.status === 200 && saveA.data.success, 'TEST 1: User A saves scan via /api/analyze', JSON.stringify(saveA.data));
    const scanA_id = saveA.data.scan_id;

    const histA = await makeRequest('GET', '/api/history', null, tokenA);
    const userA_has_scan = Array.isArray(histA.data) && histA.data.some(s => s._id === scanA_id);
    assert(userA_has_scan, 'TEST 1: User A sees their newly saved scan in /api/history', `Scans returned: ${histA.data.length}`);

    // ── TEST 2: User B logs in. User B cannot see User A's scan ───────────
    const histB_initial = await makeRequest('GET', '/api/history', null, tokenB);
    const userB_sees_userA = Array.isArray(histB_initial.data) && histB_initial.data.some(s => s._id === scanA_id || s.userId === userA_id);
    assert(!userB_sees_userA && histB_initial.data.length === 0, 'TEST 2: User B logs in and sees 0 scans, NOT User A scan', `User B saw ${histB_initial.data.length} records`);

    // ── TEST 3: User B saves a different scan. User B sees their own scan ──
    const scanB_payload = {
      image: 'simulated_user_b_tread_image',
      metadata: {
        tireMake: 'Michelin Pilot Sport 4S',
        tireSize: '275/35 R19',
        position: 'RR',
        vehicleType: 'car',
        vehicleModel: 'Ferrari F40 User B'
      }
    };
    const saveB = await makeRequest('POST', '/api/analyze', scanB_payload, tokenB);
    assert(saveB.status === 200 && saveB.data.success, 'TEST 3: User B saves scan via /api/analyze', JSON.stringify(saveB.data));
    const scanB_id = saveB.data.scan_id;

    const histB_after = await makeRequest('GET', '/api/history', null, tokenB);
    const userB_has_own = Array.isArray(histB_after.data) && histB_after.data.some(s => s._id === scanB_id);
    const userB_has_A = Array.isArray(histB_after.data) && histB_after.data.some(s => s._id === scanA_id);
    assert(userB_has_own && !userB_has_A && histB_after.data.length === 1, 'TEST 3: User B sees ONLY their own scan', `Count: ${histB_after.data.length}`);

    // ── TEST 4: User A logs in again. User A sees their own scan, not User B's scan ──
    const loginA = await makeRequest('POST', '/api/auth/login', {
      username: userA_credentials.username,
      password: userA_credentials.password
    });
    const reTokenA = loginA.data.token;
    const histA_recheck = await makeRequest('GET', '/api/history', null, reTokenA);
    const userA_sees_A = Array.isArray(histA_recheck.data) && histA_recheck.data.some(s => s._id === scanA_id);
    const userA_sees_B = Array.isArray(histA_recheck.data) && histA_recheck.data.some(s => s._id === scanB_id);
    assert(userA_sees_A && !userA_sees_B && histA_recheck.data.length === 1, 'TEST 4: User A sees only User A scan, not User B scan', `Count: ${histA_recheck.data.length}`);

    // ── TEST 5: User B attempts to request User A's scan directly by ID ──
    const directAccessA = await makeRequest('GET', `/api/scans/${scanA_id}`, null, tokenB);
    assert(directAccessA.status === 404, 'TEST 5: User B denied direct GET /api/scans/:id on User A record (returns 404)', `Status: ${directAccessA.status}`);

    // ── TEST 6: User B attempts to modify or delete User A's scan ──────────
    const deleteA = await makeRequest('DELETE', `/api/scans/${scanA_id}`, null, tokenB);
    assert(deleteA.status === 404, 'TEST 6: User B denied DELETE /api/scans/:id on User A record (returns 404)', `Status: ${deleteA.status}`);

    const patchA = await makeRequest('PUT', `/api/scans/${scanA_id}`, { treadDepthMm: 9.9 }, tokenB);
    assert(patchA.status === 404, 'TEST 6: User B denied PUT /api/scans/:id on User A record (returns 404)', `Status: ${patchA.status}`);

    // Verify User A's scan was NOT modified or deleted
    const verifyA = await makeRequest('GET', `/api/scans/${scanA_id}`, null, tokenA);
    assert(verifyA.status === 200 && verifyA.data._id === scanA_id, 'TEST 6: User A record remains intact and undamaged', `Status: ${verifyA.status}`);

    // ── TEST 8: Refreshing Previous Scan History loads only that user's records ──
    const refreshA1 = await makeRequest('GET', '/api/history', null, tokenA);
    const refreshA2 = await makeRequest('GET', '/api/history', null, tokenA);
    assert(refreshA1.data.length === 1 && refreshA2.data.length === 1 && refreshA1.data[0]._id === scanA_id, 'TEST 8: Repeated page refresh consistently loads only user records');

    // ── TEST 9: Query parameter spoofing attempt ───────────────────────────
    // Attacker passes ?userId=<User_A_id> or ?email=<User_A_email> with User B's token
    const spoofParams = await makeRequest('GET', `/api/history?userId=${userA_id}&email=${userA_credentials.email}`, null, tokenB);
    const spoofExposed = Array.isArray(spoofParams.data) && spoofParams.data.some(s => s._id === scanA_id || s.userId === userA_id);
    assert(!spoofExposed && spoofParams.data.length === 1 && spoofParams.data[0]._id === scanB_id, 'TEST 9: Query parameter spoofing (?userId=UserA) is completely ignored; only User B data returned');

    // ── TEST 10: Existing record with no owner is never exposed ───────────
    // Existing database contains scan_1792814570022 with userId: ""
    const checkUnownedA = await makeRequest('GET', '/api/scans/scan_1792814570022', null, tokenA);
    const checkUnownedB = await makeRequest('GET', '/api/scans/scan_1792814570022', null, tokenB);
    const checkUnownedHistA = histA_recheck.data.some(s => s._id === 'scan_1792814570022');
    const checkUnownedHistB = histB_after.data.some(s => s._id === 'scan_1792814570022');
    assert(checkUnownedA.status === 404 && checkUnownedB.status === 404 && !checkUnownedHistA && !checkUnownedHistB, 'TEST 10: Unowned legacy record (empty userId) is quarantined and never exposed to any user');

    // ── TEST 11: Two users save scans at approximately the same time ───────
    const [concurrentA, concurrentB] = await Promise.all([
      makeRequest('POST', '/api/analyze', { image: 'concurrent_A', metadata: { tireMake: 'Tyre A Simultaneous' } }, tokenA),
      makeRequest('POST', '/api/analyze', { image: 'concurrent_B', metadata: { tireMake: 'Tyre B Simultaneous' } }, tokenB)
    ]);
    assert(concurrentA.status === 200 && concurrentB.status === 200, 'TEST 11: Simultaneous scan creation succeeds for both users');

    const histA_after_concurrent = await makeRequest('GET', '/api/history', null, tokenA);
    const histB_after_concurrent = await makeRequest('GET', '/api/history', null, tokenB);
    const allA_are_userA = histA_after_concurrent.data.every(s => s.userId === userA_id);
    const allB_are_userB = histB_after_concurrent.data.every(s => s.userId === userB_id);
    assert(allA_are_userA && allB_are_userB && histA_after_concurrent.data.length === 2 && histB_after_concurrent.data.length === 2, 'TEST 11: Simultaneous scans are correctly and strictly assigned to their respective owners');

    // ── TEST 12: Submitting another user's ID in request body is ignored ───
    const spoofBody = {
      image: 'spoof_body_image',
      metadata: {
        tireMake: 'Tampered Owner Tyre',
        userId: userA_id,              // User B tries to claim User A's ID
        userEmail: userA_credentials.email,
        username: userA_credentials.username
      }
    };
    const spoofSave = await makeRequest('POST', '/api/analyze', spoofBody, tokenB);
    assert(spoofSave.status === 200, 'TEST 12: Save request processed', `Status: ${spoofSave.status}`);
    const tamperedScanId = spoofSave.data.scan_id;

    // Verify in User B's history
    const histB_tamper = await makeRequest('GET', '/api/history', null, tokenB);
    const tamperedScanInB = histB_tamper.data.find(s => s._id === tamperedScanId);
    assert(tamperedScanInB && tamperedScanInB.userId === userB_id && tamperedScanInB.userId !== userA_id, 'TEST 12: Backend ignored client-submitted userId and assigned true authenticated User B ID');

    // Verify User A NEVER sees the tampered scan
    const histA_tamper = await makeRequest('GET', '/api/history', null, tokenA);
    const tamperedScanInA = histA_tamper.data.some(s => s._id === tamperedScanId);
    assert(!tamperedScanInA, 'TEST 12: User A does NOT see scan created with spoofed User A ID');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(failedCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
    process.exit(1);
  }
}

runTestSuite();
