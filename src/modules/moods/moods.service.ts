import { Injectable, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';

@Injectable()
export class MoodsService {
  private collection = 'moods';

  constructor(private firebaseService: FirebaseService) {}

  async create(userId: string, data: any) {
    // Validate: only one check-in per day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();
      
    const todayMoods = snapshot.docs.map(doc => doc.data()).filter(m => {
      const d = m.createdAt?.toDate ? m.createdAt.toDate() : new Date(m.createdAt);
      return d >= startOfDay;
    });

    if (todayMoods.length > 0) {
      throw new BadRequestException('Ya has realizado tu check-in emocional el día de hoy.');
    }

    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const moodRecord = {
      id: docRef.id,
      userId,
      emotion: data.emotion,
      notes: data.notes || '',
      createdAt: new Date(),
    };
    await docRef.set(moodRecord);
    return moodRecord;
  }

  async findByUserId(userId: string) {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();
      
    return snapshot.docs.map(doc => {
      const data = doc.data();
      let isoDate = new Date().toISOString();
      try {
        if (data.createdAt) {
          const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (!isNaN(d.getTime())) {
            isoDate = d.toISOString();
          }
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('Error parsing date for record:', doc.id, message);
      }
      return { ...data, createdAt: isoDate };
    });
  }

  async getWeeklySummary(userId: string) {
    console.log("getWeeklySummary called for userId:", userId);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();
      
    // Filter by date and sort in memory to avoid needing a composite index
    let moods = snapshot.docs.map(doc => doc.data());
    console.log("Total moods found before filter:", moods.length);
    
    moods = moods.filter(m => {
      const d = m.createdAt?.toDate ? m.createdAt.toDate() : new Date(m.createdAt);
      return d >= oneWeekAgo;
    });
    
    moods.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    const checkinsCount = moods.length;
    
    // Format dates to ISO strings so frontend parses them flawlessly
    const formattedMoods = moods.map(m => ({
      ...m,
      createdAt: m.createdAt?.toDate ? m.createdAt.toDate().toISOString() : new Date(m.createdAt).toISOString()
    }));
    
    console.log("Returning summary with count:", checkinsCount);
    return {
      checkinsCount,
      totalPossible: 5,
      lastMoods: formattedMoods.slice(0, 5)
    };
  }

  async findAll() {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .get();
      
    return snapshot.docs.map(doc => {
      const data = doc.data();
      let isoDate = new Date().toISOString();
      try {
        if (data.createdAt) {
          const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (!isNaN(d.getTime())) {
            isoDate = d.toISOString();
          }
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('Error parsing date for record:', doc.id, message);
      }
      return { ...data, createdAt: isoDate };
    });
  }
}
