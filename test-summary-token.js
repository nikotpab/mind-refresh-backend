const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

const jwt = require('jsonwebtoken');

// Using the same secret as auth.module.ts ('super_secret_mind_refresh_key_2026')
const token = jwt.sign(
    { email: 'nicolas@gmail.com', sub: 'E8Tpg0wGPxNhLS2HxwA0', role: 'Colaborador' }, 
    'super_secret_mind_refresh_key_2026'
);

const http = require('http');
http.get('http://localhost:3000/api/v1/analytics/summary', { headers: { 'Authorization': 'Bearer ' + token } }, (sRes) => {
   let sBody = '';
   sRes.on('data', chunk => sBody += chunk);
   sRes.on('end', () => console.log('Summary status:', sRes.statusCode, sBody));
});
