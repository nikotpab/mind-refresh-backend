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
      // Create a mood record
      const moodReq = http.request('http://localhost:3000/api/v1/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
      }, (moodRes) => {
        moodRes.on('data', () => {});
        moodRes.on('end', () => {
            console.log('Mood created:', moodRes.statusCode);
            
            // Now test endpoints
            http.get('http://localhost:3000/api/v1/notifications', { headers: { 'Authorization': 'Bearer ' + token } }, (nRes) => {
               let nBody = '';
               nRes.on('data', chunk => nBody += chunk);
               nRes.on('end', () => console.log('Notifications status:', nRes.statusCode, nBody));
            });
            http.get('http://localhost:3000/api/v1/analytics/summary', { headers: { 'Authorization': 'Bearer ' + token } }, (sRes) => {
               let sBody = '';
               sRes.on('data', chunk => sBody += chunk);
               sRes.on('end', () => console.log('Summary status:', sRes.statusCode, sBody));
            });
        });
      });
      moodReq.write(JSON.stringify({ emotion: 'sentiment_satisfied', notes: 'Feeling good' }));
      moodReq.end();
    }
  });
});
loginReq.write(JSON.stringify({ email: 'testapi@example.com', password: 'password123' }));
loginReq.end();
