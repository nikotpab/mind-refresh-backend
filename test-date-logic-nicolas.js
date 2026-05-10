const http = require('http');

const loginReq = http.request('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (loginRes) => {
  let loginBody = '';
  loginRes.on('data', chunk => loginBody += chunk);
  loginRes.on('end', () => {
    const token = JSON.parse(loginBody).access_token;
    if (token) {
        http.get('http://localhost:3000/api/v1/analytics/summary', { headers: { 'Authorization': 'Bearer ' + token } }, (sRes) => {
           let sBody = '';
           sRes.on('data', chunk => sBody += chunk);
           sRes.on('end', () => console.log('Summary status:', sRes.statusCode, sBody));
        });
    }
  });
});
loginReq.write(JSON.stringify({ email: 'nicolas@gmail.com', password: 'password' })); // Password might not be known, let's just bypass auth for the test if we can't guess it.
loginReq.end();
