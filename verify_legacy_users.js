const http = require('http');
const fs = require('fs');
let jwt;
try {
  jwt = require('./backend/node_modules/jsonwebtoken');
} catch (e) {
  jwt = require('jsonwebtoken');
}

function req(path, method = 'GET', body = null, token = null) {
  return new Promise((res, rej) => {
    const url = new URL(path, 'http://127.0.0.1:5000');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const r = http.request(url, { method, headers }, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, data: JSON.parse(d || '{}') }));
    });
    r.on('error', rej);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function verify() {
  console.log('--- Verifying aadhilyunis (Account in User Screenshot) ---');
  const secret = 'd406469c6ed275217583cfdfbed8797f00dacaa60f6b75afe40e2c879d180ba6';
  const aadhilToken = jwt.sign({ id: 'usr_1791726444920', username: 'aadhilyunis' }, secret, { expiresIn: '7d' });
  const respAadhil = await req('/api/history', 'GET', null, aadhilToken);
  console.log('Status:', respAadhil.status);
  console.log('Scans count for aadhilyunis:', respAadhil.data.length);
  respAadhil.data.forEach((s, idx) => {
    console.log(`Scan ${idx + 1}: ${s.metadata?.tireMake} (${s.metadata?.position}) | ${s.treadDepthMm} mm | ${s.condition} | ${s.remainingKm} km`);
  });

  console.log('\n--- Verifying Pilot Account (usr_pilot_f40) ---');
  const pilotLogin = await req('/api/auth/login', 'POST', { username: 'pilot@f40.it', password: 'f40pass' });
  console.log('Pilot login status:', pilotLogin.status);
  const respPilot = await req('/api/history', 'GET', null, pilotLogin.data.token);
  console.log('Scans count for Pilot:', respPilot.data.length);

  console.log('\n--- Verifying Cross-Account Direct Access Block ---');
  if (respAadhil.data.length > 0) {
    const aadhilScanId = respAadhil.data[0]._id;
    const crossAccess = await req(`/api/scans/${aadhilScanId}`, 'GET', null, pilotLogin.data.token);
    console.log(`Pilot accessing aadhil scan (${aadhilScanId}): HTTP ${crossAccess.status} (Expected 404)`);
  }
}

verify();
