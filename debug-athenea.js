const http = require('http');

const loginReq = http.request('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (loginRes) => {
  let loginBody = '';
  loginRes.on('data', chunk => loginBody += chunk);
  loginRes.on('end', () => {
    const response = JSON.parse(loginBody);
    console.log("Login user:", response.user);
    const token = response.access_token;
    if (token) {
        http.get('http://localhost:3000/api/v1/analytics/summary', { headers: { 'Authorization': 'Bearer ' + token } }, (sRes) => {
           let sBody = '';
           sRes.on('data', chunk => sBody += chunk);
           sRes.on('end', () => {
               console.log('Summary status:', sRes.statusCode);
               console.log('Summary data:', JSON.parse(sBody));
           });
        });
    } else {
        console.log("No token! Did login fail?");
    }
  });
});
loginReq.write(JSON.stringify({ email: 'nicolas@gmail.com', password: 'password123' })); // Password might fail... let's check
loginReq.end();
