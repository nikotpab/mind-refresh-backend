const http = require('http');
const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
const db = admin.firestore();

async function run() {
    // Generate a custom token for Nicolas directly
    const customToken = await admin.auth().createCustomToken('E8Tpg0wGPxNhLS2HxwA0');
    console.log("Custom token:", customToken);
    
    // We can't use custom token for NestJS JWT, because we use our own JWT.
    // Let's just bypass auth.
}
run();
