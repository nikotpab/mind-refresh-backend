const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
const db = admin.firestore();
async function run() {
    const users = await db.collection('users').get();
    console.log("Users:", users.docs.map(d => d.data()));
    
    const moods = await db.collection('moods').get();
    console.log("Moods:", moods.docs.map(d => d.data()));
}
run();
