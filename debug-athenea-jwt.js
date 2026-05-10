const jwt = require('jsonwebtoken');
const http = require('http');

// Generate token for Athenea (E8Tpg0wGPxNhLS2HxwA0)
const token = jwt.sign(
    { email: 'nicolas@gmail.com', sub: 'E8Tpg0wGPxNhLS2HxwA0', role: 'Colaborador' }, 
    'super_secret_mind_refresh_key_2026'
);

http.get('http://localhost:3000/api/v1/analytics/summary', { headers: { 'Authorization': 'Bearer ' + token } }, (sRes) => {
   let sBody = '';
   sRes.on('data', chunk => sBody += chunk);
   sRes.on('end', () => {
       console.log('Summary status:', sRes.statusCode);
       console.log('Summary data:', JSON.parse(sBody));
   });
});