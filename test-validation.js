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
      const moodReq = http.request('http://localhost:3000/api/v1/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
      }, (moodRes) => {
        let b = '';
        moodRes.on('data', chunk => b+=chunk);
        moodRes.on('end', () => {
            console.log('Mood response:', moodRes.statusCode, b);
        });
      });
      moodReq.write(JSON.stringify({ emotion: 'sentiment_satisfied', notes: 'Feeling good' }));
      moodReq.end();
    }
  });
});
loginReq.write(JSON.stringify({ email: 'testapi@example.com', password: 'password123' }));
loginReq.end();
