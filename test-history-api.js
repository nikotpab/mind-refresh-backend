const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { email: 'nicolas@gmail.com', sub: 'E8Tpg0wGPxNhLS2HxwA0', role: 'Colaborador' }, 
    'super_secret_mind_refresh_key_2026'
);

http.get('http://localhost:3000/api/v1/moods', { headers: { 'Authorization': 'Bearer ' + token } }, (res) => {
   let body = '';
   res.on('data', chunk => body += chunk);
   res.on('end', () => {
       console.log('Status:', res.statusCode);
       console.log('Data length:', JSON.parse(body).length);
   });
});
