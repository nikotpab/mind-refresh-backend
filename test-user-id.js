const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
const db = admin.firestore();
async function run() {
    const userId = 'E8Tpg0wGPxNhLS2HxwA0'; // Nicolas
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const snapshot = await db.collection('moods').where('userId', '==', userId).get();
      
    let moods = snapshot.docs.map(doc => doc.data());
    
    moods = moods.filter(m => {
      const d = m.createdAt?.toDate ? m.createdAt.toDate() : new Date(m.createdAt);
      return d >= oneWeekAgo;
    });
    
    console.log("Count:", moods.length);
}
run();
