const http = require('http');

const loginReq = http.request('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (loginRes) => {
  let loginBody = '';
  loginRes.on('data', chunk => loginBody += chunk);
  loginRes.on('end', () => {
    const response = JSON.parse(loginBody);
    console.log("Login response:", response);
    const token = response.access_token;
    if (token) {
        http.get('http://localhost:3000/api/v1/analytics/summary', { headers: { 'Authorization': 'Bearer ' + token } }, (sRes) => {
           let sBody = '';
           sRes.on('data', chunk => sBody += chunk);
           sRes.on('end', () => console.log('Summary status:', sRes.statusCode, sBody));
        });
    }
  });
});
// Using Nicolas' credentials from the database dump
loginReq.write(JSON.stringify({ email: 'nicolas@gmail.com', password: 'password123' })); 
loginReq.end();
