const http = require('http');

const data = JSON.stringify({
  email: 'testapi@example.com',
  password: 'password123',
  name: 'Test API',
  role: 'Administrador'
});

const req = http.request('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Register status:', res.statusCode);
    if (res.statusCode === 201 || res.statusCode === 409) {
      // Now login
      const loginReq = http.request('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (loginRes) => {
        let loginBody = '';
        loginRes.on('data', chunk => loginBody += chunk);
        loginRes.on('end', () => {
          console.log('Login status:', loginRes.statusCode);
          const token = JSON.parse(loginBody).access_token;
          if (token) {
            // Test notifications
            http.get('http://localhost:3000/api/v1/notifications', { headers: { 'Authorization': 'Bearer ' + token } }, (nRes) => {
               let nBody = '';
               nRes.on('data', chunk => nBody += chunk);
               nRes.on('end', () => {
                 console.log('Notifications status:', nRes.statusCode);
                 console.log('Notifications response:', nBody);
               });
            });
            // Test analytics summary
            http.get('http://localhost:3000/api/v1/analytics/summary', { headers: { 'Authorization': 'Bearer ' + token } }, (sRes) => {
               let sBody = '';
               sRes.on('data', chunk => sBody += chunk);
               sRes.on('end', () => {
                 console.log('Summary status:', sRes.statusCode);
                 console.log('Summary response:', sBody);
               });
            });
          }
        });
      });
      loginReq.write(JSON.stringify({ email: 'testapi@example.com', password: 'password123' }));
      loginReq.end();
    } else {
      console.log('Register response:', body);
    }
  });
});
req.write(data);
req.end();
