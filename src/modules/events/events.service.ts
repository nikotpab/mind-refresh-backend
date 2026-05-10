import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';

@Injectable()
export class EventsService {
  private collection = 'events';

  constructor(private firebaseService: FirebaseService) {}

  async create(data: any) {
    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const eventRecord = {
      id: docRef.id,
      title: data.title,
      description: data.description,
      date: data.date,
      createdBy: data.createdBy,
      createdAt: new Date(),
    };
    await docRef.set(eventRecord);
    return eventRecord;
  }

  async findAll() {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .get();
      
    return snapshot.docs.map(doc => doc.data());
  }
}
