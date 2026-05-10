const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
const db = admin.firestore();

async function run() {
    try {
        const snapshot = await db.collection('moods').where('userId', '==', undefined).get();
        console.log("Success", snapshot.docs.length);
    } catch (e) {
        console.log("Error:", e.message);
    }
}
run();
