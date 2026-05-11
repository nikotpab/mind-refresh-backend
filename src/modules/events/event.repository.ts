import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';

@Injectable()
export class EventRepository {
  private readonly collection = 'events';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(data: any): Promise<any> {
    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const eventRecord = {
      ...data,
      id: docRef.id,
      createdAt: new Date(),
    };
    await docRef.set(eventRecord);
    return eventRecord;
  }

  async findById(id: string): Promise<any> {
    const doc = await this.firebaseService.db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async findAll(limitParam: number = 20, lastId?: string): Promise<any[]> {
    let query = this.firebaseService.db
      .collection(this.collection)
      .orderBy('date', 'desc')
      .limit(limitParam);

    if (lastId) {
      const lastDoc = await this.firebaseService.db.collection(this.collection).doc(lastId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
      
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async update(id: string, data: any): Promise<void> {
    await this.firebaseService.db.collection(this.collection).doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.firebaseService.db.collection(this.collection).doc(id).delete();
  }
}
