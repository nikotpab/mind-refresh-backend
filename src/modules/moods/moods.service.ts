import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';

@Injectable()
export class MoodsService {
  private collection = 'moods';

  constructor(private firebaseService: FirebaseService) {}

  async create(userId: string, data: any) {
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
      
    return snapshot.docs.map(doc => doc.data());
  }

  async findAll() {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .get();
      
    return snapshot.docs.map(doc => doc.data());
  }
}
