const admin = require('firebase-admin');
const path = require('path');
const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});
const db = admin.firestore();

async function run() {
    const userId = 'E8Tpg0wGPxNhLS2HxwA0'; // Nicolas
    
    // Exact logic from moods.service.ts
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const snapshot = await db.collection('moods').where('userId', '==', userId).get();
    let moods = snapshot.docs.map(doc => doc.data());
    
    console.log("Total moods from DB:", moods.length);

    moods = moods.filter(m => {
      const d = m.createdAt?.toDate ? m.createdAt.toDate() : new Date(m.createdAt);
      return d >= oneWeekAgo;
    });
    
    console.log("Moods after filter:", moods.length);

    moods.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    const formattedMoods = moods.map(m => ({
      ...m,
      createdAt: m.createdAt?.toDate ? m.createdAt.toDate().toISOString() : new Date(m.createdAt).toISOString()
    }));
    
    console.log("Summary data:", {
      checkinsCount: moods.length,
      totalPossible: 5,
      lastMoods: formattedMoods.slice(0, 5)
    });
}
run();