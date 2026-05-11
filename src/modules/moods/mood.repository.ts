import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';

@Injectable()
export class MoodRepository {
  private readonly collection = 'moods';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(data: any): Promise<any> {
    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const moodRecord = {
      ...data,
      id: docRef.id,
      createdAt: new Date(),
    };
    await docRef.set(moodRecord);
    return moodRecord;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();
      
    return snapshot.docs.map(doc => doc.data());
  }

  async findAll(limitParam: number = 50, lastId?: string): Promise<any[]> {
    let query = this.firebaseService.db
      .collection(this.collection)
      .orderBy('createdAt', 'desc')
      .limit(limitParam);

    if (lastId) {
      const lastDoc = await this.firebaseService.db.collection(this.collection).doc(lastId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
      
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
  }
}
